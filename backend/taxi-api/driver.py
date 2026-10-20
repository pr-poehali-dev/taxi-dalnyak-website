import chat
import trips
from pricing import haversine
from common import S, ApiError, get_config, charge_commission, refund_commission, log_balance, rate_limit, clean
from push import send_push, dispatcher_ids, trip_line

LIVE = ('enroute', 'arrived', 'in_progress')

NEXT = {'assigned': 'enroute', 'enroute': 'arrived', 'arrived': 'in_progress', 'in_progress': 'done'}

TRIP_COLS = """t.id, t.from_city, t.from_street, t.from_house, t.from_text, t.from_lat, t.from_lng, t.to_text, t.to_lat, t.to_lng,
               t.comment, t.price, t.pay_method, t.tariff, t.region, t.distance_km, t.scheduled_at, t.status, t.commission"""


def _me(cur, uid):
    cur.execute(
        f"""SELECT u.id, u.name, dr.car_model, dr.car_plate, dr.car_color, dr.status, dr.on_line, dr.balance,
                   dr.tariffs, dr.block_reason, dr.priority_until, (dr.priority_until > now()) AS has_priority,
                   (SELECT round(avg(x.rating)::numeric, 2) FROM {S}.app_trips x WHERE x.driver_id = u.id AND x.rating IS NOT NULL) AS rating,
                   (SELECT count(*) FROM {S}.app_trips x WHERE x.driver_id = u.id AND x.status = 'done') AS done_count
            FROM {S}.app_users u JOIN {S}.app_drivers dr ON dr.user_id = u.id WHERE u.id = %s""",
        (uid,),
    )
    return cur.fetchone()


def poll(cur, user, body):
    trips.tick(cur)
    lat, lng = body.get('lat'), body.get('lng')
    if isinstance(lat, (int, float)) and isinstance(lng, (int, float)) and -90 <= lat <= 90 and -180 <= lng <= 180:
        cur.execute(
            f"UPDATE {S}.app_drivers SET lat = %s, lng = %s, loc_at = now(), last_seen = now() WHERE user_id = %s",
            (lat, lng, user['id']),
        )
    else:
        cur.execute(f"UPDATE {S}.app_drivers SET last_seen = now() WHERE user_id = %s", (user['id'],))
    me = _me(cur, user['id'])
    cfg = get_config(cur)
    cur.execute(
        f"""SELECT {TRIP_COLS}, c.name AS client_name,
                   (SELECT max(m.id) FROM {S}.app_messages m WHERE m.trip_id = t.id) AS last_msg_id,
                   (SELECT m.sender_role FROM {S}.app_messages m WHERE m.trip_id = t.id ORDER BY m.id DESC LIMIT 1) AS last_msg_role
            FROM {S}.app_trips t JOIN {S}.app_users c ON c.id = t.client_id
            WHERE t.driver_id = %s AND t.status IN ('assigned', 'enroute', 'arrived', 'in_progress')
            ORDER BY (t.status IN ('enroute', 'arrived', 'in_progress')) DESC, t.scheduled_at NULLS FIRST, t.id""",
        (user['id'],),
    )
    mine = cur.fetchall()
    live = next((t for t in mine if t['status'] in LIVE), None)
    now_asg = next((t for t in mine if t['status'] == 'assigned' and t['scheduled_at'] is None), None)
    active = live or now_asg
    upcoming = [t for t in mine if t is not active]
    available = []
    if me['status'] == 'approved' and me['on_line'] and me['tariffs']:
        cur.execute(
            f"""SELECT {TRIP_COLS} FROM {S}.app_trips t
                WHERE t.status = 'new' AND t.driver_id IS NULL AND t.tariff = ANY(%s)
                  AND (%s OR t.created_at <= now() - make_interval(secs => %s))
                ORDER BY t.scheduled_at NULLS FIRST, t.id DESC LIMIT 30""",
            (me['tariffs'], bool(me['has_priority']), int(cfg['priority_delay_sec'])),
        )
        available = cur.fetchall()
    cur.execute(
        f"""SELECT id, text, created_at FROM {S}.app_broadcasts
            WHERE NOT is_removed AND (expires_at IS NULL OR expires_at > now()) ORDER BY id DESC LIMIT 5"""
    )
    casts = cur.fetchall()
    cur.execute(f"SELECT id, amount, status, created_at FROM {S}.app_topups WHERE driver_id = %s ORDER BY id DESC LIMIT 5", (user['id'],))
    return {
        'me': me, 'active': active, 'upcoming': upcoming, 'available': available, 'broadcasts': casts,
        'commission_pct': cfg['commission_pct'], 'priority_price': cfg['priority_price'],
        'priority_days': cfg['priority_days'], 'payment_info': cfg['payment_info'],
        'topups': cur.fetchall(), 'support_telegram': cfg['support_telegram'], 'support_max': cfg['support_max'],
    }


