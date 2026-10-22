from common import S, ApiError, rate_limit
from pricing import KPPS

KPP_IDS = {k['id'] for k in KPPS}
CHOICES = (15, 30, 60, 120, 180, 300)


def report(cur, user, body):
    kid = body.get('kpp_id')
    if kid not in KPP_IDS:
        raise ApiError(400, 'Неизвестный КПП')
    try:
        minutes = int(body.get('minutes'))
    except (TypeError, ValueError):
        raise ApiError(400, 'Укажите время')
    if minutes not in CHOICES:
        raise ApiError(400, 'Неверное время')
    rate_limit(cur, f"kpp:{user['id']}:{kid}", 3, 1800)
    cur.execute(
        f"INSERT INTO {S}.app_kpp_reports (kpp_id, minutes, reporter_role, reporter_id) VALUES (%s, %s, 'driver', %s)",
        (kid, minutes, user['id']),
    )
    return {'ok': True, 'items': status(cur)}


def status(cur):
    cur.execute(
        f"""SELECT kpp_id, minutes, created_at,
                   extract(epoch FROM now() - created_at)::int / 60 AS ago
            FROM {S}.app_kpp_reports WHERE created_at > now() - interval '6 hours'
            ORDER BY created_at DESC"""
    )
    rows = cur.fetchall()
    by = {}
    for r in rows:
        by.setdefault(r['kpp_id'], []).append(r)
    out = []
    for k in KPPS:
        rs = by.get(k['id'], [])
        item = {'id': k['id'], 'name': k['name'], 'lat': k['lat'], 'lng': k['lng'], 'minutes': None, 'ago': None, 'reports': len(rs)}
        if rs:
            fresh = [r for r in rs if r['ago'] <= rs[0]['ago'] + 60][:5]
            w = [max(1, 7 - i) for i in range(len(fresh))]
            item['minutes'] = int(round(sum(r['minutes'] * x for r, x in zip(fresh, w)) / sum(w)))
            item['ago'] = rs[0]['ago']
        out.append(item)
    return out


def queues(cur):
    return {it['id']: it['minutes'] for it in status(cur) if it['minutes'] is not None}


def public(cur, body):
    return {'items': status(cur)}


def for_quote(cur, kpp_name):
    if not kpp_name:
        return None
    for it in status(cur):
        if it['name'] == kpp_name and it['minutes'] is not None:
            return {'minutes': it['minutes'], 'ago': it['ago']}
    return None
