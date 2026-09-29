import json
import os
import csv
import io
import urllib.request
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
    'Content-Type': 'application/json',
}

YM_COUNTER = '111028538'


def esc(v):
    if v is None or v == '':
        return 'NULL'
    return "'" + str(v)[:1000].replace("'", "''") + "'"


def num(v):
    try:
        return round(float(str(v).replace(' ', '').replace(',', '.')), 2)
    except (TypeError, ValueError):
        return 0.0


def db():
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    return conn, os.environ.get('MAIN_DB_SCHEMA', 'public')


def check_key(event) -> bool:
    admin = os.environ.get('ADMIN_KEY')
    if not admin:
        return True
    headers = event.get('headers') or {}
    given = headers.get('X-Admin-Key') or headers.get('x-admin-key')
    params = event.get('queryStringParameters') or {}
    return given == admin or params.get('key') == admin


def send_to_metrika(rows):
    """Отправляет офлайн-конверсии в Яндекс.Метрику. rows: list of dicts."""
    token = os.environ.get('YANDEX_METRIKA_TOKEN')
    if not token or not rows:
        return False, 'no token' if not token else 'no rows'

    by_client = [r for r in rows if r.get('ym_client_id')]
    if not by_client:
        return False, 'no client ids'

    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(['ClientId', 'Target', 'DateTime', 'Price', 'Currency'])
    for r in by_client:
        w.writerow([
            r['ym_client_id'],
            'payment',
            int(r['ts']),
            r['amount'],
            'RUB',
        ])
    payload = buf.getvalue().encode('utf-8')

    boundary = '----metrika' + os.urandom(8).hex()
    body = b''
    body += ('--%s\r\n' % boundary).encode()
    body += b'Content-Disposition: form-data; name="file"; filename="conversions.csv"\r\n'
    body += b'Content-Type: text/csv\r\n\r\n'
    body += payload
    body += ('\r\n--%s--\r\n' % boundary).encode()

    url = (
        'https://api-metrika.yandex.net/management/v1/counter/%s'
        '/offline_conversions/upload?client_id_type=CLIENT_ID' % YM_COUNTER
    )
    req = urllib.request.Request(url, data=body, method='POST')
    req.add_header('Authorization', 'OAuth ' + token)
    req.add_header('Content-Type', 'multipart/form-data; boundary=' + boundary)

    with urllib.request.urlopen(req, timeout=20) as resp:
        return True, resp.read().decode('utf-8')[:400]


