import json
import os
import csv
import io
import urllib.request
import urllib.parse
import urllib.error
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
}

YM_COUNTER = '111028538'
MAX_GOAL = 'max_payment'
MAX_ORDER_GOAL = 'max_order'
TGTRACK_MAX = 'https://max.tgtrack.ru/API/bot-api/v1/%s/send_reach_goal'
TGTRACK_MAX_REPORT = 'https://report.tgtrack.ru/max/api/%s?ver=1.0&platform=api&format=csv&apiKey=%s&date_from=%d&limit=%d'


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


def save_visit(event, body, cur, schema):
    visit_key = (body.get('visitKey') or '').strip().upper()[:16]
    if not visit_key:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'visitKey required'})}

    headers = event.get('headers') or {}
    ip = (event.get('requestContext', {}).get('identity', {}) or {}).get('sourceIp')
    ua = headers.get('User-Agent') or headers.get('user-agent')

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
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'visitKey': visit_key})}


def save_click(event, body, cur, schema):
    """Фиксирует обращение: звонок, Telegram или Макс — с рекламным источником."""
    channel = (body.get('channel') or '').strip().lower()[:32]
    if not channel:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'channel required'})}

    headers = event.get('headers') or {}
    ip = (event.get('requestContext', {}).get('identity', {}) or {}).get('sourceIp')
    ua = headers.get('User-Agent') or headers.get('user-agent')

    cur.execute(
        f"""INSERT INTO {schema}.lead_clicks
            (visit_key, channel, page, utm_source, utm_medium, utm_campaign,
             utm_term, utm_content, yclid, ym_client_id, user_agent, ip_address)
            VALUES ({esc(body.get('visitKey'))}, {esc(channel)}, {esc(body.get('page'))},
                    {esc(body.get('utmSource'))}, {esc(body.get('utmMedium'))}, {esc(body.get('utmCampaign'))},
                    {esc(body.get('utmTerm'))}, {esc(body.get('utmContent'))}, {esc(body.get('yclid'))},
                    {esc(body.get('ymClientId'))}, {esc(ua)}, {esc(ip)})"""
    )
    vk = (body.get('visitKey') or '').strip().upper()[:16]
    cid = (body.get('ymClientId') or '').strip()
    if vk and cid:
        cur.execute(
            f"""UPDATE {schema}.ad_visits SET ym_client_id = {esc(cid)}
                WHERE visit_key = {esc(vk)} AND ym_client_id IS NULL"""
        )
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}


def list_clicks(cur, schema):
    """Отчёт по обращениям: сегодня, вчера, за 7 дней, по каналам и кампаниям."""
    cur.execute(
        f"""SELECT channel,
                   COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) AS today,
                   COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE - 1) AS yesterday,
                   COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - 6) AS week,
                   COUNT(*) AS total
            FROM {schema}.lead_clicks
            GROUP BY channel ORDER BY total DESC"""
    )
    by_channel = [
        {'channel': r[0], 'today': r[1], 'yesterday': r[2], 'week': r[3], 'total': r[4]}
        for r in cur.fetchall()
    ]

    cur.execute(
        f"""SELECT COALESCE(NULLIF(utm_campaign,''),'без метки') AS camp,
                   COALESCE(NULLIF(utm_term,''),'—') AS term,
                   COUNT(*) AS cnt
            FROM {schema}.lead_clicks
            WHERE created_at >= CURRENT_DATE - 6
            GROUP BY camp, term ORDER BY cnt DESC LIMIT 30"""
    )
    by_campaign = [{'campaign': r[0], 'term': r[1], 'count': r[2]} for r in cur.fetchall()]

    cur.execute(
        f"""SELECT created_at, channel, page,
                   COALESCE(NULLIF(utm_campaign,''),'—'),
                   COALESCE(NULLIF(utm_term,''),'—')
            FROM {schema}.lead_clicks
            ORDER BY created_at DESC LIMIT 50"""
    )
    recent = [
        {'at': r[0].isoformat() if r[0] else None, 'channel': r[1],
         'page': r[2], 'campaign': r[3], 'term': r[4]}
        for r in cur.fetchall()
    ]

    cur.execute(
        f"""SELECT COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE),
                   COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - 6),
                   COUNT(*)
            FROM {schema}.lead_clicks"""
    )
    t = cur.fetchone()

    return {
        'totals': {'today': t[0], 'week': t[1], 'all': t[2]},
        'byChannel': by_channel,
        'byCampaign': by_campaign,
        'recent': recent,
    }


