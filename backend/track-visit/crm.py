import csv
import hashlib
import io
import json
import os
from datetime import datetime, timedelta, timezone
import urllib.error
import urllib.request

YM_COUNTER = '111028538'
STATUS_MAP = {
    'new': 'IN_PROGRESS', 'assigned': 'IN_PROGRESS', 'enroute': 'IN_PROGRESS',
    'arrived': 'IN_PROGRESS', 'in_progress': 'IN_PROGRESS',
    'done': 'PAID', 'cancelled': 'CANCELLED',
}
STATUS_RU = {'IN_PROGRESS': 'Создан / в работе', 'PAID': 'Оплачен', 'CANCELLED': 'Отменён'}
MAPPED = "CASE WHEN t.status = 'done' THEN 'PAID' WHEN t.status = 'cancelled' THEN 'CANCELLED' ELSE 'IN_PROGRESS' END"


def _token():
    return os.environ.get('YANDEX_METRIKA_TOKEN1') or os.environ.get('YANDEX_METRIKA_TOKEN')


def _phone(p):
    d = ''.join(ch for ch in str(p or '') if ch.isdigit())
    if len(d) == 11 and d[0] == '8':
        d = '7' + d[1:]
    return d if len(d) >= 11 else ''


def _upload(rows):
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(['id', 'create_date_time', 'client_uniq_id', 'client_ids', 'phones_md5', 'order_status', 'revenue', 'currency'])
    for r in rows:
        w.writerow(r)
    payload = buf.getvalue().encode('utf-8')
    boundary = '----crm' + os.urandom(8).hex()
    body = ('--%s\r\n' % boundary).encode()
    body += b'Content-Disposition: form-data; name="file"; filename="orders.csv"\r\n'
    body += b'Content-Type: text/csv\r\n\r\n' + payload
    body += ('\r\n--%s--\r\n' % boundary).encode()
    url = ('https://api-metrika.yandex.net/cdp/api/v1/counter/%s/data/simple_orders'
           '?merge_mode=SAVE&delimiter_type=COMMA' % YM_COUNTER)
    req = urllib.request.Request(url, data=body, method='POST')
    req.add_header('Authorization', 'OAuth ' + _token())
    req.add_header('Content-Type', 'multipart/form-data; boundary=' + boundary)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return True, resp.read().decode('utf-8')[:400]
    except urllib.error.HTTPError as e:
        return False, 'Метрика ответила: %s' % e.read().decode('utf-8')[:300]
    except Exception as e:
        return False, str(e)[:300]


def sync_orders(cur, schema, only_ids=None):
    """Отправляет заказы приложения в CRM Метрики: создан/в работе, оплачен, отменён"""
    if not _token():
        return {'ok': False, 'sent': 0, 'info': 'Добавьте токен Метрики в настройках проекта'}
    where = f"t.id IN ({','.join(str(int(i)) for i in only_ids)})" if only_ids else \
        f"t.created_at > NOW() - INTERVAL '90 days' AND t.crm_status IS DISTINCT FROM ({MAPPED})"
    cur.execute(
        f"""SELECT t.id, EXTRACT(EPOCH FROM t.created_at),
                   t.client_id, t.ym_client_id, u.phone, {MAPPED}, COALESCE(t.price, 0)
            FROM {schema}.app_trips t LEFT JOIN {schema}.app_users u ON u.id = t.client_id
            WHERE {where} ORDER BY t.id LIMIT 2000"""
    )
    rows, ids = [], []
    for r in cur.fetchall():
        phone = _phone(r[4])
        if not r[3] and not phone:
            continue
        status = r[5]
        revenue = int(r[6] or 0) if status == 'PAID' else 0
        created = datetime.fromtimestamp(float(r[1]), timezone(timedelta(hours=3))).strftime('%d.%m.%Y %H:%M:%S')
        rows.append(['trip_%d' % r[0], created, 'user_%d' % r[2], r[3] or '', hashlib.md5(phone.encode()).hexdigest() if phone else '', status, revenue, 'RUB'])
        ids.append((r[0], status))
    if not rows:
        return {'ok': True, 'sent': 0, 'info': 'Новых изменений по заказам нет'}
    ok, info = _upload(rows)
    if ok:
        for status in set(s for _, s in ids):
            part = ','.join(str(i) for i, s in ids if s == status)
            cur.execute(
                f"""UPDATE {schema}.app_trips SET crm_status = '{status}', crm_sent_at = NOW(),
                    crm_response = NULL WHERE id IN ({part})"""
            )
    else:
        part = ','.join(str(i) for i, _ in ids)
        cur.execute(f"UPDATE {schema}.app_trips SET crm_response = '{info.replace(chr(39), chr(39) * 2)}' WHERE id IN ({part})")
    return {'ok': ok, 'sent': len(rows) if ok else 0, 'info': info}


def sync_if_due(cur, schema):
    """Раз в сутки отправляет изменения по заказам в CRM Метрики"""
    if not _token():
        return
    cur.execute(f"SELECT updated_at < NOW() - INTERVAL '24 hours' FROM {schema}.app_state WHERE key = 'last_crm_sync'")
    row = cur.fetchone()
    if row and not row[0]:
        return
    result = sync_orders(cur, schema)
    save_state(cur, schema, result)


def save_state(cur, schema, result):
    cur.execute(
        f"""INSERT INTO {schema}.app_state (key, value, updated_at)
            VALUES ('last_crm_sync', '{json.dumps(result, ensure_ascii=False).replace(chr(39), chr(39) * 2)}', NOW())
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()"""
    )


def list_orders(cur, schema):
    """Заказы приложения с источником рекламы и статусом передачи в Метрику"""
    cur.execute(
        f"""SELECT t.id, t.created_at, t.status, {MAPPED}, t.crm_status, t.crm_sent_at, t.crm_response,
                   COALESCE(t.price, 0), t.from_text, t.to_text, t.distance_km, u.phone, u.name,
                   t.ym_client_id, t.yclid, t.utm_source, t.utm_campaign, t.utm_term, t.created_by
            FROM {schema}.app_trips t LEFT JOIN {schema}.app_users u ON u.id = t.client_id
            WHERE t.created_at > NOW() - INTERVAL '60 days' ORDER BY t.id DESC LIMIT 300"""
    )
    orders = []
    for r in cur.fetchall():
        orders.append({
            'id': r[0], 'createdAt': r[1].isoformat() if r[1] else None, 'tripStatus': r[2],
            'crmStatus': r[3], 'crmStatusRu': STATUS_RU.get(r[3], r[3]), 'sentStatus': r[4],
            'sentAt': r[5].isoformat() if r[5] else None, 'error': r[6],
            'price': float(r[7] or 0), 'from': r[8], 'to': r[9], 'km': float(r[10] or 0),
            'phone': r[11], 'name': r[12], 'ymClientId': r[13], 'fromAd': bool(r[14] or r[15]),
            'utmSource': r[15] or ('yandex' if r[14] else None), 'utmCampaign': r[16], 'utmTerm': r[17],
            'createdBy': r[18],
        })
    cur.execute(f"SELECT value, updated_at FROM {schema}.app_state WHERE key = 'last_crm_sync'")
    st = cur.fetchone()
    return {
        'orders': orders,
        'enabled': bool(_token()),
        'lastRun': st[1].isoformat() if st and st[1] else None,
        'lastResult': json.loads(st[0]) if st and st[0] else None,
        'pending': sum(1 for o in orders if o['sentStatus'] != o['crmStatus']),
    }
