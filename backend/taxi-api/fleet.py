import math
import random
import time

import pricing
from common import S, ApiError, ORDER_TARIFFS, clean, norm_phone, placeholder_token
from push import send_push, drivers_for_trip, trip_line

ONLINE = "(dr.on_line AND dr.last_seen > now() - interval '90 seconds')"
BUSY = f"EXISTS (SELECT 1 FROM {S}.app_trips t WHERE t.driver_id = u.id AND t.status IN ('assigned', 'enroute', 'arrived', 'in_progress') AND t.scheduled_at IS NULL)"

HUBS = [
    ('Москва', 55.751, 37.618), ('Ростов-на-Дону', 47.222, 39.718), ('Краснодар', 45.035, 38.975),
    ('Белгород', 50.595, 36.587), ('Воронеж', 51.661, 39.200), ('Донецк', 48.015, 37.802),
    ('Луганск', 48.574, 39.307), ('Мариуполь', 47.097, 37.543), ('Симферополь', 44.952, 34.102),
    ('Санкт-Петербург', 59.939, 30.316), ('Курск', 51.730, 36.193), ('Екатеринбург', 56.838, 60.605),
]
NAMES = ['Ястреб', 'Сокол', 'Беркут', 'Кречет', 'Орёл', 'Филин', 'Стриж', 'Ворон', 'Коршун', 'Сапсан', 'Мерлин', 'Чайка']


def _virtual(count=14, near=None):
    """Виртуальные машины: плавно двигаются по кругу вокруг городов (или вокруг пассажира), позиция зависит от времени."""
    t = time.time()
    out = []
    for i in range(count):
        city, lat, lng = ('', near[0], near[1]) if near else HUBS[i % len(HUBS)]
        rnd = random.Random(i * 7919)
        r = (0.004 + rnd.random() * 0.018) if near else (0.02 + rnd.random() * 0.05)
        speed = 0.0004 + rnd.random() * 0.0006
        ang = rnd.random() * 6.28 + t * speed
        busy = rnd.random() < 0.35
        out.append({
            'id': -(i + 1), 'callsign': f"{NAMES[i % len(NAMES)]}-{10 + i}", 'virtual': True,
            'lat': round(lat + r * math.sin(ang), 5), 'lng': round(lng + r * math.cos(ang) * 1.6, 5),
            'status': 'busy' if busy else 'free', 'city': city, 'tariff': rnd.choice(['standard', 'standard', 'comfort', 'minivan']),
        })
    return out


def _real(cur, fresh_min=30):
    cur.execute(
        f"""SELECT u.id, u.name, dr.callsign, dr.car_model, dr.car_plate, dr.car_color, dr.lat, dr.lng, dr.loc_city AS city,
                   dr.tariffs, {ONLINE} AS online, {BUSY} AS busy,
                   extract(epoch FROM now() - dr.loc_at)::int AS loc_ago
            FROM {S}.app_users u JOIN {S}.app_drivers dr ON dr.user_id = u.id
            WHERE dr.status = 'approved' AND dr.lat IS NOT NULL AND dr.loc_at > now() - make_interval(mins => %s)""",
        (fresh_min,),
    )
    out = []
    for d in cur.fetchall():
        st = 'busy' if d['busy'] else ('free' if d['online'] else 'offline')
        out.append({**d, 'virtual': False, 'status': st, 'tariff': (d['tariffs'] or ['standard'])[0]})
    return out


def disp_map(cur, user, body):
    real = _real(cur, 24 * 60)
    show_virtual = body.get('virtual') is not False
    return {'cars': real + (_virtual() if show_virtual else [])}


def public_cars(cur, body):
    """Машины для пассажира: без имён и телефонов, только позывной, статус и точка."""
    real = [c for c in _real(cur, 10) if c['status'] != 'offline']
    cars = [{'id': c['id'], 'callsign': c['callsign'] or f"#{c['id']}", 'lat': c['lat'], 'lng': c['lng'], 'status': c['status'], 'tariff': c['tariff']} for c in real]
    near = None
    try:
        lat, lng = float(body.get('lat')), float(body.get('lng'))
        if -90 <= lat <= 90 and -180 <= lng <= 180:
            near = (round(lat, 2), round(lng, 2))
    except (TypeError, ValueError):
        pass
    if len(cars) < 6:
        cars += [{k: v[k] for k in ('id', 'callsign', 'lat', 'lng', 'status', 'tariff')} for v in _virtual(7 if near else 14, near)]
    return {'cars': cars}


