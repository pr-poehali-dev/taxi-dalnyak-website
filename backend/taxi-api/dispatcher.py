import chat
import trips
from common import S, ApiError, TARIFFS, ACTIVE, get_config, log_balance, refund_commission, charge_commission, clean, DEFAULT_CONFIG
from push import send_push, dispatcher_ids, drivers_for_trip, trip_line

STATUSES = ('new', 'assigned', 'enroute', 'arrived', 'in_progress', 'done', 'cancelled')
ONLINE = "(dr.on_line AND dr.last_seen > now() - interval '90 seconds')"


def poll(cur, user, body):
    trips.tick(cur)
    cur.execute(
        f"""SELECT t.id, t.from_text, t.to_text, t.comment, t.price, t.base_price, t.status, t.tariff, t.region,
                   t.distance_km, t.scheduled_at, t.created_at, t.driver_id, t.assigned_by, t.commission, t.rating,
                   t.rating_comment, t.cancelled_by, t.pay_method, t.from_city, t.from_street, t.from_house,
                   c.phone AS client_phone, c.name AS client_name,
                   d.name AS driver_name, d.phone AS driver_phone, dr.car_model, dr.car_plate,
                   (SELECT max(m.id) FROM {S}.app_messages m WHERE m.trip_id = t.id) AS last_msg_id,
                   (SELECT m.sender_role FROM {S}.app_messages m WHERE m.trip_id = t.id ORDER BY m.id DESC LIMIT 1) AS last_msg_role
            FROM {S}.app_trips t
            JOIN {S}.app_users c ON c.id = t.client_id
            LEFT JOIN {S}.app_users d ON d.id = t.driver_id
            LEFT JOIN {S}.app_drivers dr ON dr.user_id = t.driver_id
            ORDER BY (t.status IN ('done', 'cancelled')), t.id DESC LIMIT 120"""
    )
    trip_rows = cur.fetchall()
    cur.execute(
        f"""SELECT u.id, u.name, u.phone, dr.car_model, dr.car_plate, dr.car_color, dr.status, dr.balance, dr.tariffs,
                   dr.block_reason, dr.priority_until, (dr.priority_until > now()) AS has_priority,
                   {ONLINE} AS online,
                   EXISTS (SELECT 1 FROM {S}.app_trips t WHERE t.driver_id = u.id AND t.status IN ('assigned', 'enroute', 'arrived', 'in_progress') AND t.scheduled_at IS NULL) AS busy,
                   (SELECT round(avg(x.rating)::numeric, 2) FROM {S}.app_trips x WHERE x.driver_id = u.id AND x.rating IS NOT NULL) AS rating,
                   (SELECT count(*) FROM {S}.app_driver_events e WHERE e.driver_id = u.id AND e.kind = 'cancel' AND e.created_at > now() - interval '7 days') AS cancels_7d,
                   dr.photo_license, dr.photo_sts, dr.photo_car_front, dr.photo_car_back, dr.photo_car_left, dr.photo_car_right
            FROM {S}.app_users u JOIN {S}.app_drivers dr ON dr.user_id = u.id
            ORDER BY (dr.status = 'pending') DESC, online DESC, u.id DESC"""
    )
    drivers = cur.fetchall()
    cur.execute(f"SELECT id, text, created_at, expires_at FROM {S}.app_broadcasts WHERE NOT is_removed ORDER BY id DESC LIMIT 20")
    casts = cur.fetchall()
    cur.execute(
        f"""SELECT tp.id, tp.driver_id, tp.amount, tp.created_at, u.name, u.phone FROM {S}.app_topups tp
            JOIN {S}.app_users u ON u.id = tp.driver_id WHERE tp.status = 'pending' ORDER BY tp.id"""
    )
    return {'trips': trip_rows, 'drivers': drivers, 'broadcasts': casts, 'topups': cur.fetchall(), 'config': get_config(cur)}