def enrich_from_calls(cur, schema):
    """Подтягивает код клиента Метрики, yclid и метки из звонков Гудка по номеру телефона."""
    cur.execute(
        f"""UPDATE {schema}.deals d SET
                ym_client_id = COALESCE(d.ym_client_id, c.ym_client_id),
                yclid = COALESCE(d.yclid, c.yclid),
                utm_source = COALESCE(d.utm_source, c.utm_source),
                utm_medium = COALESCE(d.utm_medium, c.utm_medium),
                utm_campaign = COALESCE(d.utm_campaign, c.utm_campaign),
                utm_term = COALESCE(d.utm_term, c.utm_term),
                utm_content = COALESCE(d.utm_content, c.utm_content)
            FROM (
                SELECT DISTINCT ON (caller_digits) caller_digits, ym_client_id, yclid,
                       utm_source, utm_medium, utm_campaign, utm_term, utm_content
                FROM {schema}.gudok_calls
                WHERE caller_digits IS NOT NULL AND (ym_client_id IS NOT NULL OR yclid IS NOT NULL)
                ORDER BY caller_digits, called_at DESC
            ) c
            WHERE d.sent_to_metrika = FALSE AND d.ym_client_id IS NULL
              AND d.client_phone IS NOT NULL
              AND RIGHT(REGEXP_REPLACE(d.client_phone, '[^0-9]', '', 'g'), 10) = c.caller_digits"""
    )


def send_to_metrika(rows, id_type='CLIENT_ID', target='payment'):
    """Загружает оплаты в Яндекс.Метрику как офлайн-конверсии."""
    token = os.environ.get('YANDEX_METRIKA_TOKEN1') or os.environ.get('YANDEX_METRIKA_TOKEN')
    if not token:
        return False, 'Добавьте токен Метрики в настройках проекта'
    if not rows:
        return True, 'Новых оплат для отправки нет'

    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow([('Yclid' if id_type == 'YCLID' else 'ClientId'), 'Target', 'DateTime', 'Price', 'Currency'])
    for r in rows:
        w.writerow([r['ym_client_id'], target, int(r['ts']), r['amount'], 'RUB'])
    payload = buf.getvalue().encode('utf-8')

    boundary = '----metrika' + os.urandom(8).hex()
    body = ('--%s\r\n' % boundary).encode()
    body += b'Content-Disposition: form-data; name="file"; filename="conversions.csv"\r\n'
    body += b'Content-Type: text/csv\r\n\r\n'
    body += payload
    body += ('\r\n--%s--\r\n' % boundary).encode()

    url = (
        'https://api-metrika.yandex.net/management/v1/counter/%s'
        '/offline_conversions/upload?client_id_type=%s' % (YM_COUNTER, id_type)
    )
    req = urllib.request.Request(url, data=body, method='POST')
    req.add_header('Authorization', 'OAuth ' + token)
    req.add_header('Content-Type', 'multipart/form-data; boundary=' + boundary)

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return True, resp.read().decode('utf-8')[:400]
    except urllib.error.HTTPError as e:
        return False, 'Метрика ответила: %s' % e.read().decode('utf-8')[:300]
    except Exception as e:
        return False, str(e)[:300]


def max_send_goal(user_id, target=None):
    """Передаёт цель «оплата» в «Откуда Подписки» (Макс) — сервис сам отправит её в Метрику."""
    key = os.environ.get('TGTRACK_MAX_API_KEY')
    if not key:
        return False, 'Добавьте API-ключ «Откуда Подписки»'
    data = json.dumps({'user_id': str(user_id), 'target': target or MAX_GOAL}).encode()
    req = urllib.request.Request(TGTRACK_MAX % key, data=data, method='POST')
    req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            text = resp.read().decode('utf-8')[:300]
            try:
                if json.loads(text).get('status') == 'error':
                    return False, text
            except ValueError:
                pass
            return True, text
    except urllib.error.HTTPError as e:
        return False, 'Откуда Подписки: %s' % e.read().decode('utf-8')[:200]
    except Exception as e:
        return False, str(e)[:200]


def tgtrack_csv(method, key, since, limit=500):
    url = TGTRACK_MAX_REPORT % (method, urllib.parse.quote(key), since, limit)
    with urllib.request.urlopen(url, timeout=8) as resp:
        text = resp.read().decode('utf-8-sig', 'replace')
    return list(csv.DictReader(io.StringIO(text))), text


