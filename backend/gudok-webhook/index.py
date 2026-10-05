import json
import os
import base64
import urllib.parse
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
}

ALIASES = {
    'gudok_call_id': ('call_id', 'id', 'callid', 'uniqueid', 'call_uuid'),
    'caller': ('caller', 'caller_number', 'phone', 'src', 'from', 'callerid', 'client_phone', 'caller_id'),
    'dst': ('dst', 'called', 'to', 'called_number', 'virtual_number', 'number', 'tracking_number'),
    'channel_name': ('adv_channel_name', 'channel', 'channel_name', 'source_name', 'source', 'channel_title'),
    'project_title': ('project', 'project_title', 'site', 'site_title'),
    'call_status': ('callstatus', 'status', 'call_status', 'disposition'),
    'duration': ('duration', 'call_duration'),
    'billsec': ('billsec', 'talk_duration', 'conversation_duration'),
    'region': ('region', 'city', 'caller_region'),
    'audio_url': ('record', 'record_url', 'audio', 'audio_url', 'recording', 'record_link'),
    'called_at': ('date', 'datetime', 'call_date', 'start', 'start_time', 'created_at', 'calldate'),
    'ym_client_id': ('ym_client_id', 'client_id', 'ym_uid', 'metrika_client_id', 'yandex_client_id', 'ymclientid'),
    'yclid': ('yclid',),
    'utm_source': ('utm_source',),
    'utm_medium': ('utm_medium',),
    'utm_campaign': ('utm_campaign',),
    'utm_term': ('utm_term', 'keyword', 'utm_keyword'),
    'utm_content': ('utm_content',),
    'visit_key': ('visit_key', 'visitkey'),
}


def esc(v):
    if v is None or v == '':
        return 'NULL'
    return "'" + str(v)[:2000].replace("'", "''") + "'"


def to_int(v):
    try:
        return int(float(str(v)))
    except (TypeError, ValueError):
        return None


def flatten(obj, out=None):
    out = {} if out is None else out
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, (dict, list)):
                flatten(v, out)
            else:
                out.setdefault(str(k).lower(), v)
    elif isinstance(obj, list):
        for v in obj:
            flatten(v, out)
    return out


def parse_event(event):
    data = {}
    for k, v in (event.get('queryStringParameters') or {}).items():
        data[str(k).lower()] = v

    raw = event.get('body') or ''
    if event.get('isBase64Encoded') and raw:
        raw = base64.b64decode(raw).decode('utf-8', 'replace')
    raw = raw.strip()
    if raw:
        try:
            flatten(json.loads(raw), data)
        except ValueError:
            for k, v in urllib.parse.parse_qsl(raw, keep_blank_values=True):
                data.setdefault(k.lower(), v)
    return data, raw


def pick(data, field):
    for name in ALIASES[field]:
        v = data.get(name)
        if v not in (None, ''):
            return str(v).strip()
    return None


def handler(event: dict, context) -> dict:
    """Принимает вебхуки Гудка о звонках и сохраняет их для связки с оплатами."""
    method = event.get('httpMethod')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    params = event.get('queryStringParameters') or {}
    secret = os.environ.get('GUDOK_WEBHOOK_SECRET')
    if secret and params.get('key') != secret:
        return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'ok': False, 'error': 'forbidden'})}

    data, raw = parse_event(event)
    f = {k: pick(data, k) for k in ALIASES}

    caller_digits = ''.join(ch for ch in (f['caller'] or '') if ch.isdigit())[-10:] or None
    gid = f['gudok_call_id']
    if not gid or gid == '0':
        gid = ('t' + str(context.request_id))[:64]
    called_at = (f['called_at'] or '').replace(' UTC', '').replace('T', ' ')[:19] or None
    ts_sql = 'NOW()'
    if called_at:
        ts_sql = f"COALESCE(NULLIF({esc(called_at)}, '')::timestamp, NOW())"

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    cur = conn.cursor()
    try:
        try:
            cur.execute(f"SELECT {ts_sql}")
        except Exception:
            ts_sql = 'NOW()'

        cur.execute(
            f"""INSERT INTO {schema}.gudok_calls
                (gudok_call_id, caller, caller_digits, dst, channel_name, project_title, call_status,
                 duration, billsec, region, audio_url, called_at, raw_payload,
                 ym_client_id, yclid, utm_source, utm_medium, utm_campaign, utm_term, utm_content, visit_key)
                VALUES ({esc(gid)}, {esc(f['caller'])}, {esc(caller_digits)}, {esc(f['dst'])},
                        {esc(f['channel_name'])}, {esc(f['project_title'])}, {esc(f['call_status'])},
                        {to_int(f['duration']) if to_int(f['duration']) is not None else 'NULL'},
                        {to_int(f['billsec']) if to_int(f['billsec']) is not None else 'NULL'},
                        {esc(f['region'])}, {esc(f['audio_url'])}, {ts_sql}, {esc(raw[:4000])},
                        {esc(f['ym_client_id'])}, {esc(f['yclid'])}, {esc(f['utm_source'])},
                        {esc(f['utm_medium'])}, {esc(f['utm_campaign'])}, {esc(f['utm_term'])},
                        {esc(f['utm_content'])}, {esc((f['visit_key'] or '').upper()[:16])})
                ON CONFLICT (gudok_call_id) DO UPDATE SET
                    call_status = EXCLUDED.call_status,
                    duration = EXCLUDED.duration,
                    billsec = EXCLUDED.billsec,
                    audio_url = COALESCE(EXCLUDED.audio_url, {schema}.gudok_calls.audio_url),
                    ym_client_id = COALESCE(EXCLUDED.ym_client_id, {schema}.gudok_calls.ym_client_id),
                    yclid = COALESCE(EXCLUDED.yclid, {schema}.gudok_calls.yclid),
                    utm_campaign = COALESCE(EXCLUDED.utm_campaign, {schema}.gudok_calls.utm_campaign),
                    utm_term = COALESCE(EXCLUDED.utm_term, {schema}.gudok_calls.utm_term)"""
        )
    finally:
        cur.close()
        conn.close()

    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}
