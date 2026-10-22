from common import S, ApiError, get_config, refund_commission
from push import send_push, dispatcher_ids, drivers_for_trip, trip_line
import tg

LIVE = ('enroute', 'arrived', 'in_progress')
OPEN = ('new', 'assigned', 'enroute', 'arrived', 'in_progress')

CLIENT_PUSH = {
    'enroute': ('Машина выехала', 'Водитель выехал к вам. Следите на карте'),
    'arrived': ('Машина приехала', 'Водитель на месте и ждёт вас'),
    'in_progress': ('Поездка началась', 'Счастливого пути!'),
    'done': ('Поездка завершена', 'Оцените поездку, это поможет нам'),
}


def check_blocking(cur, driver_id):
    cfg = get_config(cur)
    cur.execute(
        f"""SELECT count(*) FILTER (WHERE created_at > now() - interval '24 hours') AS d1,
                   count(*) FILTER (WHERE created_at > now() - interval '7 days') AS d7
            FROM {S}.app_driver_events WHERE driver_id = %s AND kind = 'cancel'""",
        (driver_id,),
    )
    c = cur.fetchone()
    if c['d1'] >= cfg['cancel_limit_24h'] or c['d7'] >= cfg['cancel_limit_7d']:
        cur.execute(
            f"UPDATE {S}.app_drivers SET status = 'blocked', on_line = false, block_reason = %s WHERE user_id = %s AND status = 'approved'",
            ('Частые отмены заказов', driver_id),
        )
        if cur.rowcount:
            send_push(cur, [driver_id], 'Аккаунт заблокирован', 'Из-за частых отмен заказов. Свяжитесь с диспетчером', '/app/driver', 'blocked')
            send_push(cur, dispatcher_ids(cur), 'Водитель заблокирован', f'Водитель #{driver_id}: частые отмены', '/app/office-k7x2', f'blocked-{driver_id}')
            return True
    return False


def notify_status(cur, trip_id, status):
    cur.execute(f"SELECT client_id FROM {S}.app_trips WHERE id = %s", (trip_id,))
    t = cur.fetchone()
    if t and status in CLIENT_PUSH:
        title, body = CLIENT_PUSH[status]
        send_push(cur, [t['client_id']], title, body, '/app/client', f'trip-{trip_id}')
    if status != 'cancelled':
        tg.notify_client(cur, trip_id)
    if status in ('arrived', 'done'):
        tg.disp(f"{'📍 Водитель на месте' if status == 'arrived' else '🏁 Поездка завершена'} · заказ №{trip_id}", trip_id)


def driver_cancel(cur, driver_id, trip_id):
    cur.execute(
        f"SELECT id, status, driver_id FROM {S}.app_trips WHERE id = %s FOR UPDATE", (trip_id,)
    )
    t = cur.fetchone()
    if not t or t['driver_id'] != driver_id or t['status'] not in ('assigned', 'enroute', 'arrived'):
        raise ApiError(400, 'Заказ нельзя отказать')
    refund_commission(cur, trip_id)
    cur.execute(
        f"""UPDATE {S}.app_trips SET driver_id = NULL, status = 'new', assigned_by = NULL, reminder_stage = 0,
            deferred_pushed = true, updated_at = now() WHERE id = %s""",
        (trip_id,),
    )
    cur.execute(f"INSERT INTO {S}.app_driver_events (driver_id, kind, trip_id) VALUES (%s, 'cancel', %s)", (driver_id, trip_id))
    cur.execute(f"UPDATE {S}.app_offers SET status = 'withdrawn' WHERE trip_id = %s AND driver_id = %s", (trip_id, driver_id))
    cur.execute(f"UPDATE {S}.app_offers SET status = 'active' WHERE trip_id = %s AND status = 'lost'", (trip_id,))
    blocked = check_blocking(cur, driver_id)
    cur.execute(f"SELECT * FROM {S}.app_trips WHERE id = %s", (trip_id,))
    tr = cur.fetchone()
    send_push(cur, [tr['client_id']], 'Водитель отказался', 'Мы уже ищем вам другую машину', '/app/client', f'trip-{trip_id}')
    tg.disp(f"⚠️ Водитель отказался · заказ №{trip_id} снова без водителя\n{trip_line(tr)}", trip_id)
    tg.notify_client(cur, trip_id, '🔎 Водитель отказался, уже ищем другую машину')
    send_push(cur, dispatcher_ids(cur), 'Водитель отказался от заказа', f'Заказ №{trip_id} снова ищет водителя', '/app/office-k7x2', f'trip-{trip_id}')
    send_push(cur, drivers_for_trip(cur, tr['tariff']), 'Заказ снова свободен', trip_line(tr), '/app/driver', f'trip-{trip_id}')
    return blocked


_LAST_TICK = [0.0]