def max_leads():
    """Список людей, пришедших в Макс с рекламы за 21 день (из «Откуда Подписки»)."""
    key = os.environ.get('TGTRACK_MAX_REPORT_KEY')
    if not key:
        return {'enabled': False, 'leads': []}
    import time
    since = int(time.time()) - 21 * 86400
    clean = lambda v: '' if (v or '').strip() in ('', '0') else v.strip()
    seen, leads, errors = set(), [], []

    for method, id_field, date_field in (
        ('get_chat_members.php', 'userID', 'eventDate'),
        ('get_click_data.php', 'mxUserID', 'date'),
    ):
        try:
            rows, _ = tgtrack_csv(method, key, since)
        except Exception as e:
            errors.append('%s: %s' % (method, str(e)[:150]))
            continue
        for r in rows:
            uid = clean(r.get(id_field)) or clean(r.get('mxUserID'))
            if not uid or uid in seen:
                continue
            seen.add(uid)
            name = ' '.join(x for x in [clean(r.get('first_name')), clean(r.get('last_name'))] if x)
            leads.append({
                'userId': uid,
                'name': name or clean(r.get('username')) or 'Клиент ' + uid[-4:],
                'username': clean(r.get('username')),
                'date': int(float(clean(r.get(date_field)) or 0)),
                'utmSource': clean(r.get('utm_source_id')),
                'utmCampaign': clean(r.get('utm_campaign_id')),
                'utmTerm': clean(r.get('utm_term_id')),
            })

    leads.sort(key=lambda x: x['date'], reverse=True)
    out = {'enabled': True, 'leads': leads}
    if errors and not leads:
        out['error'] = '; '.join(errors)
    return out


def list_deals(cur, schema):
    try:
        enrich_from_calls(cur, schema)
    except Exception:
        pass
    cur.execute(
        f"""SELECT id, client_name, client_phone, route_from, route_to, channel,
                   utm_source, utm_campaign, utm_term, amount, costs, profit, status,
                   comment, sent_to_metrika, visit_key, ym_client_id, created_at,
                   max_user_id, max_goal_sent, max_goal_response, yclid,
                   EXISTS (SELECT 1 FROM {schema}.gudok_calls g
                           WHERE g.caller_digits IS NOT NULL AND d.client_phone IS NOT NULL
                             AND g.caller_digits = RIGHT(REGEXP_REPLACE(d.client_phone, '[^0-9]', '', 'g'), 10))
            FROM {schema}.deals d ORDER BY created_at DESC LIMIT 300"""
    )
    deals = [
        {
            'id': r[0], 'clientName': r[1], 'clientPhone': r[2], 'routeFrom': r[3],
            'routeTo': r[4], 'channel': r[5], 'utmSource': r[6], 'utmCampaign': r[7],
            'utmTerm': r[8], 'amount': float(r[9] or 0), 'costs': float(r[10] or 0),
            'profit': float(r[11] or 0), 'status': r[12], 'comment': r[13],
            'sentToMetrika': r[14], 'visitKey': r[15], 'ymClientId': r[16] or r[21],
            'createdAt': r[17].isoformat() if r[17] else None,
            'maxUserId': r[18], 'maxGoalSent': r[19], 'maxGoalInfo': r[20],
            'gudokCall': bool(r[22]),
        }
        for r in cur.fetchall()
    ]

    cur.execute(
        f"""SELECT COALESCE(utm_campaign, channel, 'без метки'),
                   COUNT(*), COALESCE(SUM(amount),0), COALESCE(SUM(profit),0)
            FROM {schema}.deals WHERE status = 'paid' GROUP BY 1 ORDER BY 3 DESC"""
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

    cur.execute(
        f"""SELECT value, updated_at FROM {schema}.app_state WHERE key = 'last_metrika_sync'"""
    )
    st = cur.fetchone()

    cur.execute(
        f"""SELECT COUNT(*) FROM {schema}.deals
            WHERE status = 'paid' AND sent_to_metrika = FALSE
              AND (ym_client_id IS NOT NULL OR yclid IS NOT NULL) AND amount > 0"""
    )
    pending = cur.fetchone()[0]

    return {
        'deals': deals,
        'byCampaign': by_campaign,
        'totals': {'paidCount': t[0], 'amount': float(t[1]), 'profit': float(t[2])},
        'autoSync': {
            'enabled': bool(os.environ.get('YANDEX_METRIKA_TOKEN1') or os.environ.get('YANDEX_METRIKA_TOKEN')),
            'lastRun': st[1].isoformat() if st and st[1] else None,
            'lastResult': st[0] if st else None,
            'pending': pending,
        },
        'maxGoal': {
            'enabled': bool(os.environ.get('TGTRACK_MAX_API_KEY')),
            'leadsEnabled': bool(os.environ.get('TGTRACK_MAX_REPORT_KEY')),
        },
    }


def list_calls(cur, schema):
    cur.execute(
        f"""SELECT g.id, g.caller, g.dst, g.call_status, g.duration, g.called_at, g.ym_client_id,
                   g.yclid, g.utm_campaign, g.utm_term, g.is_spam, g.deal_id, g.audio_url,
                   d.amount, d.sent_to_metrika
            FROM {schema}.gudok_calls g LEFT JOIN {schema}.deals d ON d.id = g.deal_id
            ORDER BY g.called_at DESC NULLS LAST, g.id DESC LIMIT 100"""
    )
    return [
        {
            'id': r[0], 'caller': r[1], 'dst': r[2], 'status': r[3], 'duration': r[4],
            'calledAt': r[5].isoformat() if r[5] else None, 'hasClientId': bool(r[6] or r[7]),
            'campaign': r[8], 'term': r[9], 'spam': r[10], 'dealId': r[11], 'audio': r[12],
            'amount': float(r[13]) if r[13] is not None else None, 'sent': bool(r[14]),
        }
        for r in cur.fetchall()
    ]


def call_deal(body, cur, schema):
    call_id = int(body.get('callId') or 0)
    cur.execute(
        f"""SELECT caller, ym_client_id, yclid, utm_source, utm_medium, utm_campaign, utm_term,
                   utm_content, visit_key, deal_id FROM {schema}.gudok_calls WHERE id = {call_id}"""
    )
    c = cur.fetchone()
    if not c:
        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'ok': False, 'error': 'Звонок не найден'})}
    if c[9]:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'ok': False, 'error': 'Оплата по этому звонку уже внесена'})}

    payload = {
        'visitKey': c[8], 'ymClientId': c[1], 'yclid': c[2], 'utmSource': c[3] or 'gudok',
        'utmMedium': c[4], 'utmCampaign': c[5], 'utmTerm': c[6], 'utmContent': c[7],
        'channel': 'phone', 'clientPhone': c[0], 'clientName': body.get('clientName'),
        'routeFrom': body.get('routeFrom'), 'routeTo': body.get('routeTo'),
        'amount': body.get('amount'), 'costs': body.get('costs'), 'status': 'paid',
    }
    res = create_deal(payload, cur, schema)
    deal_id = json.loads(res['body']).get('id')
    cur.execute(f"UPDATE {schema}.gudok_calls SET deal_id = {int(deal_id)}, is_spam = FALSE WHERE id = {call_id}")
    try:
        sync_metrika(cur, schema)
    except Exception:
        pass
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'id': deal_id})}


