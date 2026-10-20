from common import S, ApiError

ACTIVE = ('new', 'assigned', 'arrived', 'in_progress')

TRIP_SELECT = f"""
    SELECT t.id, t.from_text, t.from_lat, t.from_lng, t.to_text, t.comment, t.price, t.status, t.created_at,
           d.name AS driver_name, d.phone AS driver_phone,
           dr.car_model, dr.car_plate, dr.car_color, dr.lat AS driver_lat, dr.lng AS driver_lng
    FROM {S}.app_trips t
    LEFT JOIN {S}.app_users d ON d.id = t.driver_id
    LEFT JOIN {S}.app_drivers dr ON dr.user_id = t.driver_id
"""


def create_trip(cur, user, body):
    to_text = (body.get('to_text') or '').strip()
    if not to_text:
        raise ApiError(400, 'Укажите, куда едем')
    cur.execute(
        f"SELECT id FROM {S}.app_trips WHERE client_id = %s AND status IN %s",
        (user['id'], ACTIVE),
    )
    if cur.fetchone():
        raise ApiError(409, 'У вас уже есть активный заказ')
    price = body.get('price')
    price = float(price) if price not in (None, '') else None
    cur.execute(
        f"""INSERT INTO {S}.app_trips (client_id, from_text, from_lat, from_lng, to_text, comment, price)
            VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id""",
        (user['id'], (body.get('from_text') or '').strip() or None, body.get('from_lat'), body.get('from_lng'),
         to_text, (body.get('comment') or '').strip() or None, price),
    )
    return {'id': cur.fetchone()['id']}


def my_trip(cur, user, body):
    cur.execute(
        TRIP_SELECT + " WHERE t.client_id = %s ORDER BY t.id DESC LIMIT 10",
        (user['id'],),
    )
    rows = cur.fetchall()
    active = next((r for r in rows if r['status'] in ACTIVE), None)
    history = [r for r in rows if r['status'] not in ACTIVE]
    return {'active': active, 'history': history}


def cancel_trip(cur, user, body):
    cur.execute(
        f"""UPDATE {S}.app_trips SET status = 'cancelled', updated_at = now()
            WHERE id = %s AND client_id = %s AND status IN ('new', 'assigned', 'arrived')""",
        (body.get('trip_id'), user['id']),
    )
    if cur.rowcount == 0:
        raise ApiError(400, 'Заказ уже нельзя отменить')
    return {'ok': True}
