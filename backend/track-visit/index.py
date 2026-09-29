import json
import os
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
}


def esc(v):
    if v is None:
        return 'NULL'
    return "'" + str(v)[:500].replace("'", "''") + "'"


def handler(event: dict, context) -> dict:
    """Запоминает рекламный источник визита: код визита, метки Яндекс.Директа и UTM."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Method not allowed'})}

    body = json.loads(event.get('body') or '{}')
    visit_key = (body.get('visitKey') or '').strip().upper()[:16]
    if not visit_key:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'visitKey required'})}

    headers = event.get('headers') or {}
    ip = (event.get('requestContext', {}).get('identity', {}) or {}).get('sourceIp')
    ua = headers.get('User-Agent') or headers.get('user-agent')

    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    cur = conn.cursor()

    cur.execute(
        f"""INSERT INTO {schema}.ad_visits
            (visit_key, ym_client_id, yclid, utm_source, utm_medium, utm_campaign,
             utm_term, utm_content, landing_page, referrer, user_agent, ip_address)
            VALUES ({esc(visit_key)}, {esc(body.get('ymClientId'))}, {esc(body.get('yclid'))},
                    {esc(body.get('utmSource'))}, {esc(body.get('utmMedium'))}, {esc(body.get('utmCampaign'))},
                    {esc(body.get('utmTerm'))}, {esc(body.get('utmContent'))}, {esc(body.get('landingPage'))},
                    {esc(body.get('referrer'))}, {esc(ua)}, {esc(ip)})
            ON CONFLICT (visit_key) DO UPDATE SET
                ym_client_id = COALESCE(EXCLUDED.ym_client_id, {schema}.ad_visits.ym_client_id),
                yclid = COALESCE(EXCLUDED.yclid, {schema}.ad_visits.yclid)"""
    )

    cur.close()
    conn.close()

    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'visitKey': visit_key})}