def list_feed(cur, schema):
    items = []
    cur.execute(
        f"""SELECT c.id, c.channel, c.page, c.utm_campaign, c.utm_term, c.created_at,
                   COALESCE(c.ym_client_id, v.ym_client_id), COALESCE(c.yclid, v.yclid),
                   c.deal_id, c.is_spam, d.status, d.amount, d.sent_to_metrika, d.order_sent, d.client_name
            FROM {schema}.lead_clicks c
            LEFT JOIN {schema}.deals d ON d.id = c.deal_id
            LEFT JOIN {schema}.ad_visits v ON v.visit_key = c.visit_key
            WHERE c.created_at > NOW() - INTERVAL '30 days'
              AND NOT (c.channel IN ('phone', 'call') AND c.visit_key IS NOT NULL AND EXISTS (
                    SELECT 1 FROM {schema}.gudok_calls g WHERE g.visit_key = c.visit_key))
            ORDER BY c.created_at DESC LIMIT 150"""
    )
    for r in cur.fetchall():
        items.append({
            'src': 'click', 'id': r[0], 'channel': r[1], 'page': r[2], 'campaign': r[3], 'term': r[4],
            'at': r[5].isoformat() if r[5] else None, 'hasId': bool(r[6] or r[7]),
            'dealId': r[8], 'spam': r[9], 'dealStatus': r[10],
            'amount': float(r[11]) if r[11] is not None else None,
            'paidSent': bool(r[12]), 'orderSent': bool(r[13]), 'name': r[14],
        })
    cur.execute(
        f"""SELECT g.id, g.caller, g.created_at, COALESCE(g.ym_client_id, v.ym_client_id),
                   COALESCE(g.yclid, v.yclid), g.utm_campaign, g.utm_term, g.duration,
                   g.deal_id, g.is_spam, d.status, d.amount, d.sent_to_metrika, d.order_sent, d.client_name
            FROM {schema}.gudok_calls g
            LEFT JOIN {schema}.deals d ON d.id = g.deal_id
            LEFT JOIN {schema}.ad_visits v ON v.visit_key = g.visit_key
            WHERE g.created_at > NOW() - INTERVAL '30 days'
            ORDER BY g.created_at DESC LIMIT 100"""
    )
    for r in cur.fetchall():
        items.append({
            'src': 'call', 'id': r[0], 'channel': 'gudok', 'caller': r[1],
            'at': r[2].isoformat() if r[2] else None, 'hasId': bool(r[3] or r[4]),
            'campaign': r[5], 'term': r[6], 'duration': r[7], 'dealId': r[8], 'spam': r[9],
            'dealStatus': r[10], 'amount': float(r[11]) if r[11] is not None else None,
            'paidSent': bool(r[12]), 'orderSent': bool(r[13]), 'name': r[14],
        })
    items = [i for i in items if not (i['src'] == 'click' and i['channel'] == 'max')]
    items.sort(key=lambda x: x['at'] or '', reverse=True)
    return items


