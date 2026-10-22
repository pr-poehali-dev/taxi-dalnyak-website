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
    city = p.get('city') or p.get('town') or p.get('village') or p.get('hamlet') or p.get('county') or ''
    street = p.get('street') or ''
    house = p.get('housenumber') or ''
    name = p.get('name') or ''
    line = ', '.join(x for x in [street, house] if x)
    title = name or line or p.get('address_line1') or city or p.get('formatted') or ''
    if name and line and name != street:
        sub_parts = [line, city]
    elif line and not name:
        sub_parts = [city]
    else:
        sub_parts = [city]
    state = p.get('state') or ''
    if state and state != city:
        sub_parts.append(state)
    sub = ', '.join(x for x in sub_parts if x and x != title)
    if title == city and not line:
        sub = state if state and state != city else (p.get('country') or '')
    return {
        'label': p.get('formatted') or '',
        'title': title,
        'subtitle': sub,
        'lat': p.get('lat'),
        'lng': p.get('lon'),
        'city': city,
        'street': street,
        'house': house,
        'state': state,
        'country': p.get('country') or '',
    }


BAD_TITLE = ('городской округ', 'муниципальн', 'сельсовет', 'сельское поселение', 'городское поселение', 'административн')


def _features(url, q):
    try:
        data = _get(url + '?' + urllib.parse.urlencode(q))
    except Exception:
        return []
    return [f['properties'] for f in data.get('features', []) if f.get('properties', {}).get('lat') is not None]


def suggest(text, lat=None, lng=None):
    q = {'text': text, 'lang': 'ru', 'limit': 8, 'apiKey': _key(), 'filter': 'countrycode:ru,by,kz,ua,none'}
    q.pop('filter')
    if lat is not None and lng is not None:
        q['bias'] = f'proximity:{lng},{lat}'
    with ThreadPoolExecutor(max_workers=2) as ex:
        f1 = ex.submit(_features, 'https://api.geoapify.com/v1/geocode/autocomplete', q)
        f2 = ex.submit(_features, 'https://api.geoapify.com/v1/geocode/search', dict(q, limit=6))
        props = f1.result() + f2.result()
    if not props:
        raise ApiError(503, 'Поиск адресов временно недоступен')
    low = text.lower().strip()
    seen, out = set(), []
    for p in props:
        it = _item(p)
        if any(m in it['title'].lower() for m in BAD_TITLE):
            continue
        key = (it['title'].lower(), it['subtitle'].lower())
        if key in seen:
            continue
        seen.add(key)
        score = 0
        t = it['title'].lower()
        if t == low:
            score -= 3
        elif t.startswith(low):
            score -= 2
        elif low in t or low in (it['label'] or '').lower():
            score -= 1
        if p.get('result_type') in ('city', 'town', 'village', 'street', 'building', 'amenity'):
            score -= 1
        out.append((score, len(out), it))
    out.sort(key=lambda x: (x[0], x[1]))
    return [x[2] for x in out[:8]]


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


_ROUTE_CACHE = {}


def route_info(a, b):
    key = (round(a[0], 3), round(a[1], 3), round(b[0], 3), round(b[1], 3))
    if key in _ROUTE_CACHE:
        return _ROUTE_CACHE[key]
    res = _route_info(a, b)
    if not res[1] and len(_ROUTE_CACHE) < 500:
        _ROUTE_CACHE[key] = res
    return res


def _route_info(a, b):
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

    new_km = min(km, max(0.0, new_territory_km(coords, km, za, zb, classify, started + 2.4)))
    if new_km < 3:
        new_km = 0.0
    total = int(round(km))
    new_r = min(total, int(round(new_km)))
    reg_r = total - new_r
    prices = {}
    for t in TARIFFS:
        raw = reg_r * cfg['rates']['regular'][t] + new_r * cfg['rates']['new'][t]
        prices[t] = max(cfg['min_price'], int(round(raw / 10.0) * 10))
    return {
        'distance_km': total,
        'new_km': new_r,
        'reg_km': reg_r,
        'rates': cfg['rates'],
        'region': 'new' if new_km > 0 else 'regular',
        'prices': prices,
        'approx': approx,
        'from_geo': pa,
        'min_price': cfg['min_price'],
    }

