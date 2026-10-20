import secrets
from datetime import datetime, timedelta, timezone

import chat
import pricing
import trips
from common import S, ApiError, TARIFFS, clean, get_config, rate_limit
from push import send_push, dispatcher_ids, drivers_for_trip, trip_line

OPEN = ('new', 'assigned', 'enroute', 'arrived', 'in_progress')
LIVE = ('assigned', 'enroute', 'arrived', 'in_progress')

TRIP_SELECT = f"""
    SELECT t.id, t.from_text, t.from_city, t.from_street, t.from_house, t.from_lat, t.from_lng, t.to_text,
           t.comment, t.price, t.base_price, t.status, t.tariff, t.region, t.distance_km, t.scheduled_at,
           t.created_at, t.rating, t.driver_id, t.pay_method, t.eta_at, t.share_token, t.cancelled_by,
           d.name AS driver_name, dr.car_model, dr.car_plate, dr.car_color,
           CASE WHEN t.status IN ('enroute', 'arrived', 'in_progress') THEN dr.lat END AS driver_lat,
           CASE WHEN t.status IN ('enroute', 'arrived', 'in_progress') THEN dr.lng END AS driver_lng,
           (SELECT round(avg(x.rating)::numeric, 2) FROM {S}.app_trips x WHERE x.driver_id = t.driver_id AND x.rating IS NOT NULL) AS driver_rating,
           (SELECT max(m.id) FROM {S}.app_messages m WHERE m.trip_id = t.id) AS last_msg_id,
           (SELECT m.sender_role FROM {S}.app_messages m WHERE m.trip_id = t.id ORDER BY m.id DESC LIMIT 1) AS last_msg_role
    FROM {S}.app_trips t
    LEFT JOIN {S}.app_users d ON d.id = t.driver_id
    LEFT JOIN {S}.app_drivers dr ON dr.user_id = t.driver_id
"""


def suggest(cur, user, body):
    rate_limit(cur, f'geo:{user["id"]}', 60, 60)
    text = clean(body.get('text'), 120)
    if len(text) < 3:
        return {'items': []}
    return {'items': pricing.suggest(text, body.get('lat'), body.get('lng'))}


def reverse(cur, user, body):
    rate_limit(cur, f'geo:{user["id"]}', 60, 60)
    return {'item': pricing.reverse(float(body.get('lat')), float(body.get('lng')))}


def quote(cur, user, body):
    rate_limit(cur, f'quote:{user["id"]}', 40, 60)
    cfg = get_config(cur)
    return pricing.quote(cfg, body.get('from_lat'), body.get('from_lng'), body.get('to_lat'), body.get('to_lng'))


def _parse_when(raw):
    if not raw:
        return None
    try:
        dt = datetime.fromisoformat(str(raw).replace('Z', '+00:00'))
    except ValueError:
        raise ApiError(400, 'Неверная дата')
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    if dt < now + timedelta(minutes=30):
        raise ApiError(400, 'Предзаказ можно оформить минимум за 30 минут')
    if dt > now + timedelta(days=60):
        raise ApiError(400, 'Предзаказ можно оформить не более чем на 60 дней вперёд')
    return dt