def _client_by_phone(cur, phone, name):
    cur.execute(f"SELECT id, name FROM {S}.app_users WHERE phone = %s AND role = 'client'", (phone,))
    u = cur.fetchone()
    if u:
        if name and not u['name']:
            cur.execute(f"UPDATE {S}.app_users SET name = %s WHERE id = %s", (name, u['id']))
        return u['id']
    cur.execute(
        f"INSERT INTO {S}.app_users (phone, role, name, token) VALUES (%s, 'client', %s, %s) RETURNING id",
        (phone, name or None, placeholder_token()),
    )
    return cur.fetchone()['id']


def _num(v, lo, hi, msg):
    if v in (None, ''):
        return None
    try:
        n = int(v)
    except (TypeError, ValueError):
        raise ApiError(400, msg)
    if not lo <= n <= hi:
        raise ApiError(400, msg)
    return n


def create_order(cur, user, body):
    from datetime import datetime, timezone
    phone = norm_phone(body.get('phone'))
    name = clean(body.get('name'), 80)
    from_text = clean(body.get('from_text'), 200)
    to_text = clean(body.get('to_text'), 200)
    if not from_text or not to_text:
        raise ApiError(400, 'Укажите, откуда и куда едем')
    tariff = body.get('tariff') if body.get('tariff') in ORDER_TARIFFS else 'standard'
    price = _num(body.get('price'), 100, 2_000_000, 'Укажите сумму поездки числом')
    if not price:
        raise ApiError(400, 'Укажите сумму поездки')
    passengers = _num(body.get('passengers'), 1, 20, 'Пассажиров от 1 до 20')
    luggage = clean(body.get('luggage'), 120) or None
    comment = clean(body.get('comment'), 300) or None
    pay = body.get('pay_method') if body.get('pay_method') in ('cash', 'transfer') else 'cash'
    when = None
    if body.get('scheduled_at'):
        try:
            when = datetime.fromisoformat(str(body['scheduled_at']).replace('Z', '+00:00'))
        except ValueError:
            raise ApiError(400, 'Неверная дата')
        if when.tzinfo is None:
            when = when.replace(tzinfo=timezone.utc)

    def ll(k):
        v = body.get(k)
        return float(v) if isinstance(v, (int, float)) else None
    flat, flng, tlat, tlng = ll('from_lat'), ll('from_lng'), ll('to_lat'), ll('to_lng')
    km = _num(body.get('distance_km'), 0, 10000, 'Расстояние числом')
    if km is None and None not in (flat, flng, tlat, tlng):
        try:
            km = int(round(pricing.route_info((flat, flng), (tlat, tlng))[0]))
        except Exception:
            km = None
    city = clean(body.get('from_city'), 80) or from_text.split(',')[0]
    region = 'new' if body.get('region') == 'new' else 'regular'

    uid = _client_by_phone(cur, phone, name)
    import secrets
    cur.execute(
        f"""INSERT INTO {S}.app_trips
            (client_id, from_text, from_lat, from_lng, from_city, to_text, to_lat, to_lng, comment, price, base_price, tariff,
             region, distance_km, scheduled_at, pay_method, share_token, from_installed, passengers, luggage, created_by, deferred_pushed)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,false,%s,%s,'dispatcher',true) RETURNING *""",
        (uid, from_text, flat, flng, city, to_text, tlat, tlng, comment, price, price, tariff, region, km, when, pay,
         secrets.token_urlsafe(16), passengers, luggage),
    )
    t = cur.fetchone()
    driver_id = body.get('driver_id')
    if driver_id:
        import dispatcher
        dispatcher.assign(cur, user, {'driver_id': driver_id, 'trip_id': t['id'], 'charge': body.get('charge')})
    else:
        ids = drivers_for_trip(cur, tariff)
        send_push(cur, ids, 'Новый заказ', f"{trip_line(t)} · {int(price)} ₽", '/app/driver', f"trip-{t['id']}")
        cur.execute(f"UPDATE {S}.app_trips SET ring_at = now(), ring_count = 1 WHERE id = %s", (t['id'],))
    return {'id': t['id']}


def ring_tick(cur):
    """Повторяет пуш водителям на линии каждые 30 секунд, пока заказ никто не взял (до 10 раз)."""
    cur.execute(
        f"""UPDATE {S}.app_trips SET ring_at = now(), ring_count = ring_count + 1
            WHERE status = 'new' AND driver_id IS NULL AND scheduled_at IS NULL AND deferred_pushed
              AND ring_count < 10 AND (ring_at IS NULL OR ring_at <= now() - interval '30 seconds')
              AND created_at > now() - interval '30 minutes' RETURNING *"""
    )
    for t in cur.fetchall()[:5]:
        ids = drivers_for_trip(cur, t['tariff'])
        send_push(cur, ids, '🚨 Заказ ждёт водителя', f"{trip_line(t)} · {int(t['price'])} ₽", '/app/driver', f"trip-{t['id']}")
