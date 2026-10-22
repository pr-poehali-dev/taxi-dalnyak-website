from common import S, ApiError, clean, sha

STEPS = ('open', 'order_click', 'login_prompt', 'login', 'route', 'quote', 'order', 'install_offer', 'install')
STEP_NAMES = {
    'open': 'Открыли приложение', 'login_prompt': 'Нажали «Заказать», увидели вход', 'login': 'Вошли по телефону', 'route': 'Ввели маршрут',
    'quote': 'Увидели цену', 'order': 'Оформили заказ',
}


def track(cur, body, token=None):
    step = body.get('step')
    if step not in STEPS:
        raise ApiError(400, 'bad step')
    visitor = clean(body.get('visitor'), 40)
    if not visitor:
        raise ApiError(400, 'no visitor')
    cur.execute(f"SELECT 1 FROM {S}.app_funnel WHERE visitor = %s AND step = %s AND created_at > now() - interval '30 minutes' AND step IN ('open', 'login', 'login_prompt', 'install_offer', 'order_click') LIMIT 1", (visitor, step))
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


FLOW = ('open', 'route', 'quote', 'order_click', 'login', 'order')
FLOW_NAMES = {
    'open': 'Открыли приложение', 'route': 'Указали, куда ехать', 'quote': 'Увидели цену',
    'order_click': 'Нажали «Заказать»', 'login': 'Вошли по телефону', 'order': 'Оформили заказ',
}


SRC = "CASE WHEN s.utm_source IN ('yandex', 'ya', 'direct', 'yandex_direct') THEN 'Яндекс' WHEN s.utm_source ILIKE 'sber%' THEN 'Сбер' ELSE s.utm_source END"


def _period(body):
    import re
    from datetime import date, timedelta
    d1, d2 = str(body.get('date_from') or ''), str(body.get('date_to') or '')
    if re.fullmatch(r'\d{4}-\d{2}-\d{2}', d1) and re.fullmatch(r'\d{4}-\d{2}-\d{2}', d2):
        a, b = date.fromisoformat(d1), date.fromisoformat(d2)
        if a > b:
            a, b = b, a
        if (b - a).days > 365:
            a = b - timedelta(days=365)
        return f"'{a.isoformat()}'::date", f"'{b.isoformat()}'::date"
    try:
        days = max(1, min(int(body.get('days') or 1), 90))
    except (TypeError, ValueError):
        days = 1
    today = "(now() AT TIME ZONE 'Europe/Moscow')::date"
    return f"({today} - {days - 1})", today


def report(cur, user, body):
    only_ad = bool(body.get('only_ad'))
    d1, d2 = _period(body)
    base = f"(f.created_at AT TIME ZONE 'Europe/Moscow')::date BETWEEN {d1} AND {d2}"
    ad = " AND bool_or(f.step = 'open' AND f.from_ad)" if only_ad else ''
    per_visitor = f"""
        SELECT f.visitor,
               bool_or(f.step = 'route') AS r, bool_or(f.step = 'quote') AS q,
               bool_or(f.step IN ('order_click', 'order')) AS c, bool_or(f.step = 'login') AS l,
               bool_or(f.step = 'order') AS d, bool_or(f.installed) AS inst
        FROM {S}.app_funnel f WHERE {base}
        GROUP BY f.visitor HAVING bool_or(f.step = 'open'){ad}"""
    cur.execute(
        f"""WITH v AS ({per_visitor})
            SELECT count(*) AS open, count(*) FILTER (WHERE r) AS route, count(*) FILTER (WHERE r AND q) AS quote,
                   count(*) FILTER (WHERE r AND q AND c) AS order_click, count(*) FILTER (WHERE r AND q AND c AND l) AS login,
                   count(*) FILTER (WHERE r AND q AND c AND l AND d) AS "order",
                   count(*) FILTER (WHERE inst) AS i_open, count(*) FILTER (WHERE inst AND r) AS i_route,
                   count(*) FILTER (WHERE inst AND r AND q) AS i_quote, count(*) FILTER (WHERE inst AND r AND q AND c) AS i_order_click,
                   count(*) FILTER (WHERE inst AND r AND q AND c AND l) AS i_login,
                   count(*) FILTER (WHERE inst AND r AND q AND c AND l AND d) AS i_order
            FROM v"""
    )
    row = cur.fetchone()
    steps = {k: {'n': row[k] or 0, 'installed': row['i_' + k] or 0} for k in FLOW}
    vis = f"SELECT visitor FROM ({per_visitor}) vv"
    src = f"""(SELECT {SRC} FROM {S}.app_funnel s WHERE s.visitor = %VIS% AND s.step = 'open' AND s.utm_source <> '' ORDER BY s.created_at DESC LIMIT 1)"""
    cur.execute(
        f"""WITH v AS (SELECT f.visitor, coalesce({src.replace('%VIS%', 'f.visitor')}, 'без метки') AS source,
                           bool_or(f.step = 'quote') AS q, bool_or(f.step IN ('order_click', 'order')) AS c, bool_or(f.step = 'order') AS d
                    FROM {S}.app_funnel f WHERE {base} AND f.visitor IN ({vis}) GROUP BY f.visitor)
            SELECT source, count(*) AS n, count(*) FILTER (WHERE q) AS quote, count(*) FILTER (WHERE c) AS click, count(*) FILTER (WHERE d) AS "order"
            FROM v GROUP BY source ORDER BY n DESC LIMIT 10"""
    )
    sources = cur.fetchall()
    cur.execute(
        f"""SELECT q.visitor, max(q.created_at) AS at, (array_agg(q.details ORDER BY q.created_at DESC))[1] AS details,
                   bool_or(q.installed) AS installed, {src.replace('%VIS%', 'q.visitor')} AS source,
                   (SELECT s.utm_campaign FROM {S}.app_funnel s WHERE s.visitor = q.visitor AND s.utm_campaign <> '' ORDER BY s.created_at DESC LIMIT 1) AS campaign, max(q.user_id) AS user_id, max(u.name) AS name, max(u.phone) AS phone,
                   EXISTS (SELECT 1 FROM {S}.app_funnel c WHERE c.visitor = q.visitor AND c.step = 'order_click' AND c.created_at >= min(q.created_at)) AS clicked
            FROM {S}.app_funnel q LEFT JOIN {S}.app_users u ON u.id = q.user_id
            WHERE {base.replace('f.', 'q.')} AND q.step = 'quote' AND q.visitor IN ({vis})
              AND NOT EXISTS (SELECT 1 FROM {S}.app_funnel o WHERE o.visitor = q.visitor AND o.step = 'order' AND o.created_at >= q.created_at)
            GROUP BY q.visitor ORDER BY at DESC LIMIT 40"""
    )
    lost = cur.fetchall()
    cur.execute(f"SELECT to_char({d1}, 'YYYY-MM-DD') AS a, to_char({d2}, 'YYYY-MM-DD') AS b")
    p = cur.fetchone()
    return {'date_from': p['a'], 'date_to': p['b'], 'flow': list(FLOW), 'steps': steps, 'names': FLOW_NAMES, 'sources': sources, 'lost': lost}
