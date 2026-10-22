from common import S, ApiError, clean, rate_limit, charge_commission
from push import send_push, dispatcher_ids
import tg

FEATURES = {
    'ac': 'Кондиционер', 'big_trunk': 'Большой багажник', 'child_seat': 'Детское кресло', 'pets': 'Можно с животными',
    'offroad': 'Повышенная проходимость', 'lying': 'Можно перевезти лежачего', 'no_smoke': 'Не курят в салоне',
    'usb': 'Зарядка для телефона', 'wifi': 'Wi-Fi в салоне',
}


def offer(cur, user, body):
    rate_limit(cur, f"offer:{user['id']}", 20, 600)
    cur.execute(
        f"""SELECT dr.status, dr.on_line, dr.car_model, cardinality(dr.tariffs) AS nt FROM {S}.app_drivers dr WHERE dr.user_id = %s""",
        (user['id'],),
    )
    me = cur.fetchone()
    if not me or me['status'] != 'approved' or not me['on_line']:
        raise ApiError(403, 'Выйдите на линию')
    if not me['nt']:
        raise ApiError(403, 'Диспетчер ещё не назначил вам тариф')
    cur.execute(f"SELECT id, status, tariff, client_id, scheduled_at, to_text FROM {S}.app_trips WHERE id = %s", (body.get('trip_id'),))
    t = cur.fetchone()
    if not t or t['tariff'] != 'choice' or t['status'] != 'new':
        raise ApiError(409, 'Пассажир уже выбрал водителя')
    eta = None
    if t['scheduled_at'] is None:
        try:
            eta = int(body.get('eta_minutes'))
        except (TypeError, ValueError):
            raise ApiError(400, 'Укажите, через сколько минут приедете')
        if not 1 <= eta <= 1440:
            raise ApiError(400, 'Время подачи от 1 минуты до 24 часов')
    note = clean(body.get('note'), 200) or None
    cur.execute(
        f"""INSERT INTO {S}.app_offers (trip_id, driver_id, eta_minutes, note) VALUES (%s, %s, %s, %s)
            ON CONFLICT (trip_id, driver_id) DO UPDATE SET eta_minutes = EXCLUDED.eta_minutes, note = EXCLUDED.note,
              status = 'active', created_at = now()""",
        (t['id'], user['id'], eta, note),
    )
    cur.execute(f"SELECT count(*) AS n FROM {S}.app_offers WHERE trip_id = %s AND status = 'active'", (t['id'],))
    n = cur.fetchone()['n']
    send_push(cur, [t['client_id']], 'Новый водитель откликнулся', f"{me['car_model']} — откройте и выберите. Откликов: {n}", '/app/client', f"offers-{t['id']}")
    tg.notify_client(cur, t['id'], f"🙋 Откликнулся водитель на {me['car_model']}. Всего откликов: {n}. Откройте приложение и выберите машину")
    return {'ok': True}


def withdraw(cur, user, body):
    cur.execute(f"UPDATE {S}.app_offers SET status = 'withdrawn' WHERE trip_id = %s AND driver_id = %s AND status = 'active'", (body.get('trip_id'), user['id']))
    return {'ok': True}


def list_for_trip(cur, trip_id):
    cur.execute(
        f"""SELECT o.id, o.driver_id, o.eta_minutes, o.note, o.created_at,
                   u.name AS driver_name, dr.car_model, dr.car_color, dr.car_year, dr.car_features,
                   left(dr.car_plate, 1) || '***' || right(dr.car_plate, 3) AS plate_hint,
                   (dr.photo_car_front IS NOT NULL) AS has_photo,
                   (SELECT round(avg(x.rating)::numeric, 1) FROM {S}.app_trips x WHERE x.driver_id = o.driver_id AND x.rating IS NOT NULL) AS rating,
                   (SELECT count(*) FROM {S}.app_trips x WHERE x.driver_id = o.driver_id AND x.status = 'done') AS trips_done
            FROM {S}.app_offers o JOIN {S}.app_users u ON u.id = o.driver_id JOIN {S}.app_drivers dr ON dr.user_id = o.driver_id
            WHERE o.trip_id = %s AND o.status = 'active' AND dr.status = 'approved'
            ORDER BY o.created_at""",
        (trip_id,),
    )
    rows = cur.fetchall()
    for r in rows:
        r['features'] = [FEATURES[f] for f in (r.pop('car_features') or []) if f in FEATURES]
    return rows


def client_list(cur, user, body):
    cur.execute(f"SELECT id, client_id, tariff, status FROM {S}.app_trips WHERE id = %s", (body.get('trip_id'),))
    t = cur.fetchone()
    if not t or t['client_id'] != user['id']:
        raise ApiError(404, 'Заказ не найден')
    return {'offers': list_for_trip(cur, t['id']) if t['status'] == 'new' else []}


