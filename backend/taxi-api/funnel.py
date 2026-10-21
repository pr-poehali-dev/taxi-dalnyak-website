from common import S, ApiError, clean, sha

STEPS = ('open', 'login', 'route', 'quote', 'order', 'install_offer', 'install')
STEP_NAMES = {
    'open': 'Открыли приложение', 'login': 'Вошли по телефону', 'route': 'Ввели маршрут',
    'quote': 'Увидели цену', 'order': 'Оформили заказ',
}


def track(cur, body, token=None):
    step = body.get('step')
    if step not in STEPS:
        raise ApiError(400, 'bad step')
    visitor = clean(body.get('visitor'), 40)
    if not visitor:
        raise ApiError(400, 'no visitor')
    cur.execute(f"SELECT 1 FROM {S}.app_funnel WHERE visitor = %s AND step = %s AND created_at > now() - interval '30 minutes' AND step IN ('open', 'login', 'install_offer') LIMIT 1", (visitor, step))
    if cur.fetchone():
        return {'ok': True}
    uid = None
    if token and len(str(token)) <= 128:
        cur.execute(f"SELECT s.user_id FROM {S}.app_sessions s JOIN {S}.app_users u ON u.id = s.user_id WHERE s.token_hash = %s AND s.expires_at > now() AND u.role = 'client'", (sha(token),))
        row = cur.fetchone()
        uid = row['user_id'] if row else None
    cur.execute(
        f"""INSERT INTO {S}.app_funnel (visitor, step, installed, from_ad, utm_source, utm_campaign, user_id, details)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
        (visitor, step, bool(body.get('installed')), bool(body.get('from_ad')), clean(body.get('utm_source'), 60) or None,
         clean(body.get('utm_campaign'), 120) or None, uid, clean(body.get('details'), 300) or None),
    )
    return {'ok': True}


def report(cur, user, body):
    try:
        days = max(1, min(int(body.get('days') or 1), 90))
    except (TypeError, ValueError):
        days = 1
    only_ad = bool(body.get('only_ad'))
    since = f"((now() AT TIME ZONE 'Europe/Moscow')::date - {days - 1})"
    base = f"(f.created_at AT TIME ZONE 'Europe/Moscow')::date >= {since}"
    vis = f"SELECT DISTINCT visitor FROM {S}.app_funnel f WHERE {base} AND f.step = 'open'" + (" AND f.from_ad" if only_ad else '')
    cur.execute(
        f"""SELECT f.step, count(DISTINCT f.visitor) AS n,
                   count(DISTINCT f.visitor) FILTER (WHERE f.installed) AS installed
            FROM {S}.app_funnel f WHERE {base} AND f.visitor IN ({vis}) GROUP BY f.step"""
    )
    steps = {r['step']: {'n': r['n'], 'installed': r['installed']} for r in cur.fetchall()}
    cur.execute(
        f"""SELECT coalesce(nullif(f.utm_source, ''), 'без метки') AS source, count(DISTINCT f.visitor) AS n
            FROM {S}.app_funnel f WHERE {base} AND f.step = 'open' AND f.visitor IN ({vis}) GROUP BY 1 ORDER BY 2 DESC LIMIT 10"""
    )
    sources = cur.fetchall()
    cur.execute(
        f"""SELECT q.visitor, max(q.created_at) AS at, (array_agg(q.details ORDER BY q.created_at DESC))[1] AS details,
                   bool_or(q.installed) AS installed, max(q.user_id) AS user_id, max(u.name) AS name, max(u.phone) AS phone
            FROM {S}.app_funnel q LEFT JOIN {S}.app_users u ON u.id = q.user_id
            WHERE {base.replace('f.', 'q.')} AND q.step = 'quote' AND q.visitor IN ({vis})
              AND NOT EXISTS (SELECT 1 FROM {S}.app_funnel o WHERE o.visitor = q.visitor AND o.step = 'order' AND o.created_at >= q.created_at)
            GROUP BY q.visitor ORDER BY at DESC LIMIT 40"""
    )
    lost = cur.fetchall()
    return {'days': days, 'steps': steps, 'names': STEP_NAMES, 'sources': sources, 'lost': lost}
