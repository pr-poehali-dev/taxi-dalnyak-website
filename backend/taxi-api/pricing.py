import json
import math
import os
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from common import ApiError, TARIFFS

NEW_MARKERS = ('донец', 'луганск', 'херсон', 'запорож', 'donetsk', 'luhansk', 'lugansk', 'kherson', 'zaporiz')


def _get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'taxi-dalnyak'})
    with urllib.request.urlopen(req, timeout=2.8) as r:
        return json.loads(r.read().decode())


def _key():
    return os.environ.get('GEOAPIFY_API_KEY', '')


def _item(p):
    return {
        'label': p.get('formatted') or '',
        'lat': p.get('lat'),
        'lng': p.get('lon'),
        'city': p.get('city') or p.get('town') or p.get('village') or p.get('hamlet') or p.get('county') or '',
        'street': p.get('street') or '',
        'house': p.get('housenumber') or '',
        'state': p.get('state') or '',
        'country': p.get('country') or '',
    }


def suggest(text, lat=None, lng=None):
    q = {'text': text, 'lang': 'ru', 'limit': 6, 'apiKey': _key()}
    if lat is not None and lng is not None:
        q['bias'] = f'proximity:{lng},{lat}'
    try:
        data = _get('https://api.geoapify.com/v1/geocode/autocomplete?' + urllib.parse.urlencode(q))
    except Exception:
        raise ApiError(503, 'Поиск адресов временно недоступен')
    return [_item(f['properties']) for f in data.get('features', []) if f.get('properties', {}).get('lat') is not None]


_REV_CACHE = {}


def reverse(lat, lng):
    key = (round(lat, 2), round(lng, 2))
    if key in _REV_CACHE:
        return _REV_CACHE[key]
    res = _reverse(lat, lng)
    if res and len(_REV_CACHE) < 3000:
        _REV_CACHE[key] = res
    return res


def _reverse(lat, lng):
    q = {'lat': lat, 'lon': lng, 'lang': 'ru', 'apiKey': _key()}
    try:
        data = _get('https://api.geoapify.com/v1/geocode/reverse?' + urllib.parse.urlencode(q))
        feats = data.get('features') or []
        return _item(feats[0]['properties']) if feats else {}
    except Exception:
        return {}


def haversine(a, b):
    r = 6371.0
    p1, p2 = math.radians(a[0]), math.radians(b[0])
    dp = p2 - p1
    dl = math.radians(b[1] - a[1])
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def route_info(a, b):
    q = {'waypoints': f'{a[0]},{a[1]}|{b[0]},{b[1]}', 'mode': 'drive', 'apiKey': _key()}
    try:
        data = _get('https://api.geoapify.com/v1/routing?' + urllib.parse.urlencode(q))
        f = data['features'][0]
        km = f['properties']['distance'] / 1000.0
        g = f.get('geometry') or {}
        lines = g.get('coordinates') or []
        if g.get('type') == 'LineString':
            lines = [lines]
        coords = [(pt[1], pt[0]) for ln in lines for pt in ln]
        return km, False, coords
    except Exception:
        return haversine(a, b) * 1.25, True, [a, b]


NEW_STATES = ('донецк', 'луганск', 'запорож', 'херсонск')
UA_HELD = ('херсон', 'берислав', 'запорожье', 'краматорск', 'славянск', 'константиновка', 'дружковка', 'доброполье', 'покровск', 'мирноград', 'орехов')
BOX = (45.3, 50.5, 32.3, 40.6)


def zone(p):
    """ru — Россия и Крым, new — новые территории, ua — территория под Украиной (не обслуживаем)"""
    if not p:
        return 'ru'
    state = (p.get('state') or '').lower()
    city = (p.get('city') or '').lower()
    text = f"{p.get('country', '')} {p.get('label', '')}".lower()
    if 'крым' in state or 'севастопол' in state:
        return 'ru'
    if any(m in state for m in NEW_STATES):
        if any(city == h or city.startswith(h + ' ') for h in UA_HELD):
            return 'ua'
        return 'new'
    if 'украин' in text or 'ukrain' in text:
        return 'ua'
    return 'ru'


def _in_box(lat, lng):
    return BOX[0] <= lat <= BOX[1] and BOX[2] <= lng <= BOX[3]


def _point_at(coords, cum, d):
    import bisect
    if d <= 0:
        return coords[0]
    if d >= cum[-1]:
        return coords[-1]
    i = bisect.bisect_left(cum, d)
    seg = cum[i] - cum[i - 1]
    t = (d - cum[i - 1]) / seg if seg > 0 else 0
    return (coords[i - 1][0] + (coords[i][0] - coords[i - 1][0]) * t, coords[i - 1][1] + (coords[i][1] - coords[i - 1][1]) * t)