def set_line(cur, user, body):
    on = bool(body.get('on'))
    me = _me(cur, user['id'])
    if on and me['status'] != 'approved':
        raise ApiError(403, 'Выйти на линию можно после одобрения анкеты')
    if on and not me['tariffs']:
        raise ApiError(403, 'Диспетчер ещё не назначил вам тариф')
    cur.execute(f"UPDATE {S}.app_drivers SET on_line = %s, last_seen = now() WHERE user_id = %s", (on, user['id']))
    return {'on_line': on}


def take(cur, user, body):
    rate_limit(cur, f'take:{user["id"]}', 30, 60)
    me = _me(cur, user['id'])
    if me['status'] != 'approved' or not me['on_line']:
        raise ApiError(403, 'Выйдите на линию')
    cur.execute(
        f"SELECT id, status, driver_id, tariff, scheduled_at, created_at, price, client_id FROM {S}.app_trips WHERE id = %s FOR UPDATE",
        (body.get('trip_id'),),
    )
    t = cur.fetchone()
    if not t or t['status'] != 'new' or t['driver_id'] is not None:
        raise ApiError(409, 'Заказ уже забрал другой водитель')
    if t['tariff'] not in me['tariffs']:
        raise ApiError(403, 'Этот тариф вам не назначен')
    cur.execute(f"SELECT phone FROM {S}.app_users WHERE id = %s", (t['client_id'],))
    cp = cur.fetchone()['phone']
    cur.execute(f"SELECT 1 FROM {S}.app_users WHERE phone = %s AND role = 'driver'", (cp,))
    if cur.fetchone():
        raise ApiError(403, 'Заказ недоступен')
    cur.execute(
        f"SELECT 1 FROM {S}.app_trips WHERE driver_id = %s AND status IN ('enroute', 'arrived', 'in_progress')",
        (user['id'],),
    )
    if cur.fetchone():
        raise ApiError(409, 'Сначала завершите текущий заказ')
    if t['scheduled_at'] is None:
        cur.execute(f"SELECT 1 FROM {S}.app_trips WHERE driver_id = %s AND status = 'assigned' AND scheduled_at IS NULL", (user['id'],))
        if cur.fetchone():
            raise ApiError(409, 'Сначала завершите текущий заказ')
    else:
        cur.execute(
            f"""SELECT 1 FROM {S}.app_trips WHERE driver_id = %s AND status IN ('assigned') AND scheduled_at IS NOT NULL
                AND abs(extract(epoch FROM scheduled_at - %s)) < 6 * 3600""",
            (user['id'], t['scheduled_at']),
        )
        if cur.fetchone():
            raise ApiError(409, 'У вас уже есть предзаказ на близкое время')
    charge_commission(cur, user['id'], t['id'])
    cur.execute(
        f"UPDATE {S}.app_trips SET driver_id = %s, status = 'assigned', assigned_by = 'driver', updated_at = now() WHERE id = %s",
        (user['id'], t['id']),
    )
    send_push(cur, [t['client_id']], 'Водитель найден', f"{me['name']}, {me['car_color'] or ''} {me['car_model']} {me['car_plate']}".replace('  ', ' '), '/app/client', f"trip-{t['id']}")
    send_push(cur, dispatcher_ids(cur), 'Водитель взял заказ', f"№{t['id']}: {me['name']}", '/app/office-k7x2', f"trip-{t['id']}")
    return {'ok': True}


