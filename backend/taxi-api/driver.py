from common import S, ApiError, COMMISSION, ONLINE_SQL, log_balance

ACTIVE = ('assigned', 'arrived', 'in_progress')


def _me(cur, uid):
    cur.execute(
        f"""SELECT u.id, u.name, u.phone, dr.car_model, dr.car_plate, dr.car_color, dr.status,
                   dr.on_line, dr.balance
            FROM {S}.app_users u JOIN {S}.app_drivers dr ON dr.user_id = u.id WHERE u.id = %s""",
        (uid,),
    )
    return cur.fetchone()


def poll(cur, user, body):
    lat, lng = body.get('lat'), body.get('lng')
    if lat is not None and lng is not None:
        cur.execute(
            f"UPDATE {S}.app_drivers SET lat = %s, lng = %s, loc_at = now(), last_seen = now() WHERE user_id = %s",
            (lat, lng, user['id']),
        )
    else:
        cur.execute(f"UPDATE {S}.app_drivers SET last_seen = now() WHERE user_id = %s", (user['id'],))
    me = _me(cur, user['id'])
    cur.execute(
        f"""SELECT t.id, t.from_text, t.from_lat, t.from_lng, t.to_text, t.comment, t.price, t.status,
                   c.phone AS client_phone, c.name AS client_name
            FROM {S}.app_trips t JOIN {S}.app_users c ON c.id = t.client_id
            WHERE t.driver_id = %s AND t.status IN %s ORDER BY t.id DESC LIMIT 1""",
        (user['id'], ACTIVE),
    )
    active = cur.fetchone()
    available = []
    if me['status'] == 'approved' and me['on_line'] and not active:
        cur.execute(
            f"""SELECT id, from_text, from_lat, from_lng, to_text, comment, price, created_at
                FROM {S}.app_trips WHERE status = 'new' AND driver_id IS NULL ORDER BY id DESC LIMIT 20"""
        )
        available = cur.fetchall()
    cur.execute(f"SELECT id, text, created_at FROM {S}.app_broadcasts ORDER BY id DESC LIMIT 5")
    return {'me': me, 'active': active, 'available': available, 'broadcasts': cur.fetchall(), 'commission': COMMISSION}


def set_line(cur, user, body):
    on = bool(body.get('on'))
    me = _me(cur, user['id'])
    if on and me['status'] != 'approved':
        raise ApiError(403, 'Анкета ещё не одобрена диспетчером')
    cur.execute(
        f"UPDATE {S}.app_drivers SET on_line = %s, last_seen = now() WHERE user_id = %s",
        (on, user['id']),
    )
    return {'on_line': on}


def take(cur, user, body):
    me = _me(cur, user['id'])
    if me['status'] != 'approved' or not me['on_line']:
        raise ApiError(403, 'Выйдите на линию')
    cur.execute(f"SELECT id FROM {S}.app_trips WHERE driver_id = %s AND status IN %s", (user['id'], ACTIVE))
    if cur.fetchone():
        raise ApiError(409, 'Сначала завершите текущий заказ')
    cur.execute(
        f"UPDATE {S}.app_drivers SET balance = balance - %s WHERE user_id = %s AND balance >= %s RETURNING balance",
        (COMMISSION, user['id'], COMMISSION),
    )
    if not cur.fetchone():
        raise ApiError(402, f'Недостаточно средств. Для заказа нужно {COMMISSION} ₽ на балансе')
    cur.execute(
        f"""UPDATE {S}.app_trips SET driver_id = %s, status = 'assigned', assigned_by = 'driver', updated_at = now()
            WHERE id = %s AND status = 'new' AND driver_id IS NULL""",
        (user['id'], body.get('trip_id')),
    )
    if cur.rowcount == 0:
        cur.connection.rollback()
        raise ApiError(409, 'Заказ уже забрал другой водитель')
    log_balance(cur, user['id'], -COMMISSION, f"Комиссия за заказ №{body.get('trip_id')}")
    return {'ok': True}


def trip_status(cur, user, body):
    status = body.get('status')
    if status not in ('arrived', 'in_progress', 'done'):
        raise ApiError(400, 'Неверный статус')
    cur.execute(
        f"UPDATE {S}.app_trips SET status = %s, updated_at = now() WHERE id = %s AND driver_id = %s AND status IN %s",
        (status, body.get('trip_id'), user['id'], ACTIVE),
    )
    if cur.rowcount == 0:
        raise ApiError(400, 'Заказ не найден')
    return {'ok': True}


def topup_test(cur, user, body):
    amount = int(body.get('amount') or 0)
    if amount <= 0 or amount > 5000:
        raise ApiError(400, 'Сумма от 1 до 5000 ₽')
    cur.execute(f"UPDATE {S}.app_drivers SET balance = balance + %s WHERE user_id = %s", (amount, user['id']))
    log_balance(cur, user['id'], amount, 'Пополнение (тестовое)')
    return {'ok': True}