def max_deals_map(cur, schema):
    cur.execute(
        f"""SELECT max_user_id, id, status, amount, order_sent, max_goal_sent, max_goal_response
            FROM {schema}.deals WHERE max_user_id IS NOT NULL ORDER BY id"""
    )
    out = {}
    for r in cur.fetchall():
        out[r[0]] = {'dealId': r[1], 'status': r[2], 'amount': float(r[3] or 0),
                     'orderSent': bool(r[4]), 'paidSent': bool(r[5]), 'info': r[6]}
    return out


def max_stage(body, cur, schema):
    uid = ''.join(ch for ch in str(body.get('id') or '') if ch.isdigit())[:30]
    stage = body.get('stage')
    if not uid:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'ok': False, 'error': 'Нет ID клиента'})}
    amount = num(body.get('amount'))
    costs = num(body.get('costs'))
    if stage == 'paid' and amount <= 0:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'ok': False, 'error': 'Укажите сумму оплаты'})}

    cur.execute(f"SELECT id FROM {schema}.deals WHERE max_user_id = {esc(uid)} ORDER BY id DESC LIMIT 1")
    row = cur.fetchone()
    if row:
        deal_id = row[0]
        if stage == 'paid':
            cur.execute(
                f"""UPDATE {schema}.deals SET status = 'paid', amount = {amount}, costs = {costs},
                    profit = {round(amount - costs, 2)}, updated_at = NOW() WHERE id = {deal_id}"""
            )
    else:
        res = create_deal({
            'channel': 'max', 'maxUserId': uid, 'clientName': body.get('clientName') or body.get('name'),
            'routeFrom': body.get('routeFrom'), 'routeTo': body.get('routeTo'),
            'amount': amount if stage == 'paid' else 0, 'costs': costs,
            'status': 'paid' if stage == 'paid' else 'order',
            'maxUtmSource': body.get('utmSource'), 'maxUtmCampaign': body.get('utmCampaign'),
            'maxUtmTerm': body.get('utmTerm'),
        }, cur, schema)
        deal_id = json.loads(res['body']).get('id')

    if stage == 'order':
        ok, info = max_send_goal(uid, MAX_ORDER_GOAL)
        cur.execute(f"UPDATE {schema}.deals SET order_sent = {'TRUE' if ok else 'FALSE'} WHERE id = {int(deal_id)}")
    else:
        ok, info = max_send_goal(uid)
        cur.execute(
            f"""UPDATE {schema}.deals SET max_goal_sent = {'TRUE' if ok else 'FALSE'},
                max_goal_response = {esc(info)} WHERE id = {int(deal_id)}"""
        )
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'id': deal_id, 'sent': ok, 'info': info})}


def load_source(cur, schema, src, sid):
    if src == 'call':
        cur.execute(
            f"""SELECT visit_key, ym_client_id, yclid, utm_source, utm_medium, utm_campaign, utm_term,
                       utm_content, deal_id, caller FROM {schema}.gudok_calls WHERE id = {sid}"""
        )
        channel = 'phone'
    else:
        cur.execute(
            f"""SELECT visit_key, ym_client_id, yclid, utm_source, utm_medium, utm_campaign, utm_term,
                       utm_content, deal_id, NULL, channel FROM {schema}.lead_clicks WHERE id = {sid}"""
        )
        channel = None
    r = cur.fetchone()
    if not r:
        return None
    return {
        'visitKey': r[0], 'ymClientId': r[1], 'yclid': r[2], 'utmSource': r[3], 'utmMedium': r[4],
        'utmCampaign': r[5], 'utmTerm': r[6], 'utmContent': r[7], 'dealId': r[8], 'clientPhone': r[9],
        'channel': channel or (r[10] if len(r) > 10 else None),
    }