def _near(cur, trip_id, driver_id, field_lat, field_lng, km, what):
    cur.execute(f"SELECT {field_lat} AS la, {field_lng} AS ln FROM {S}.app_trips WHERE id = %s", (trip_id,))
    p = cur.fetchone()
    cur.execute(f"SELECT lat, lng, loc_at > now() - interval '5 minutes' AS fresh FROM {S}.app_drivers WHERE user_id = %s", (driver_id,))
    d = cur.fetchone()
    if not d or d['lat'] is None or not d['fresh']:
        raise ApiError(400, 'Включите GPS на телефоне, чтобы продолжить')
    if p['la'] is not None and haversine((d['lat'], d['lng']), (p['la'], p['ln'])) > km:
        raise ApiError(400, what)


def trip_status(cur, user, body):
    target = body.get('status')
    cur.execute(
        f"SELECT id, status, scheduled_at FROM {S}.app_trips WHERE id = %s AND driver_id = %s FOR UPDATE",
        (body.get('trip_id'), user['id']),
    )
    t = cur.fetchone()
    if not t or NEXT.get(t['status']) != target:
        raise ApiError(400, 'Неверное действие для этого заказа')
    if target == 'enroute':
        cur.execute(
            f"SELECT 1 FROM {S}.app_trips WHERE driver_id = %s AND status IN ('enroute', 'arrived', 'in_progress') AND id <> %s",
            (user['id'], t['id']),
        )
        if cur.fetchone():
            raise ApiError(409, 'Сначала завершите текущий заказ')
    if target == 'arrived':
        _near(cur, t['id'], user['id'], 'from_lat', 'from_lng', 3.0, 'Вы слишком далеко от места подачи')
    if target == 'done':
        _near(cur, t['id'], user['id'], 'to_lat', 'to_lng', 60.0, 'Вы слишком далеко от точки назначения')
    extra = ''
    if target == 'in_progress':
        extra = ', started_at = now()'
    if target == 'done':
        extra = ', finished_at = now()'
    cur.execute(f"UPDATE {S}.app_trips SET status = %s{extra}, updated_at = now() WHERE id = %s", (target, t['id']))
    trips.notify_status(cur, t['id'], target)
    return {'ok': True}


def cancel(cur, user, body):
    blocked = trips.driver_cancel(cur, user['id'], body.get('trip_id'))
    return {'ok': True, 'blocked': blocked}


def request_topup(cur, user, body):
    rate_limit(cur, f'topup:{user["id"]}', 5, 3600)
    try:
        amount = int(body.get('amount'))
    except (TypeError, ValueError):
        raise ApiError(400, 'Укажите сумму')
    if amount < 100 or amount > 100000:
        raise ApiError(400, 'Сумма от 100 до 100 000 ₽')
    cur.execute(f"SELECT 1 FROM {S}.app_topups WHERE driver_id = %s AND status = 'pending' AND created_at > now() - interval '1 hour'", (user['id'],))
    if cur.fetchone():
        raise ApiError(409, 'Предыдущая заявка ещё обрабатывается')
    cur.execute(f"INSERT INTO {S}.app_topups (driver_id, amount) VALUES (%s, %s)", (user['id'], amount))
    send_push(cur, dispatcher_ids(cur), 'Заявка на пополнение', f'{amount} ₽ от водителя #{user["id"]}', '/app/office-k7x2', f'topup-{user["id"]}')
    return {'ok': True}


def buy_priority(cur, user, body):
    cfg = get_config(cur)
    price = int(cfg['priority_price'])
    cur.execute(
        f"UPDATE {S}.app_drivers SET balance = balance - %s WHERE user_id = %s AND balance >= %s AND status = 'approved' RETURNING balance",
        (price, user['id'], price),
    )
    if not cur.fetchone():
        raise ApiError(402, f'Недостаточно средств. Приоритет стоит {price} ₽')
    cur.execute(
        f"""UPDATE {S}.app_drivers SET priority_until = greatest(coalesce(priority_until, now()), now()) + make_interval(days => %s)
            WHERE user_id = %s""",
        (int(cfg['priority_days']), user['id']),
    )
    log_balance(cur, user['id'], -price, 'Подключение приоритета')
    return {'ok': True}


def chat_get(cur, user, body):
    return chat.get_messages(cur, 'driver', user, body)


def chat_send(cur, user, body):
    return chat.send_message(cur, 'driver', user, body)