def tick(cur):
    import time
    now = time.time()
    if now - _LAST_TICK[0] < 6:
        return
    _LAST_TICK[0] = now
    import fleet
    fleet.ring_tick(cur)
    cfg = get_config(cur)
    delay = int(cfg['priority_delay_sec'])
    cur.execute(
        f"""UPDATE {S}.app_trips SET deferred_pushed = true
            WHERE status = 'new' AND driver_id IS NULL AND NOT deferred_pushed
              AND created_at <= now() - make_interval(secs => %s) RETURNING *""",
        (delay,),
    )
    for t in cur.fetchall():
        rest = drivers_for_trip(cur, t['tariff'], exclude_priority=True)
        send_push(cur, rest, 'Новый заказ', f"{trip_line(t)} · {int(t['price'])} ₽", '/app/driver', f"trip-{t['id']}")

    cur.execute(
        f"""UPDATE {S}.app_trips SET reminder_stage = 1
            WHERE status = 'new' AND driver_id IS NULL AND scheduled_at IS NULL AND reminder_stage < 1
              AND created_at <= now() - make_interval(mins => %s) RETURNING *""",
        (int(cfg['dispatcher_alert_min']),),
    )
    for t in cur.fetchall():
        send_push(cur, dispatcher_ids(cur), 'Нужен водитель', f"Заказ №{t['id']} ждёт уже {int(cfg['dispatcher_alert_min'])} мин. {trip_line(t)}", '/app/office-k7x2', f"trip-{t['id']}")
        tg.disp(f"⏰ НИКТО НЕ ВЗЯЛ ЗАКАЗ №{t['id']} уже {int(cfg['dispatcher_alert_min'])} мин!\n{trip_line(t)} · {int(t['price'])} ₽\nНазначьте водителя: https://taxidalnyack.ru/app/office-k7x2", t['id'])

    cur.execute(
        f"""SELECT m.trip_id, m.text, m.sender_role FROM {S}.app_messages m
            WHERE m.sender_role IN ('client', 'driver') AND m.created_at <= now() - make_interval(mins => %s)
              AND m.created_at > now() - interval '2 hours'
              AND NOT EXISTS (SELECT 1 FROM {S}.app_messages x WHERE x.trip_id = m.trip_id AND x.id > m.id)
              AND NOT EXISTS (SELECT 1 FROM {S}.app_rate_log r WHERE r.key = 'chatnag:' || m.id)""",
        (int(cfg['dispatcher_alert_min']),),
    )
    for m in cur.fetchall()[:5]:
        cur.execute(f"SELECT max(id) AS id FROM {S}.app_messages WHERE trip_id = %s", (m['trip_id'],))
        mid = cur.fetchone()['id']
        cur.execute(f"INSERT INTO {S}.app_rate_log (key) VALUES (%s)", (f'chatnag:{mid}',))
        if m['sender_role'] == 'client':
            tg.disp(f"🔔 Пассажир ждёт ответа {int(cfg['dispatcher_alert_min'])} мин · заказ №{m['trip_id']}\n\n{m['text']}\n\n↩️ Ответьте на это сообщение", m['trip_id'])

    cur.execute(
        f"""UPDATE {S}.app_trips SET reminder_stage = 2
            WHERE status = 'assigned' AND scheduled_at IS NOT NULL AND reminder_stage < 2
              AND scheduled_at <= now() + interval '15 minutes' RETURNING *"""
    )
    for t in cur.fetchall():
        send_push(cur, [t['driver_id']], 'Предзаказ через 15 минут', trip_line(t), '/app/driver', f"pre-{t['id']}")
        send_push(cur, [t['client_id']], 'Предзаказ через 15 минут', trip_line(t), '/app/client', f"pre-{t['id']}")

    cur.execute(
        f"""UPDATE {S}.app_trips SET reminder_stage = 1
            WHERE status = 'assigned' AND scheduled_at IS NOT NULL AND reminder_stage < 1
              AND scheduled_at <= now() + interval '60 minutes' RETURNING *"""
    )
    for t in cur.fetchall():
        send_push(cur, [t['driver_id']], 'Предзаказ через час', trip_line(t), '/app/driver', f"pre-{t['id']}")
        send_push(cur, [t['client_id']], 'Предзаказ через час', trip_line(t), '/app/client', f"pre-{t['id']}")

    cur.execute(
        f"""UPDATE {S}.app_trips SET reminder_stage = 1
            WHERE status = 'new' AND scheduled_at IS NOT NULL AND reminder_stage < 1
              AND scheduled_at <= now() + interval '3 hours' RETURNING *"""
    )
    for t in cur.fetchall():
        send_push(cur, dispatcher_ids(cur), 'Предзаказ без водителя', f"№{t['id']}: {trip_line(t)}", '/app/office-k7x2', f"pre-{t['id']}")
        send_push(cur, drivers_for_trip(cur, t['tariff']), 'Предзаказ ждёт водителя', trip_line(t), '/app/driver', f"pre-{t['id']}")
