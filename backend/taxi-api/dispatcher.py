from common import S, ApiError, ONLINE_SQL, log_balance

TRIP_STATUSES = ('new', 'assigned', 'arrived', 'in_progress', 'done', 'cancelled')


def poll(cur, user, body):
    cur.execute(
        f"""SELECT t.id, t.from_text, t.from_lat, t.from_lng, t.to_text, t.comment, t.price, t.status,
                   t.created_at, t.driver_id, t.assigned_by,
                   c.phone AS client_phone, c.name AS client_name,
                   d.name AS driver_name, d.phone AS driver_phone, dr.car_model, dr.car_plate
            FROM {S}.app_trips t
            JOIN {S}.app_users c ON c.id = t.client_id
            LEFT JOIN {S}.app_users d ON d.id = t.driver_id
            LEFT JOIN {S}.app_drivers dr ON dr.user_id = t.driver_id
            ORDER BY (t.status IN ('done', 'cancelled')), t.id DESC LIMIT 100"""
    )
    trips = cur.fetchall()
    cur.execute(
        f"""SELECT u.id, u.name, u.phone, dr.car_model, dr.car_plate, dr.car_color, dr.status, dr.balance,
                   dr.lat, dr.lng, dr.last_seen,
                   {ONLINE_SQL} AS online,
                   EXISTS (SELECT 1 FROM {S}.app_trips t WHERE t.driver_id = u.id
                           AND t.status IN ('assigned', 'arrived', 'in_progress')) AS busy,
                   dr.photo_license, dr.photo_sts, dr.photo_car_front, dr.photo_car_back,
                   dr.photo_car_left, dr.photo_car_right
            FROM {S}.app_users u JOIN {S}.app_drivers dr ON dr.user_id = u.id
            ORDER BY (dr.status = 'pending') DESC, online DESC, u.id DESC"""
    )
    drivers = cur.fetchall()
    cur.execute(f"SELECT id, text, created_at FROM {S}.app_broadcasts ORDER BY id DESC LIMIT 20")
    return {'trips': trips, 'drivers': drivers, 'broadcasts': cur.fetchall()}


def assign(cur, user, body):
    cur.execute(
        f"SELECT 1 FROM {S}.app_drivers WHERE user_id = %s AND status = 'approved'",
        (body.get('driver_id'),),
    )
    if not cur.fetchone():
        raise ApiError(400, 'Водитель не одобрен')
    cur.execute(
        f"""UPDATE {S}.app_trips SET driver_id = %s, status = 'assigned', assigned_by = 'dispatcher', updated_at = now()
            WHERE id = %s AND status IN ('new', 'assigned')""",
        (body.get('driver_id'), body.get('trip_id')),
    )
    if cur.rowcount == 0:
        raise ApiError(400, 'Заказ уже нельзя переназначить')
    return {'ok': True}


def trip_status(cur, user, body):
    status = body.get('status')
    if status not in TRIP_STATUSES:
        raise ApiError(400, 'Неверный статус')
    cur.execute(
        f"UPDATE {S}.app_trips SET status = %s, updated_at = now() WHERE id = %s",
        (status, body.get('trip_id')),
    )
    return {'ok': True}


def broadcast(cur, user, body):
    text = (body.get('text') or '').strip()
    if not text:
        raise ApiError(400, 'Введите текст сообщения')
    cur.execute(f"INSERT INTO {S}.app_broadcasts (text) VALUES (%s)", (text[:500],))
    return {'ok': True}


def balance(cur, user, body):
    amount = int(body.get('amount') or 0)
    if amount == 0:
        raise ApiError(400, 'Укажите сумму')
    cur.execute(
        f"UPDATE {S}.app_drivers SET balance = balance + %s WHERE user_id = %s RETURNING balance",
        (amount, body.get('driver_id')),
    )
    row = cur.fetchone()
    if not row:
        raise ApiError(404, 'Водитель не найден')
    log_balance(cur, body.get('driver_id'), amount, 'Правка диспетчера')
    return {'balance': row['balance']}


def driver_status(cur, user, body):
    status = body.get('status')
    if status not in ('approved', 'rejected', 'pending'):
        raise ApiError(400, 'Неверный статус')
    cur.execute(
        f"UPDATE {S}.app_drivers SET status = %s, on_line = (on_line AND %s = 'approved') WHERE user_id = %s",
        (status, status, body.get('driver_id')),
    )
    return {'ok': True}