def set_stage(body, cur, schema):
    src = 'call' if body.get('src') == 'call' else 'click'
    sid = int(body.get('id') or 0)
    stage = body.get('stage')
    row = load_source(cur, schema, src, sid)
    if not row:
        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'ok': False, 'error': 'Обращение не найдено'})}

    amount = num(body.get('amount'))
    costs = num(body.get('costs'))
    if stage == 'paid' and amount <= 0:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'ok': False, 'error': 'Укажите сумму оплаты'})}

    deal_id = row['dealId']
    if deal_id:
        if stage == 'paid':
            cur.execute(
                f"""UPDATE {schema}.deals SET status = 'paid', amount = {amount}, costs = {costs},
                    profit = {round(amount - costs, 2)}, sent_to_metrika = FALSE, updated_at = NOW()
                    WHERE id = {int(deal_id)}"""
            )
        else:
            cur.execute(f"UPDATE {schema}.deals SET order_pending = TRUE WHERE id = {int(deal_id)} AND order_sent = FALSE")
    else:
        payload = dict(row)
        payload.update({
            'clientName': body.get('clientName'), 'routeFrom': body.get('routeFrom'),
            'routeTo': body.get('routeTo'), 'amount': amount if stage == 'paid' else 0,
            'costs': costs, 'status': 'paid' if stage == 'paid' else 'order',
        })
        res = create_deal(payload, cur, schema)
        deal_id = json.loads(res['body']).get('id')
        if stage == 'order':
            cur.execute(f"UPDATE {schema}.deals SET order_pending = TRUE WHERE id = {int(deal_id)}")
        tbl = 'gudok_calls' if src == 'call' else 'lead_clicks'
        cur.execute(f"UPDATE {schema}.{tbl} SET deal_id = {int(deal_id)} WHERE id = {sid}")

    sent = None
    try:
        sent = json.loads(sync_metrika(cur, schema)['body'])
    except Exception:
        pass
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'id': deal_id, 'metrika': sent})}


def create_deal(body, cur, schema):
    visit_key = (body.get('visitKey') or '').strip().upper()[:16] or None
    ym_client_id = body.get('ymClientId')
    yclid = body.get('yclid')
    keys = ('utmSource', 'utmMedium', 'utmCampaign', 'utmTerm', 'utmContent')
    utm = {k: body.get(k) for k in keys}

    if visit_key:
        cur.execute(
            f"""SELECT ym_client_id, yclid, utm_source, utm_medium, utm_campaign, utm_term, utm_content
                FROM {schema}.ad_visits WHERE visit_key = {esc(visit_key)}"""
        )
        v = cur.fetchone()
        if v:
            ym_client_id = ym_client_id or v[0]
            yclid = yclid or v[1]
            for i, k in enumerate(keys):
                utm[k] = utm[k] or v[2 + i]
        if not ym_client_id:
            cur.execute(
                f"""SELECT ym_client_id FROM {schema}.lead_clicks
                    WHERE visit_key = {esc(visit_key)} AND ym_client_id IS NOT NULL
                    ORDER BY created_at DESC LIMIT 1"""
            )
            lc = cur.fetchone()
            if lc:
                ym_client_id = lc[0]

    amount = num(body.get('amount'))
    costs = num(body.get('costs'))
    status = body.get('status') or ('paid' if amount > 0 else 'new')
    max_uid = ''.join(ch for ch in str(body.get('maxUserId') or '') if ch.isdigit())[:30] or None
    if max_uid and not utm['utmCampaign']:
        utm['utmSource'] = utm['utmSource'] or body.get('maxUtmSource') or 'max'
        utm['utmCampaign'] = body.get('maxUtmCampaign') or None
        utm['utmTerm'] = utm['utmTerm'] or body.get('maxUtmTerm') or None

    cur.execute(
        f"""INSERT INTO {schema}.deals
            (visit_key, ym_client_id, yclid, utm_source, utm_medium, utm_campaign, utm_term,
             utm_content, channel, client_name, client_phone, route_from, route_to,
             amount, costs, profit, status, comment, max_user_id)
            VALUES ({esc(visit_key)}, {esc(ym_client_id)}, {esc(yclid)}, {esc(utm['utmSource'])},
                    {esc(utm['utmMedium'])}, {esc(utm['utmCampaign'])}, {esc(utm['utmTerm'])},
                    {esc(utm['utmContent'])}, {esc(body.get('channel'))}, {esc(body.get('clientName'))},
                    {esc(body.get('clientPhone'))}, {esc(body.get('routeFrom'))}, {esc(body.get('routeTo'))},
                    {amount}, {costs}, {round(amount - costs, 2)}, {esc(status)}, {esc(body.get('comment'))},
                    {esc(max_uid)})
            RETURNING id"""
    )
    deal_id = cur.fetchone()[0]
    try:
        enrich_from_calls(cur, schema)
    except Exception:
        pass
    goal = None
    if max_uid and status == 'paid':
        ok, info = max_send_goal(max_uid)
        goal = {'ok': ok, 'info': info}
        cur.execute(
            f"""UPDATE {schema}.deals SET max_goal_sent = {'TRUE' if ok else 'FALSE'},
                max_goal_response = {esc(info)} WHERE id = {deal_id}"""
        )
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'id': deal_id, 'maxGoal': goal})}