def assign(cur, user, body):
    cur.execute(
        f"SELECT user_id, tariffs, balance FROM {S}.app_drivers WHERE user_id = %s AND status = 'approved'",
        (body.get('driver_id'),),
    )
    d = cur.fetchone()
    if not d:
        raise ApiError(400, 'Водитель не одобрен или заблокирован')
    cur.execute(
        f"SELECT id, status, driver_id, tariff, client_id FROM {S}.app_trips WHERE id = %s FOR UPDATE",
        (body.get('trip_id'),),
    )
    t = cur.fetchone()
    if not t or t['status'] not in ('new', 'assigned'):
        raise ApiError(400, 'Заказ уже нельзя переназначить')
    if t['tariff'] not in d['tariffs']:
        raise ApiError(400, 'У водителя нет такого тарифа. Сначала назначьте тариф в карточке водителя')
    if t['driver_id'] == d['user_id']:
        return {'ok': True}
    refund_commission(cur, t['id'])
    charge_commission(cur, d['user_id'], t['id'])
    cur.execute(
        f"UPDATE {S}.app_trips SET driver_id = %s, status = 'assigned', assigned_by = 'dispatcher', reminder_stage = 0, updated_at = now() WHERE id = %s",
        (d['user_id'], t['id']),
    )
    cur.execute(f"SELECT * FROM {S}.app_trips WHERE id = %s", (t['id'],))
    tr = cur.fetchone()
    send_push(cur, [d['user_id']], 'Вам назначен заказ', trip_line(tr), '/app/driver', f"trip-{t['id']}")
    send_push(cur, [t['client_id']], 'Водитель назначен', 'Откройте приложение, чтобы увидеть данные машины', '/app/client', f"trip-{t['id']}")
    if t['driver_id'] and t['driver_id'] != d['user_id']:
        send_push(cur, [t['driver_id']], 'Заказ снят с вас', f"Заказ №{t['id']} переназначен", '/app/driver', f"trip-{t['id']}")
    return {'ok': True}


def trip_status(cur, user, body):
    status = body.get('status')
    if status not in STATUSES:
        raise ApiError(400, 'Неверный статус')
    cur.execute(f"SELECT id, status, driver_id, client_id FROM {S}.app_trips WHERE id = %s FOR UPDATE", (body.get('trip_id'),))
    t = cur.fetchone()
    if not t:
        raise ApiError(404, 'Заказ не найден')
    if status in ('assigned', 'enroute', 'arrived', 'in_progress', 'done') and not t['driver_id']:
        raise ApiError(400, 'Сначала назначьте водителя')
    if status == 'cancelled':
        refund_commission(cur, t['id'])
    extra = ", cancelled_by = 'dispatcher'" if status == 'cancelled' else ''
    if status == 'done':
        extra = ', finished_at = now()'
    if status == 'in_progress':
        extra = ', started_at = now()'
    cur.execute(f"UPDATE {S}.app_trips SET status = %s{extra}, updated_at = now() WHERE id = %s", (status, t['id']))
    trips.notify_status(cur, t['id'], status)
    if status == 'cancelled':
        send_push(cur, [t['client_id']], 'Заказ отменён диспетчером', f"Заказ №{t['id']}", '/app/client', f"trip-{t['id']}")
        send_push(cur, [t['driver_id']], 'Заказ отменён диспетчером', f"Заказ №{t['id']}", '/app/driver', f"trip-{t['id']}")
    return {'ok': True}


def broadcast(cur, user, body):
    text = clean(body.get('text'), 500)
    if not text:
        raise ApiError(400, 'Введите текст сообщения')
    try:
        minutes = int(body.get('minutes') or 60)
    except (TypeError, ValueError):
        minutes = 60
    minutes = max(5, min(minutes, 60 * 24 * 7))
    cur.execute(
        f"INSERT INTO {S}.app_broadcasts (text, expires_at) VALUES (%s, now() + make_interval(mins => %s))",
        (text, minutes),
    )
    cur.execute(f"SELECT u.id FROM {S}.app_users u JOIN {S}.app_drivers dr ON dr.user_id = u.id WHERE dr.status = 'approved'")
    send_push(cur, [r['id'] for r in cur.fetchall()], 'Сообщение диспетчера', text, '/app/driver', 'cast')
    return {'ok': True}


def broadcast_remove(cur, user, body):
    cur.execute(f"UPDATE {S}.app_broadcasts SET is_removed = true WHERE id = %s", (body.get('id'),))
    return {'ok': True}


def balance(cur, user, body):
    try:
        amount = int(body.get('amount'))
    except (TypeError, ValueError):
        raise ApiError(400, 'Укажите сумму')
    if amount == 0 or abs(amount) > 1000000:
        raise ApiError(400, 'Неверная сумма')
    cur.execute(f"UPDATE {S}.app_drivers SET balance = balance + %s WHERE user_id = %s RETURNING balance", (amount, body.get('driver_id')))
    row = cur.fetchone()
    if not row:
        raise ApiError(404, 'Водитель не найден')
    log_balance(cur, body.get('driver_id'), amount, 'Правка диспетчера')
    send_push(cur, [body.get('driver_id')], 'Баланс изменён', f'{amount:+d} ₽. Сейчас на балансе {int(row["balance"])} ₽', '/app/driver', 'balance')
    return {'balance': row['balance']}


