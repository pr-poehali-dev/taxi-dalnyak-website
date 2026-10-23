import json
import math
import os
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from common import ApiError, TARIFFS

NEW_MARKERS = ('донец', 'луганск', 'херсон', 'запорож', 'donetsk', 'luhansk', 'lugansk', 'kherson', 'zaporiz')


def _get(url, timeout=2.8):
    req = urllib.request.Request(url, headers={'User-Agent': 'taxi-dalnyak'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
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
    label = p.get('formatted') or ''
    st_low = state.lower()
    if 'крым' in st_low or 'севастопол' in st_low or any(m in st_low for m in ('донецк', 'луганск', 'запорож', 'херсонск')):
        region = {'донецк': 'ДНР', 'луганск': 'ЛНР', 'запорож': 'Запорожская обл.', 'херсонск': 'Херсонская обл.', 'крым': 'Крым', 'севастопол': 'Севастополь'}
        rname = next(v for k, v in region.items() if k in st_low)
        district = p.get('county') or ''
        import re
        if 'общин' in district.lower() or re.search(r'[A-Za-zіїєґ]|ький|ського', district):
            district = ''
        sub = ', '.join(x for x in [line if title != line else '', city if city != title and 'общин' not in city.lower() else '', district if district and district not in (title, city) else '', rname] if x)
        label = ', '.join(x for x in [title, sub] if x)
    else:
        label = ', '.join(x for x in [title, sub] if x) or label.replace(', Украина', '')
    return {
        'label': label,
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


TOLL_RATES = (('М-11', 5.5), ('M-11', 5.5), ('М-12', 3.5), ('M-12', 3.5), ('ЦКАД', 4.0), ('М-4', 4.5), ('M-4', 4.5))
TOLL_DEFAULT = 4.5


def _toll(props):
    km = 0.0
    rub = 0.0
    roads = []
    for leg in props.get('legs') or []:
        for st in leg.get('steps') or []:
            if not st.get('toll'):
                continue
            d = (st.get('distance') or 0) / 1000.0
            label = ' '.join(str(st.get(k) or '') for k in ('ref', 'name'))
            rate = next((r for k, r in TOLL_RATES if k in label), TOLL_DEFAULT)
            km += d
            rub += d * rate
            ref = (st.get('ref') or '').split(';')[0].strip()
            if ref and ref not in roads:
                roads.append(ref)
    if km < 3:
        return None
    return {'km': int(round(km)), 'rub': int(round(rub / 50.0) * 50) or 50, 'roads': roads[:3]}


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
        extra = {'min': round((f['properties'].get('time') or 0) / 60)}
        return km, False, coords, extra
    except Exception:
        km = haversine(a, b) * 1.25
        return km, True, [a, b], {'min': round(km / 75 * 60)}


_TOLL_CACHE = {}


def toll_info(points, timeout=3.4):
    """Платные участки маршрута и примерная стоимость проезда"""
    key = tuple((round(p[0], 2), round(p[1], 2)) for p in points)
    if key in _TOLL_CACHE:
        return _TOLL_CACHE[key]
    wp = '|'.join(f'{p[0]},{p[1]}' for p in points)
    q = {'waypoints': wp, 'mode': 'drive', 'details': 'route_details', 'apiKey': _key()}
    data = _get('https://api.geoapify.com/v1/routing?' + urllib.parse.urlencode(q), timeout)
    res = _toll(data['features'][0]['properties'])
    if len(_TOLL_CACHE) < 1000:
        _TOLL_CACHE[key] = res
    return res


KPPS = [
    {'id': 'veselo', 'name': 'Весело-Вознесенка (Новоазовск)', 'lat': 47.1617, 'lng': 38.2430},
    {'id': 'uspenka', 'name': 'Матвеев Курган (Успенка)', 'lat': 47.6976, 'lng': 38.6836},
    {'id': 'kuibyshevo', 'name': 'Куйбышево (Мариновка)', 'lat': 47.8568, 'lng': 38.8580},
    {'id': 'novoshakhtinsk', 'name': 'Новошахтинск (Должанский)', 'lat': 47.8470, 'lng': 39.7600},
    {'id': 'gukovo', 'name': 'Гуково (Червонопартизанск)', 'lat': 48.0622, 'lng': 39.8433},
    {'id': 'izvarino', 'name': 'Донецк Ростовский (Изварино)', 'lat': 48.2930, 'lng': 39.9135},
    {'id': 'chertkovo', 'name': 'Чертково (Меловое)', 'lat': 49.3870, 'lng': 40.1240},
]


_LEGS_CACHE = {}


def _route_legs(points):
    key = tuple((round(p[0], 3), round(p[1], 3)) for p in points)
    if key in _LEGS_CACHE:
        return _LEGS_CACHE[key]
    res = _route_legs_raw(points)
    if len(_LEGS_CACHE) < 1000:
        _LEGS_CACHE[key] = res
    return res


def _route_legs_raw(points):
    wp = '|'.join(f'{p[0]},{p[1]}' for p in points)
    data = _get('https://api.geoapify.com/v1/routing?' + urllib.parse.urlencode({'waypoints': wp, 'mode': 'drive', 'apiKey': _key()}))
    pr = data['features'][0]['properties']
    return [l['distance'] / 1000.0 for l in pr['legs']], pr.get('time', 0)


def _crimea(p):
    st = (p or {}).get('state', '').lower()
    return 'крым' in st or 'севастопол' in st


def kpp_routes(a, b, a_new, off=()):
    """Маршрут через каждый подходящий КПП: км до КПП и после, время в пути"""
    cands = [k for k in KPPS if k['id'] not in off]
    if not cands:
        return []
    cands.sort(key=lambda k: haversine(a, (k['lat'], k['lng'])) + haversine((k['lat'], k['lng']), b))
    best = haversine(a, (cands[0]['lat'], cands[0]['lng'])) + haversine((cands[0]['lat'], cands[0]['lng']), b)
    cands = [k for k in cands if haversine(a, (k['lat'], k['lng'])) + haversine((k['lat'], k['lng']), b) <= best * 1.35 + 20][:4]

    def one(k):
        try:
            legs, t = _route_legs([a, (k['lat'], k['lng']), b])
        except Exception:
            return None
        before, after = legs[0], legs[1]
        return {'kpp': k, 'km': before + after, 'new_km': before if a_new else after, 'time': t}

    with ThreadPoolExecutor(max_workers=4) as ex:
        res = [r for r in ex.map(one, cands) if r]
    return res


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


def ru_rates(cfg, total_km):
    tiers = sorted(cfg.get('ru_tiers') or [], key=lambda x: x['from_km'])
    rates = dict(cfg['rates']['regular'])
    for tier in tiers:
        if total_km > tier['from_km']:
            rates.update(tier['rates'])
    return rates


def calc_prices(cfg, total, new_r):
    reg_r = total - new_r
    out = {}
    if new_r > 0:
        rr = ru_rates(cfg, total)
        for t in TARIFFS:
            raw = reg_r * rr[t] + new_r * cfg['rates']['new'][t]
            out[t] = max(cfg['min_price'], int(round(raw / 10.0) * 10))
    else:
        rates = ru_rates(cfg, total)
        mins = cfg.get('ru_min') or {}
        for t in TARIFFS:
            raw = total * rates[t]
            out[t] = max(int(mins.get(t) or cfg['min_price']), int(round(raw / 10.0) * 10))
    out['choice'] = out['comfort']
    return out


def quote(cfg, from_lat, from_lng, to_lat, to_lng, kpp_id=None):
    started = time.time()
    a = _valid_ll(from_lat, from_lng)
    b = _valid_ll(to_lat, to_lng)
    ex = ThreadPoolExecutor(max_workers=4)
    f_route = ex.submit(route_info, a, b)
    f_toll = ex.submit(toll_info, [a, b])
    f_from = ex.submit(reverse, a[0], a[1])
    f_to = ex.submit(reverse, b[0], b[1])
    pa, pb = f_from.result(), f_to.result()
    za, zb = zone(pa), zone(pb)
    if za == 'ua' or zb == 'ua':
        ex.shutdown(wait=False)
        raise ApiError(400, UA_MSG)

    via = None
    via_id = None
    alts = []
    if {za, zb} == {'new', 'ru'} and not _crimea(pa if za == 'ru' else pb):
        opts = kpp_routes(a, b, za == 'new', cfg.get('kpp_off') or ())
        if opts:
            queues = cfg.get('_queues') or {}
            chosen = [o for o in opts if o['kpp']['id'] == kpp_id]
            for o in opts:
                tot = int(round(o['km']))
                o['prices'] = calc_prices(cfg, tot, min(tot, int(round(o['new_km']))))
            pick = chosen[0] if chosen else min(opts, key=lambda o: o['prices']['standard'])
            km, approx, coords, via = pick['km'], False, [], pick['kpp']['name']
            extra = {'min': round((pick['time'] or 0) / 60)}
            new_km = pick['new_km']
            via_id = pick['kpp']['id']
            alts = sorted([{'id': o['kpp']['id'], 'kpp': o['kpp']['name'], 'km': round(o['km']), 'new_km': round(o['new_km']),
                            'min': round((o['time'] or 0) / 60), 'queue': queues.get(o['kpp']['id']), 'prices': o['prices']} for o in opts],
                          key=lambda x: x['prices']['standard'])
    if via is None:
        km, approx, coords, extra = f_route.result()
    ex.shutdown(wait=False)
    if km < 1:
        raise ApiError(400, 'Точки слишком близко. Сервис междугородний')

    def classify(points):
        with ThreadPoolExecutor(max_workers=10) as ex:
            return list(ex.map(lambda p: zone(reverse(p[0], p[1])), points))

    if via is None:
        new_km = min(km, max(0.0, new_territory_km(coords, km, za, zb, classify, started + 2.4)))
    if new_km < 3:
        new_km = 0.0
    toll, toll_known = None, False
    try:
        toll = f_toll.result(timeout=max(0.2, started + 3.6 - time.time()))
        toll_known = True
    except Exception:
        pass
    total = int(round(km))
    new_r = min(total, int(round(new_km)))
    reg_r = total - new_r
    prices = calc_prices(cfg, total, new_r)
    return {
        'distance_km': total,
        'new_km': new_r,
        'reg_km': reg_r,
        'kpp': via,
        'kpp_id': via_id,
        'kpp_alts': alts,
        'region': 'new' if new_km > 0 else 'regular',
        'prices': prices,
        'approx': approx,
        'duration_min': extra.get('min') or 0,
        'toll': toll,
        'toll_known': toll_known,
        'from_geo': pa,
        'min_price': cfg['min_price'],
    }