def sync_metrika(cur, schema):
    enrich_from_calls(cur, schema)
    cur.execute(
        f"""SELECT id, ym_client_id, yclid, amount, EXTRACT(EPOCH FROM created_at)
            FROM {schema}.deals
            WHERE status = 'paid' AND sent_to_metrika = FALSE
              AND (ym_client_id IS NOT NULL OR yclid IS NOT NULL) AND amount > 0 LIMIT 500"""
    )
    by_cid, by_yclid = [], []
    for r in cur.fetchall():
        if r[1]:
            by_cid.append({'id': r[0], 'ym_client_id': r[1], 'amount': float(r[3]), 'ts': r[4]})
        else:
            by_yclid.append({'id': r[0], 'ym_client_id': r[2], 'amount': float(r[3]), 'ts': r[4]})

    ok_all, infos, sent = True, [], 0
    for rows, id_type in ((by_cid, 'CLIENT_ID'), (by_yclid, 'YCLID')):
        if not rows:
            continue
        ok, info = send_to_metrika(rows, id_type)
        infos.append(info)
        if ok:
            sent += len(rows)
            ids = ','.join(str(r['id']) for r in rows)
            cur.execute(
                f"""UPDATE {schema}.deals SET sent_to_metrika = TRUE, sent_at = NOW(),
                    metrika_response = {esc(info)} WHERE id IN ({ids})"""
            )
        else:
            ok_all = False
    cur.execute(
        f"""SELECT id, ym_client_id, yclid, EXTRACT(EPOCH FROM created_at)
            FROM {schema}.deals
            WHERE order_pending = TRUE AND order_sent = FALSE
              AND (ym_client_id IS NOT NULL OR yclid IS NOT NULL) LIMIT 500"""
    )
    o_cid, o_yclid = [], []
    for r in cur.fetchall():
        if r[1]:
            o_cid.append({'id': r[0], 'ym_client_id': r[1], 'amount': 0, 'ts': r[3]})
        else:
            o_yclid.append({'id': r[0], 'ym_client_id': r[2], 'amount': 0, 'ts': r[3]})
    for rows, id_type in ((o_cid, 'CLIENT_ID'), (o_yclid, 'YCLID')):
        if not rows:
            continue
        ok, info = send_to_metrika(rows, id_type, 'order')
        infos.append(info)
        if ok:
            sent += len(rows)
            ids = ','.join(str(r['id']) for r in rows)
            cur.execute(
                f"""UPDATE {schema}.deals SET order_sent = TRUE, order_pending = FALSE
                    WHERE id IN ({ids})"""
            )
        else:
            ok_all = False
    info = ' | '.join(infos) if infos else 'Новых оплат для отправки нет'
    return {
        'statusCode': 200, 'headers': CORS,
        'body': json.dumps({'ok': ok_all, 'sent': sent, 'info': info}),
    }


def auto_sync_if_due(cur, schema):
    """Раз в сутки сама отправляет накопившиеся оплаты в Метрику."""
    if not (os.environ.get('YANDEX_METRIKA_TOKEN1') or os.environ.get('YANDEX_METRIKA_TOKEN')):
        return

    cur.execute(
        f"""SELECT updated_at < NOW() - INTERVAL '24 hours'
            FROM {schema}.app_state WHERE key = 'last_metrika_sync'"""
    )
    row = cur.fetchone()
    if row and not row[0]:
        return

    cur.execute(
        f"""SELECT COUNT(*) FROM {schema}.deals
            WHERE status = 'paid' AND sent_to_metrika = FALSE
              AND (ym_client_id IS NOT NULL OR yclid IS NOT NULL) AND amount > 0"""
    )
    if not cur.fetchone()[0]:
        return

    result = json.loads(sync_metrika(cur, schema)['body'])
    cur.execute(
        f"""INSERT INTO {schema}.app_state (key, value, updated_at)
            VALUES ('last_metrika_sync', {esc(json.dumps(result, ensure_ascii=False))}, NOW())
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()"""
    )


