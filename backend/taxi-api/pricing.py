import json
import math
import os
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from common import ApiError, TARIFFS

NEW_MARKERS = ('донец', 'луганск', 'херсон', 'запорож', 'donetsk', 'luhansk', 'lugansk', 'kherson', 'zaporiz')


def _get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'taxi-dalnyak'})
    with urllib.request.urlopen(req, timeout=3.5) as r:
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


def reverse(lat, lng):
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


def route_km(a, b):
    q = {'waypoints': f'{a[0]},{a[1]}|{b[0]},{b[1]}', 'mode': 'drive', 'apiKey': _key()}
    try:
        data = _get('https://api.geoapify.com/v1/routing?' + urllib.parse.urlencode(q))
        return data['features'][0]['properties']['distance'] / 1000.0, False
    except Exception:
        return haversine(a, b) * 1.25, True


def is_new_territory(*places):
    text = ' '.join(f"{p.get('state', '')} {p.get('city', '')} {p.get('label', '')}" for p in places if p).lower()
    return any(m in text for m in NEW_MARKERS)


def _valid_ll(lat, lng):
    try:
        lat, lng = float(lat), float(lng)
    except (TypeError, ValueError):
        raise ApiError(400, 'Не определены координаты')
    if not (-90 <= lat <= 90 and -180 <= lng <= 180):
        raise ApiError(400, 'Неверные координаты')
    return lat, lng


def quote(cfg, from_lat, from_lng, to_lat, to_lng):
    a = _valid_ll(from_lat, from_lng)
    b = _valid_ll(to_lat, to_lng)
    with ThreadPoolExecutor(max_workers=3) as ex:
        f_route = ex.submit(route_km, a, b)
        f_from = ex.submit(reverse, a[0], a[1])
        f_to = ex.submit(reverse, b[0], b[1])
        km, approx = f_route.result()
        pa, pb = f_from.result(), f_to.result()
    if km < 1:
        raise ApiError(400, 'Точки слишком близко. Сервис междугородний')
    region = 'new' if is_new_territory(pa, pb) else 'regular'
    rates = cfg['rates'][region]
    prices = {t: max(cfg['min_price'], int(round(km * rates[t] / 10.0) * 10)) for t in TARIFFS}
    return {
        'distance_km': round(km),
        'region': region,
        'prices': prices,
        'approx': approx,
        'from_geo': pa,
        'min_price': cfg['min_price'],
    }