def handler(event: dict, context) -> dict:
    """Учёт сделок: создание, список, отметка оплаты и выгрузка оплат в Яндекс.Метрику."""
    method = event.get('httpMethod')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action') or ''

    if not check_key(event):
        return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'forbidden'})}

    conn, schema = db()
    cur = conn.cursor()

    if method == 'GET':
        cur.execute(
            f"""SELECT id, client_name, client_phone, route_from, route_to, channel,
                       utm_source, utm_campaign, utm_term, amount, costs, profit, status,
                       trip_date, comment, sent_to_metrika, visit_key, ym_client_id, created_at
                FROM {schema}.deals ORDER BY created_at DESC LIMIT 300"""
        )
        deals = [
            {
                'id': r[0], 'clientName': r[1], 'clientPhone': r[2], 'routeFrom': r[3],
                'routeTo': r[4], 'channel': r[5], 'utmSource': r[6], 'utmCampaign': r[7],
                'utmTerm': r[8], 'amount': float(r[9] or 0), 'costs': float(r[10] or 0),
                'profit': float(r[11] or 0), 'status': r[12],
                'tripDate': r[13].isoformat() if r[13] else None, 'comment': r[14],
                'sentToMetrika': r[15], 'visitKey': r[16], 'ymClientId': r[17],
                'createdAt': r[18].isoformat() if r[18] else None,
            }
            for r in cur.fetchall()
        ]

        cur.execute(
            f"""SELECT COALESCE(utm_campaign, channel, 'без метки') AS src,
                       COUNT(*), COALESCE(SUM(amount),0), COALESCE(SUM(profit),0)
                FROM {schema}.deals WHERE status = 'paid'
                GROUP BY 1 ORDER BY 3 DESC"""
        )
        by_campaign = [
            {'name': r[0], 'deals': r[1], 'amount': float(r[2]), 'profit': float(r[3])}
            for r in cur.fetchall()
        ]

        cur.execute(
            f"""SELECT COUNT(*), COALESCE(SUM(amount),0), COALESCE(SUM(profit),0)
                FROM {schema}.deals WHERE status = 'paid'"""
        )
        t = cur.fetchone()
        totals = {'paidCount': t[0], 'amount': float(t[1]), 'profit': float(t[2])}

        cur.close()
        conn.close()
        return {
            'statusCode': 200, 'headers': CORS,
            'body': json.dumps({'deals': deals, 'byCampaign': by_campaign, 'totals': totals}),
        }

    body = json.loads(event.get('body') or '{}')

    if method == 'POST' and action == 'sync':
        cur.execute(
            f"""SELECT id, ym_client_id, amount, EXTRACT(EPOCH FROM created_at)
                FROM {schema}.deals
                WHERE status = 'paid' AND sent_to_metrika = FALSE
                  AND ym_client_id IS NOT NULL AND amount > 0 LIMIT 500"""
        )
        rows = [{'id': r[0], 'ym_client_id': r[1], 'amount': float(r[2]), 'ts': r[3]} for r in cur.fetchall()]
        ok, info = send_to_metrika(rows)
        if ok:
            ids = ','.join(str(r['id']) for r in rows)
            cur.execute(
                f"""UPDATE {schema}.deals SET sent_to_metrika = TRUE, sent_at = NOW(),
                    metrika_response = {esc(info)} WHERE id IN ({ids})"""
            )
        cur.close()
        conn.close()
        return {
            'statusCode': 200, 'headers': CORS,
            'body': json.dumps({'ok': ok, 'sent': len(rows) if ok else 0, 'info': info}),
        }

    if method == 'POST':
        visit_key = (body.get('visitKey') or '').strip().upper()[:16] or None
        ym_client_id = body.get('ymClientId')
        utm = {k: body.get(k) for k in ('utmSource', 'utmMedium', 'utmCampaign', 'utmTerm', 'utmContent')}
        yclid = body.get('yclid')

        if visit_key:
            cur.execute(
                f"""SELECT ym_client_id, yclid, utm_source, utm_medium, utm_campaign, utm_term, utm_content
                    FROM {schema}.ad_visits WHERE visit_key = {esc(visit_key)}"""
            )
            v = cur.fetchone()
            if v:
                ym_client_id = ym_client_id or v[0]
                yclid = yclid or v[1]
                for i, k in enumerate(('utmSource', 'utmMedium', 'utmCampaign', 'utmTerm', 'utmContent')):
                    utm[k] = utm[k] or v[2 + i]

        amount = num(body.get('amount'))
        costs = num(body.get('costs'))
        status = body.get('status') or ('paid' if amount > 0 else 'new')

        cur.execute(
            f"""INSERT INTO {schema}.deals
                (visit_key, ym_client_id, yclid, utm_source, utm_medium, utm_campaign, utm_term,
                 utm_content, channel, client_name, client_phone, route_from, route_to, car_class,
                 trip_date, amount, costs, profit, status, comment)
                VALUES ({esc(visit_key)}, {esc(ym_client_id)}, {esc(yclid)}, {esc(utm['utmSource'])},
                        {esc(utm['utmMedium'])}, {esc(utm['utmCampaign'])}, {esc(utm['utmTerm'])},
                        {esc(utm['utmContent'])}, {esc(body.get('channel'))}, {esc(body.get('clientName'))},
                        {esc(body.get('clientPhone'))}, {esc(body.get('routeFrom'))}, {esc(body.get('routeTo'))},
                        {esc(body.get('carClass'))},
                        {esc(body.get('tripDate')) if body.get('tripDate') else 'NULL'},
                        {amount}, {costs}, {round(amount - costs, 2)}, {esc(status)}, {esc(body.get('comment'))})
                RETURNING id"""
        )
        new_id = cur.fetchone()[0]
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'id': new_id})}

    if method == 'PUT':
        deal_id = int(body.get('id') or 0)
        if not deal_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}

        sets = []
        if 'amount' in body or 'costs' in body:
            cur.execute(f"SELECT amount, costs FROM {schema}.deals WHERE id = {deal_id}")
            cur_row = cur.fetchone() or (0, 0)
            amount = num(body['amount']) if 'amount' in body else float(cur_row[0] or 0)
            costs = num(body['costs']) if 'costs' in body else float(cur_row[1] or 0)
            sets += [f'amount = {amount}', f'costs = {costs}', f'profit = {round(amount - costs, 2)}']
        for field, col in (('status', 'status'), ('comment', 'comment'), ('clientName', 'client_name'),
                           ('clientPhone', 'client_phone'), ('routeFrom', 'route_from'),
                           ('routeTo', 'route_to'), ('channel', 'channel')):
            if field in body:
                sets.append(f'{col} = {esc(body[field])}')

        if sets:
            cur.execute(
                f"UPDATE {schema}.deals SET {', '.join(sets)}, updated_at = NOW() WHERE id = {deal_id}"
            )
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    if method == 'DELETE':
        deal_id = int(params.get('id') or body.get('id') or 0)
        if deal_id:
            cur.execute(f"DELETE FROM {schema}.deals WHERE id = {deal_id}")
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    cur.close()
    conn.close()
    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Method not allowed'})}