def new_territory_km(coords, total_km, za, zb, classify, deadline):
    """Сколько километров маршрута проходит по новым территориям (от КПП и дальше вглубь)"""
    if za == 'new' and zb == 'new':
        return total_km
    if len(coords) < 2:
        return 0.0
    if za != 'new' and zb != 'new' and not any(_in_box(c[0], c[1]) for c in coords[::max(1, len(coords) // 300)]):
        return 0.0
    cum = [0.0]
    for i in range(1, len(coords)):
        cum.append(cum[-1] + haversine(coords[i - 1], coords[i]))
    length = cum[-1]
    if length <= 0:
        return 0.0
    step = max(25.0, length / 40.0)
    while True:
        n = max(2, int(length // step) + 1)
        pos = [length * i / n for i in range(n + 1)]
        pts = [_point_at(coords, cum, d) for d in pos]
        inside = [i for i in range(1, n) if _in_box(pts[i][0], pts[i][1])]
        if len(inside) <= 7:
            break
        step *= 1.4
    zs = ['ru'] * (n + 1)
    zs[0], zs[n] = za, zb
    for i, z in zip(inside, classify([pts[i] for i in inside])):
        zs[i] = z
    isnew = [z == 'new' for z in zs]
    edges = {}
    for i in range(n):
        if isnew[i] != isnew[i + 1]:
            edges[i] = (pos[i], pos[i + 1], isnew[i])
    for _ in range(2):
        if not edges or time.time() > deadline:
            break
        probes = []
        for k, (lo, hi, first_new) in edges.items():
            for j in (1, 2, 3):
                probes.append((k, lo + (hi - lo) * j / 4))
        res = classify([_point_at(coords, cum, d) for _, d in probes])
        nxt = {}
        for k, (lo, hi, first_new) in edges.items():
            ds = [lo] + [d for kk, d in probes if kk == k] + [hi]
            flags = [first_new] + [r == 'new' for (kk, _), r in zip(probes, res) if kk == k] + [not first_new]
            for j in range(4):
                if flags[j] != flags[j + 1]:
                    nxt[k] = (ds[j], ds[j + 1], flags[j])
                    break
            else:
                nxt[k] = (lo, hi, first_new)
        edges = nxt
    total_new = 0.0
    for i in range(n):
        if i in edges:
            lo, hi, first_new = edges[i]
            b = (lo + hi) / 2
            total_new += (b - pos[i]) if first_new else (pos[i + 1] - b)
        elif isnew[i]:
            total_new += pos[i + 1] - pos[i]
    return total_new * (total_km / length)


def _valid_ll(lat, lng):
    try:
        lat, lng = float(lat), float(lng)
    except (TypeError, ValueError):
        raise ApiError(400, 'Не определены координаты')
    if not (-90 <= lat <= 90 and -180 <= lng <= 180):
        raise ApiError(400, 'Неверные координаты')
    return lat, lng


UA_MSG = 'Заказы на территорию Украины мы не принимаем. Работаем по России, Крыму и новым территориям'


def quote(cfg, from_lat, from_lng, to_lat, to_lng):
    started = time.time()
    a = _valid_ll(from_lat, from_lng)
    b = _valid_ll(to_lat, to_lng)
    with ThreadPoolExecutor(max_workers=3) as ex:
        f_route = ex.submit(route_info, a, b)
        f_from = ex.submit(reverse, a[0], a[1])
        f_to = ex.submit(reverse, b[0], b[1])
        km, approx, coords = f_route.result()
        pa, pb = f_from.result(), f_to.result()
    za, zb = zone(pa), zone(pb)
    if za == 'ua' or zb == 'ua':
        raise ApiError(400, UA_MSG)
    if km < 1:
        raise ApiError(400, 'Точки слишком близко. Сервис междугородний')

    def classify(points):
        with ThreadPoolExecutor(max_workers=10) as ex:
            return list(ex.map(lambda p: zone(reverse(p[0], p[1])), points))

    new_km = min(km, max(0.0, new_territory_km(coords, km, za, zb, classify, started + 3.3)))
    if new_km < 3:
        new_km = 0.0
    reg_km = km - new_km
    prices = {}
    for t in TARIFFS:
        raw = reg_km * cfg['rates']['regular'][t] + new_km * cfg['rates']['new'][t]
        prices[t] = max(cfg['min_price'], int(round(raw / 10.0) * 10))
    return {
        'distance_km': round(km),
        'new_km': round(new_km),
        'region': 'new' if new_km > 0 else 'regular',
        'prices': prices,
        'approx': approx,
        'from_geo': pa,
        'min_price': cfg['min_price'],
    }