def topup_resolve(cur, user, body):
    approve = bool(body.get('approve'))
    cur.execute(
        f"UPDATE {S}.app_topups SET status = %s, resolved_at = now() WHERE id = %s AND status = 'pending' RETURNING driver_id, amount",
        ('approved' if approve else 'rejected', body.get('id')),
    )
    row = cur.fetchone()
    if not row:
        raise ApiError(400, 'Заявка уже обработана')
    if approve:
        cur.execute(f"UPDATE {S}.app_drivers SET balance = balance + %s WHERE user_id = %s", (row['amount'], row['driver_id']))
        log_balance(cur, row['driver_id'], row['amount'], 'Пополнение')
        send_push(cur, [row['driver_id']], 'Баланс пополнен', f'+{int(row["amount"])} ₽', '/app/driver', 'balance')
    return {'ok': True}


def driver_status(cur, user, body):
    status = body.get('status')
    if status not in ('approved', 'rejected', 'pending', 'blocked'):
        raise ApiError(400, 'Неверный статус')
    reason = clean(body.get('reason'), 200) or None
    cur.execute(
        f"""UPDATE {S}.app_drivers SET status = %s, on_line = (on_line AND %s = 'approved'),
            block_reason = CASE WHEN %s = 'blocked' THEN %s ELSE NULL END WHERE user_id = %s""",
        (status, status, status, reason or 'Решение диспетчера', body.get('driver_id')),
    )
    if status == 'approved':
        cur.execute(f"DELETE FROM {S}.app_driver_events WHERE driver_id = %s AND kind = 'cancel'", (body.get('driver_id'),))
    texts = {'approved': ('Анкета одобрена', 'Можно выходить на линию'), 'rejected': ('Анкета отклонена', 'Свяжитесь с диспетчером'),
             'blocked': ('Аккаунт заблокирован', reason or 'Свяжитесь с диспетчером')}
    if status in texts:
        send_push(cur, [body.get('driver_id')], texts[status][0], texts[status][1], '/app/driver', 'status')
    return {'ok': True}


def driver_tariffs(cur, user, body):
    tariffs = [t for t in (body.get('tariffs') or []) if t in TARIFFS]
    cur.execute(
        f"UPDATE {S}.app_drivers SET tariffs = %s, on_line = (on_line AND cardinality(%s::text[]) > 0) WHERE user_id = %s",
        (tariffs, tariffs, body.get('driver_id')),
    )
    send_push(cur, [body.get('driver_id')], 'Тарифы обновлены', 'Диспетчер изменил ваши тарифы', '/app/driver', 'tariffs')
    return {'ok': True}


def driver_priority(cur, user, body):
    days = int(body.get('days') or 0)
    if days < 0 or days > 365:
        raise ApiError(400, 'Неверный срок')
    if days == 0:
        cur.execute(f"UPDATE {S}.app_drivers SET priority_until = NULL WHERE user_id = %s", (body.get('driver_id'),))
    else:
        cur.execute(
            f"UPDATE {S}.app_drivers SET priority_until = greatest(coalesce(priority_until, now()), now()) + make_interval(days => %s) WHERE user_id = %s",
            (days, body.get('driver_id')),
        )
    return {'ok': True}


def trip_chat_get(cur, user, body):
    return chat.get_messages(cur, 'dispatcher', user, body)


def trip_chat_send(cur, user, body):
    return chat.send_message(cur, 'dispatcher', user, body)


def save_config(cur, user, body):
    import json
    cfg = get_config(cur)
    new = body.get('config') or {}
    for region in ('regular', 'new'):
        for t in TARIFFS:
            v = new.get('rates', {}).get(region, {}).get(t)
            if v is not None:
                cfg['rates'][region][t] = max(1, min(int(v), 1000))
    for k, lo, hi in (('min_price', 0, 100000), ('commission_pct', 0, 90), ('priority_price', 0, 100000),
                      ('priority_days', 1, 365), ('priority_delay_sec', 0, 600), ('cancel_limit_24h', 1, 50), ('cancel_limit_7d', 1, 100)):
        if new.get(k) is not None:
            cfg[k] = max(lo, min(int(new[k]), hi))
    for k in ('payment_info', 'support_telegram', 'support_max'):
        if k in new:
            cfg[k] = clean(new[k], 400)
    cur.execute(
        f"INSERT INTO {S}.app_settings (key, value) VALUES ('config', %s) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
        (json.dumps(cfg, ensure_ascii=False),),
    )
    return {'ok': True}
