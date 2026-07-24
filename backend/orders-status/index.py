import json
import os
import psycopg2
import psycopg2.extras


def handler(event: dict, context) -> dict:
    '''Возвращает текущий статус заказа по коду отслеживания для страницы пассажира.
    Args: event с httpMethod GET, queryStringParameters: code (tracking_code)
    Returns: JSON с данными заказа: статус, машина, водитель, номер, время подачи
    '''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if method != 'GET':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}

    params = event.get('queryStringParameters') or {}
    code = (params.get('code') or '').strip().upper()
    if not code:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'code is required'})}

    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            """
            SELECT tracking_code, status, route_from, route_to, distance_km, car_class,
                   price_min, price_max, driver_name, car_model, car_plate, driver_phone,
                   eta_minutes, comment, created_at, updated_at
            FROM orders WHERE tracking_code = %s
            """,
            (code,)
        )
        row = cur.fetchone()
    finally:
        conn.close()

    if not row:
        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'not found'})}

    result = dict(row)
    for key in ('distance_km', 'price_min', 'price_max'):
        if result.get(key) is not None:
            result[key] = float(result[key])
    for key in ('created_at', 'updated_at'):
        if result.get(key) is not None:
            result[key] = result[key].isoformat()

    return {'statusCode': 200, 'headers': headers, 'body': json.dumps(result)}