def update_deal(body, cur, schema):
    deal_id = int(body.get('id') or 0)
    if not deal_id:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}

    sets = []
    if 'amount' in body or 'costs' in body:
        cur.execute(f"SELECT amount, costs FROM {schema}.deals WHERE id = {deal_id}")
        row = cur.fetchone() or (0, 0)
        amount = num(body['amount']) if 'amount' in body else float(row[0] or 0)
        costs = num(body['costs']) if 'costs' in body else float(row[1] or 0)
        sets += [f'amount = {amount}', f'costs = {costs}', f'profit = {round(amount - costs, 2)}']

    for field, col in (('status', 'status'), ('comment', 'comment'), ('clientName', 'client_name'),
                       ('clientPhone', 'client_phone'), ('routeFrom', 'route_from'),
                       ('routeTo', 'route_to'), ('channel', 'channel')):
        if field in body:
            sets.append(f'{col} = {esc(body[field])}')

    if sets:
        cur.execute(f"UPDATE {schema}.deals SET {', '.join(sets)}, updated_at = NOW() WHERE id = {deal_id}")
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}


def handler(event: dict, context) -> dict:
    """Сквозная аналитика: визиты из рекламы, учёт оплат и выгрузка их в Яндекс.Метрику."""
    method = event.get('httpMethod')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action') or ''
    body = json.loads(event.get('body') or '{}')

    conn, schema = db()
    cur = conn.cursor()
    try:
        if method == 'GET' and action == 'clicks':
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(list_clicks(cur, schema))}

        if method == 'GET' and action == 'feed':
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'feed': list_feed(cur, schema), 'maxDeals': max_deals_map(cur, schema)})}

        if method == 'POST' and action == 'stage':
            if body.get('src') == 'max':
                return max_stage(body, cur, schema)
            return set_stage(body, cur, schema)

        if method == 'POST' and action == 'feed_spam':
            tbl = 'gudok_calls' if body.get('src') == 'call' else 'lead_clicks'
            flag = 'TRUE' if body.get('spam') else 'FALSE'
            cur.execute(f"UPDATE {schema}.{tbl} SET is_spam = {flag} WHERE id = {int(body.get('id') or 0)}")
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        if method == 'GET' and action == 'calls':
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'calls': list_calls(cur, schema)})}

        if method == 'POST' and action == 'call_deal':
            return call_deal(body, cur, schema)

        if method == 'POST' and action == 'call_spam':
            cid = int(body.get('callId') or 0)
            flag = 'TRUE' if body.get('spam') else 'FALSE'
            cur.execute(f"UPDATE {schema}.gudok_calls SET is_spam = {flag} WHERE id = {cid}")
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        if method == 'GET' and action == 'max_leads':
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(max_leads())}

        if method == 'GET':
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(list_deals(cur, schema))}

        if method == 'POST' and action == 'click':
            return save_click(event, body, cur, schema)

        if method == 'POST' and action == 'visit':
            result = save_visit(event, body, cur, schema)
            try:
                auto_sync_if_due(cur, schema)
            except Exception:
                pass
            return result

        if method == 'POST' and action == 'sync':
            return sync_metrika(cur, schema)

        if method == 'POST' and action == 'max_goal':
            deal_id = int(body.get('id') or 0)
            cur.execute(f"SELECT max_user_id FROM {schema}.deals WHERE id = {deal_id}")
            row = cur.fetchone()
            if not row or not row[0]:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'ok': False, 'info': 'Нет ID клиента в Максе'})}
            ok, info = max_send_goal(row[0])
            cur.execute(
                f"""UPDATE {schema}.deals SET max_goal_sent = {'TRUE' if ok else 'FALSE'},
                    max_goal_response = {esc(info)} WHERE id = {deal_id}"""
            )
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': ok, 'info': info})}

        if method == 'POST':
            return create_deal(body, cur, schema)

        if method == 'PUT':
            return update_deal(body, cur, schema)

        if method == 'DELETE':
            deal_id = int(params.get('id') or body.get('id') or 0)
            if deal_id:
                cur.execute(f"DELETE FROM {schema}.deals WHERE id = {deal_id}")
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Method not allowed'})}
    finally:
        cur.close()
        conn.close()