def car_photo(cur, user, body):
    import base64
    import docs
    cur.execute(
        f"""SELECT dr.photo_car_front FROM {S}.app_offers o JOIN {S}.app_trips t ON t.id = o.trip_id
            JOIN {S}.app_drivers dr ON dr.user_id = o.driver_id
            WHERE o.id = %s AND t.client_id = %s AND o.status = 'active'""",
        (body.get('offer_id'), user['id']),
    )
    r = cur.fetchone()
    if not r or not r['photo_car_front']:
        raise ApiError(404, 'Фото нет')
    cur.execute(f"SELECT driver_id FROM {S}.app_offers WHERE id = %s", (body.get('offer_id'),))
    did = cur.fetchone()['driver_id']
    raw = docs._load(r['photo_car_front'], did)
    return {'image': 'data:image/jpeg;base64,' + base64.b64encode(raw).decode()}


def choose(cur, user, body):
    cur.execute(f"SELECT * FROM {S}.app_trips WHERE id = %s FOR UPDATE", (body.get('trip_id'),))
    t = cur.fetchone()
    if not t or t['client_id'] != user['id']:
        raise ApiError(404, 'Заказ не найден')
    if t['status'] != 'new' or t['tariff'] != 'choice':
        raise ApiError(409, 'Водитель уже выбран')
    cur.execute(
        f"""SELECT o.driver_id, o.eta_minutes, u.name, dr.car_model, dr.status, dr.on_line FROM {S}.app_offers o
            JOIN {S}.app_users u ON u.id = o.driver_id JOIN {S}.app_drivers dr ON dr.user_id = o.driver_id
            WHERE o.id = %s AND o.trip_id = %s AND o.status = 'active'""",
        (body.get('offer_id'), t['id']),
    )
    o = cur.fetchone()
    if not o or o['status'] != 'approved':
        raise ApiError(409, 'Этот водитель уже недоступен, выберите другого')
    cur.execute(
        f"SELECT 1 FROM {S}.app_trips WHERE driver_id = %s AND status IN ('enroute', 'arrived', 'in_progress')",
        (o['driver_id'],),
    )
    if cur.fetchone():
        cur.execute(f"UPDATE {S}.app_offers SET status = 'busy' WHERE id = %s", (body.get('offer_id'),))
        raise ApiError(409, 'Водитель уже взял другой заказ, выберите другого')
    try:
        charge_commission(cur, o['driver_id'], t['id'])
    except ApiError:
        cur.execute(f"UPDATE {S}.app_offers SET status = 'busy' WHERE id = %s", (body.get('offer_id'),))
        send_push(cur, [o['driver_id']], 'Вас выбрал пассажир, но не хватило баланса', 'Пополните баланс, чтобы получать такие заказы', '/app/driver', f"trip-{t['id']}")
        raise ApiError(409, 'Водитель сейчас не может взять заказ, выберите другого')
    cur.execute(
        f"UPDATE {S}.app_trips SET driver_id = %s, status = 'assigned', assigned_by = 'client', updated_at = now() WHERE id = %s",
        (o['driver_id'], t['id']),
    )
    if o['eta_minutes'] and t['scheduled_at'] is None:
        cur.execute(f"UPDATE {S}.app_trips SET eta_at = now() + make_interval(mins => %s) WHERE id = %s", (o['eta_minutes'], t['id']))
    cur.execute(f"UPDATE {S}.app_offers SET status = CASE WHEN id = %s THEN 'chosen' ELSE 'lost' END WHERE trip_id = %s AND status = 'active' RETURNING driver_id, status", (body.get('offer_id'), t['id']))
    others = [r['driver_id'] for r in cur.fetchall() if r['status'] == 'lost']
    send_push(cur, [o['driver_id']], 'Пассажир выбрал вас!', f"Заказ №{t['id']}: {t['from_city']} → {t['to_text']}", '/app/driver', f"trip-{t['id']}")
    if others:
        send_push(cur, others, 'Пассажир выбрал другого водителя', f"Заказ №{t['id']}", '/app/driver', f"trip-{t['id']}")
    send_push(cur, dispatcher_ids(cur), 'Пассажир выбрал водителя', f"№{t['id']}: {o['name']}, {o['car_model']}", '/app/office-k7x2', f"trip-{t['id']}")
    tg.disp(f"🤝 Пассажир сам выбрал водителя · заказ №{t['id']}: {o['name']}, {o['car_model']}", t['id'])
    tg.notify_client(cur, t['id'])
    return {'ok': True}


def set_car(cur, user, body):
    feats = [f for f in (body.get('features') or []) if f in FEATURES][:9]
    year = body.get('car_year')
    try:
        year = int(year) if year not in (None, '') else None
    except (TypeError, ValueError):
        year = None
    if year is not None and not 1985 <= year <= 2030:
        raise ApiError(400, 'Неверный год выпуска')
    cur.execute(f"UPDATE {S}.app_drivers SET car_features = %s, car_year = %s WHERE user_id = %s", (feats, year, user['id']))
    return {'ok': True}