def create_trip(cur, user, body):
    rate_limit(cur, f'order:{user["id"]}', 6, 3600)
    cfg = get_config(cur)
    tariff = body.get('tariff')
    if tariff not in TARIFFS:
        raise ApiError(400, 'Выберите тариф')
    when = _parse_when(body.get('scheduled_at'))
    pay_method = body.get('pay_method') if body.get('pay_method') in ('cash', 'transfer') else 'cash'
    cur.execute(
        f"SELECT count(*) FILTER (WHERE scheduled_at IS NULL) AS now_open, count(*) AS total FROM {S}.app_trips WHERE client_id = %s AND status IN %s",
        (user['id'], OPEN),
    )
    c = cur.fetchone()
    if when is None and c['now_open'] >= 1:
        raise ApiError(409, 'У вас уже есть активный заказ')
    if c['total'] >= 5:
        raise ApiError(409, 'Слишком много незавершённых заказов')

    q = pricing.quote(cfg, body.get('from_lat'), body.get('from_lng'), body.get('to_lat'), body.get('to_lng'))
    base = q['prices'][tariff]
    price = base
    if body.get('price') not in (None, ''):
        try:
            price = int(body['price'])
        except (TypeError, ValueError):
            raise ApiError(400, 'Неверная цена')
        if price < base:
            raise ApiError(400, f'Цену можно только повысить. Минимум для этой поездки {base} ₽')
        if price > base * 5:
            raise ApiError(400, 'Слишком высокая цена')

    geo = q['from_geo'] or {}
    city = clean(body.get('from_city'), 80) or geo.get('city', '') or geo.get('state', '')
    street = clean(body.get('from_street'), 120) or geo.get('street', '')
    house = clean(body.get('from_house'), 20) or geo.get('house', '')
    label = clean(body.get('from_label'), 200) or geo.get('label', '')
    if not city:
        raise ApiError(400, 'Не удалось определить город подачи. Сдвиньте точку на карте')
    to_text = clean(body.get('to_text'), 200)
    if not to_text:
        raise ApiError(400, 'Укажите, куда едем')
    from_text = ', '.join(x for x in [city, street, house] if x) or label

    cur.execute(
        f"""INSERT INTO {S}.app_trips
            (client_id, from_text, from_lat, from_lng, from_city, from_street, from_house, to_text, to_lat, to_lng,
             comment, price, base_price, tariff, region, distance_km, scheduled_at, pay_method, share_token)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
        (user['id'], from_text, float(body['from_lat']), float(body['from_lng']), city, street, house, to_text,
         float(body['to_lat']), float(body['to_lng']), clean(body.get('comment'), 300) or None, price, base,
         tariff, q['region'], q['distance_km'], when, pay_method, secrets.token_urlsafe(16)),
    )
    trip_id = cur.fetchone()['id']
    notify_new_trip(cur, trip_id)
    return {'id': trip_id}


def notify_new_trip(cur, trip_id):
    cur.execute(f"SELECT * FROM {S}.app_trips WHERE id = %s", (trip_id,))
    t = cur.fetchone()
    title = 'Новый предзаказ' if t['scheduled_at'] else 'Новый заказ'
    line = trip_line(t)
    send_push(cur, dispatcher_ids(cur), title, line, '/app/office-k7x2', f'trip-{trip_id}')
    prio = drivers_for_trip(cur, t['tariff'], priority_only=True)
    if prio:
        send_push(cur, prio, title, f"{line} · {int(t['price'])} ₽", '/app/driver', f'trip-{trip_id}')
        cur.execute(f"UPDATE {S}.app_trips SET deferred_pushed = false WHERE id = %s", (trip_id,))
    else:
        rest = drivers_for_trip(cur, t['tariff'])
        send_push(cur, rest, title, f"{line} · {int(t['price'])} ₽", '/app/driver', f'trip-{trip_id}')
        cur.execute(f"UPDATE {S}.app_trips SET deferred_pushed = true WHERE id = %s", (trip_id,))


def poll(cur, user, body):
    trips.tick(cur)
    cur.execute(TRIP_SELECT + " WHERE t.client_id = %s ORDER BY t.id DESC LIMIT 30", (user['id'],))
    rows = cur.fetchall()
    active = next((r for r in rows if r['status'] in OPEN and (r['scheduled_at'] is None or r['status'] in ('enroute', 'arrived', 'in_progress'))), None)
    upcoming = [r for r in rows if r['status'] in ('new', 'assigned') and r['scheduled_at'] is not None and r is not active]
    history = [r for r in rows if r['status'] in ('done', 'cancelled')][:10]
    cfg = get_config(cur)
    return {
        'active': active, 'upcoming': upcoming, 'history': history,
        'support_telegram': cfg['support_telegram'], 'support_max': cfg['support_max'],
    }


def raise_price(cur, user, body):
    try:
        new_price = int(body.get('price'))
    except (TypeError, ValueError):
        raise ApiError(400, 'Неверная цена')
    cur.execute(
        f"SELECT price, base_price FROM {S}.app_trips WHERE id = %s AND client_id = %s AND status = 'new' FOR UPDATE",
        (body.get('trip_id'), user['id']),
    )
    t = cur.fetchone()
    if not t:
        raise ApiError(400, 'Цену можно менять, пока водитель не найден')
    if new_price <= float(t['price']):
        raise ApiError(400, 'Цену можно только повысить')
    if new_price > float(t['base_price']) * 5:
        raise ApiError(400, 'Слишком высокая цена')
    cur.execute(f"UPDATE {S}.app_trips SET price = %s, updated_at = now() WHERE id = %s", (new_price, body.get('trip_id')))
    cur.execute(f"SELECT * FROM {S}.app_trips WHERE id = %s", (body.get('trip_id'),))
    tr = cur.fetchone()
    send_push(cur, drivers_for_trip(cur, tr['tariff']), 'Цена заказа повышена', f"{trip_line(tr)} · {new_price} ₽", '/app/driver', f"trip-{tr['id']}")
    send_push(cur, dispatcher_ids(cur), 'Клиент повысил цену', f"Заказ №{tr['id']}: {new_price} ₽", '/app/office-k7x2', f"trip-{tr['id']}")
    return {'ok': True}


def cancel_trip(cur, user, body):
    from common import refund_commission
    trip_id = body.get('trip_id')
    cur.execute(
        f"SELECT id, driver_id, status FROM {S}.app_trips WHERE id = %s AND client_id = %s FOR UPDATE",
        (trip_id, user['id']),
    )
    t = cur.fetchone()
    if not t or t['status'] not in ('new', 'assigned', 'enroute', 'arrived'):
        raise ApiError(400, 'Заказ уже нельзя отменить')
    refund_commission(cur, t['id'])
    cur.execute(
        f"UPDATE {S}.app_trips SET status = 'cancelled', cancelled_by = 'client', updated_at = now() WHERE id = %s",
        (t['id'],),
    )
    if t['driver_id']:
        send_push(cur, [t['driver_id']], 'Заказ отменён пассажиром', f'Заказ №{t["id"]}', '/app/driver', f'trip-{t["id"]}')
    send_push(cur, dispatcher_ids(cur), 'Клиент отменил заказ', f'Заказ №{t["id"]}', '/app/office-k7x2', f'trip-{t["id"]}')
    return {'ok': True}


def rate(cur, user, body):
    try:
        stars = int(body.get('rating'))
    except (TypeError, ValueError):
        raise ApiError(400, 'Поставьте оценку от 1 до 5')
    if not 1 <= stars <= 5:
        raise ApiError(400, 'Поставьте оценку от 1 до 5')
    cur.execute(
        f"""UPDATE {S}.app_trips SET rating = %s, rating_comment = %s
            WHERE id = %s AND client_id = %s AND status = 'done' AND rating IS NULL""",
        (stars, clean(body.get('comment'), 300) or None, body.get('trip_id'), user['id']),
    )
    if cur.rowcount == 0:
        raise ApiError(400, 'Оценку уже поставили или заказ не завершён')
    return {'ok': True}


def chat_get(cur, user, body):
    return chat.get_messages(cur, 'client', user, body)


def chat_send(cur, user, body):
    return chat.send_message(cur, 'client', user, body)
