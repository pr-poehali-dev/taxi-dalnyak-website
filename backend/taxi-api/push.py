import base64
import json
from concurrent.futures import ThreadPoolExecutor

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec

from common import S, TRIP_TEXT


def _b64(x):
    return base64.urlsafe_b64encode(x).decode().rstrip('=')


def vapid_keys(cur):
    cur.execute(f"SELECT value FROM {S}.app_settings WHERE key = 'vapid'")
    row = cur.fetchone()
    if row:
        return json.loads(row['value'])
    k = ec.generate_private_key(ec.SECP256R1())
    priv = _b64(k.private_numbers().private_value.to_bytes(32, 'big'))
    pub = _b64(k.public_key().public_bytes(serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint))
    keys = {'private': priv, 'public': pub}
    cur.execute(
        f"INSERT INTO {S}.app_settings (key, value) VALUES ('vapid', %s) ON CONFLICT (key) DO NOTHING",
        (json.dumps(keys),),
    )
    cur.execute(f"SELECT value FROM {S}.app_settings WHERE key = 'vapid'")
    return json.loads(cur.fetchone()['value'])


def _send_one(sub, payload, priv):
    from pywebpush import webpush, WebPushException
    from py_vapid import Vapid02
    try:
        raw = base64.urlsafe_b64decode(priv + '=' * (-len(priv) % 4))
        vapid = Vapid02.from_raw(raw)
        webpush(
            subscription_info={'endpoint': sub['endpoint'], 'keys': {'p256dh': sub['p256dh'], 'auth': sub['auth']}},
            data=payload,
            vapid_private_key=vapid,
            vapid_claims={'sub': 'mailto:support@taxidalnyack.ru'},
            ttl=3600,
            timeout=4,
        )
        return None
    except WebPushException as e:
        code = getattr(getattr(e, 'response', None), 'status_code', None)
        return sub['id'] if code in (404, 410) else None
    except Exception:
        return None


def send_push(cur, user_ids, title, body, url='/app', tag=None):
    ids = [int(i) for i in set(user_ids) if i]
    if not ids:
        return
    keys = vapid_keys(cur)
    cur.execute(f"SELECT id, endpoint, p256dh, auth FROM {S}.app_push_subs WHERE user_id = ANY(%s::bigint[])", (ids,))
    subs = cur.fetchall()
    if not subs:
        return
    payload = json.dumps({'title': title, 'body': body, 'url': url, 'tag': tag or 'taxi'}, ensure_ascii=False)
    with ThreadPoolExecutor(max_workers=min(8, len(subs))) as ex:
        gone = [g for g in ex.map(lambda s: _send_one(s, payload, keys['private']), subs) if g]
    if gone:
        cur.execute(f"DELETE FROM {S}.app_push_subs WHERE id = ANY(%s::bigint[])", (gone,))


def dispatcher_ids(cur):
    cur.execute(f"SELECT id FROM {S}.app_users WHERE role = 'dispatcher'")
    return [r['id'] for r in cur.fetchall()]


def drivers_for_trip(cur, tariff, priority_only=None, exclude_priority=False):
    cond = ''
    if priority_only:
        cond = 'AND dr.priority_until > now()'
    if exclude_priority:
        cond = 'AND (dr.priority_until IS NULL OR dr.priority_until <= now())'
    cur.execute(
        f"""SELECT u.id FROM {S}.app_users u JOIN {S}.app_drivers dr ON dr.user_id = u.id
            WHERE dr.status = 'approved' AND dr.on_line AND %s = ANY(dr.tariffs) {cond}""",
        (tariff,),
    )
    return [r['id'] for r in cur.fetchall()]


def trip_line(t):
    city = t.get('from_city') or ''
    street = t.get('from_street') or ''
    house = t.get('from_house') or ''
    src = ', '.join(x for x in [city, street, house] if x) or t.get('from_text') or 'по GPS'
    return f"{TRIP_TEXT.get(t.get('tariff'), '')} · {src} → {t.get('to_text')}"
