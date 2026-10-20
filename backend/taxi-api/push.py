import base64
import json
import time
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


_QUEUE = []


def reset():
    _QUEUE.clear()


def _send_one(sub, payload, priv, deadline):
    from pywebpush import webpush, WebPushException
    from py_vapid import Vapid02
    for attempt in (1, 2):
        code = None
        try:
            vapid = Vapid02.from_raw(priv.encode())
            webpush(
                subscription_info={'endpoint': sub['endpoint'], 'keys': {'p256dh': sub['p256dh'], 'auth': sub['auth']}},
                data=payload,
                vapid_private_key=vapid,
                vapid_claims={'sub': 'mailto:support@taxidalnyack.ru'},
                ttl=3600,
                timeout=3,
                headers={'Urgency': 'high'},
            )
            return None
        except WebPushException as e:
            code = getattr(getattr(e, 'response', None), 'status_code', None)
            print(f'push failed sub={sub["id"]} status={code} attempt={attempt}')
            if code in (401, 403, 404, 410):
                return sub['id']
        except Exception as e:
            print(f'push error sub={sub["id"]} {type(e).__name__}: {e} attempt={attempt}')
        if attempt == 1 and time.time() < deadline - 1.5:
            time.sleep(0.3)
            continue
        return None
    return None


def send_push(cur, user_ids, title, body, url='/app/client', tag=None):
    ids = [int(i) for i in set(user_ids) if i]
    if not ids:
        return
    keys = vapid_keys(cur)
    cur.execute(f"SELECT id, endpoint, p256dh, auth FROM {S}.app_push_subs WHERE user_id = ANY(%s::bigint[])", (ids,))
    payload = json.dumps({'title': title, 'body': body, 'url': url, 'tag': tag or 'taxi'}, ensure_ascii=False)
    for sub in cur.fetchall():
        _QUEUE.append((sub, payload, keys['private']))


def flush(conn):
    items = list(_QUEUE)
    _QUEUE.clear()
    if not items:
        return
    deadline = time.time() + 4.2
    with ThreadPoolExecutor(max_workers=min(16, len(items))) as ex:
        gone = [g for g in ex.map(lambda it: _send_one(it[0], it[1], it[2], deadline), items) if g]
    if gone:
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {S}.app_push_subs WHERE id = ANY(%s::bigint[])", (gone,))
        conn.commit()


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
