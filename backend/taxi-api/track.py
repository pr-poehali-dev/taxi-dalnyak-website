from common import S, ApiError, rate_limit

LIVE = ('enroute', 'arrived', 'in_progress')


def _mask(p):
    p = p or ''
    return f"+7 *** ***-{p[-4:-2]}-{p[-2:]}" if len(p) >= 11 else ''


def track(cur, body):
    rate_limit(cur, f"track:ip:{body.get('_ip', '')}", 120, 60)
    tok = str(body.get('token') or '')
    if len(tok) < 10 or len(tok) > 64:
        raise ApiError(404, 'Ссылка недействительна')
    cur.execute(
        f"""SELECT t.status, t.from_text, t.to_text, t.from_lat, t.from_lng, t.to_lat, t.to_lng, t.eta_at, t.scheduled_at,
                   t.updated_at, COALESCE(d.name, t.ext_driver_name) AS driver_name, COALESCE(dr.car_model, t.ext_car_model) AS car_model,
                   COALESCE(dr.car_plate, t.ext_car_plate) AS car_plate, COALESCE(dr.car_color, t.ext_car_color) AS car_color,
                   dr.lat AS driver_lat, dr.lng AS driver_lng, dr.loc_at, now() AS server_now, dr.callsign, t.manual_driver,
                   CASE WHEN t.manual_driver THEN t.ext_driver_phone ELSE d.phone END AS driver_phone, c.phone AS client_phone
            FROM {S}.app_trips t
            LEFT JOIN {S}.app_users d ON d.id = t.driver_id
            LEFT JOIN {S}.app_drivers dr ON dr.user_id = t.driver_id
            JOIN {S}.app_users c ON c.id = t.client_id
            WHERE t.share_token = %s""",
        (tok,),
    )
    t = cur.fetchone()
    if not t:
        raise ApiError(404, 'Ссылка недействительна')
    if t['status'] in ('done', 'cancelled'):
        return {'status': t['status'], 'client_hint': _mask(t['client_phone'])}
    name = (t['driver_name'] or '').split(' ')[0] or None
    live = t['status'] in LIVE
    return {
        'status': t['status'], 'from_text': t['from_text'], 'to_text': t['to_text'],
        'from_lat': t['from_lat'], 'from_lng': t['from_lng'], 'to_lat': t['to_lat'], 'to_lng': t['to_lng'],
        'eta_at': t['eta_at'], 'scheduled_at': t['scheduled_at'], 'driver_name': name,
        'car_model': t['car_model'], 'car_plate': t['car_plate'], 'car_color': t['car_color'],
        'driver_lat': t['driver_lat'] if live else None, 'driver_lng': t['driver_lng'] if live else None,
        'loc_at': t['loc_at'] if live else None, 'server_now': t['server_now'],
        'callsign': t['callsign'], 'manual': bool(t['manual_driver']), 'client_hint': _mask(t['client_phone']),
        'driver_phone': t['driver_phone'] if t['status'] in ('assigned', 'enroute', 'arrived') else None,
    }
