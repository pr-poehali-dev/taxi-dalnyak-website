import json
import os
import random
import string
import psycopg2
import urllib.request
import urllib.parse


def handler(event: dict, context) -> dict:
    '''Создаёт новую заявку на такси: сохраняет в БД и отправляет уведомление в Telegram.
    Args: event с httpMethod, body (JSON: phone, route_from, route_to, distance_km, car_class, price_min, price_max, utm_*)
    Returns: JSON с tracking_code для отслеживания статуса заказа
    '''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if method != 'POST':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}

    body = json.loads(event.get('body') or '{}')
    phone = (body.get('phone') or '').strip()
    if not phone:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'phone is required'})}

    route_from = (body.get('route_from') or '').strip() or None
    route_to = (body.get('route_to') or '').strip() or None
    distance_km = body.get('distance_km')
    car_class = (body.get('car_class') or '').strip() or None
    price_min = body.get('price_min')
    price_max = body.get('price_max')
    utm_source = (body.get('utm_source') or '').strip() or None
    utm_medium = (body.get('utm_medium') or '').strip() or None
    utm_campaign = (body.get('utm_campaign') or '').strip() or None
    utm_term = (body.get('utm_term') or '').strip() or None

    alphabet = string.ascii_uppercase.replace('O', '').replace('I', '') + '23456789'
    tracking_code = ''.join(random.choices(alphabet, k=6))

    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO orders (
                tracking_code, phone, route_from, route_to, distance_km, car_class,
                price_min, price_max, status, utm_source, utm_medium, utm_campaign, utm_term
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'searching', %s, %s, %s, %s)
            RETURNING id
            """,
            (tracking_code, phone, route_from, route_to, distance_km, car_class,
             price_min, price_max, utm_source, utm_medium, utm_campaign, utm_term)
        )
        order_id = cur.fetchone()[0]
        conn.commit()
    finally:
        conn.close()

    telegram_message_id = send_telegram_notification(
        tracking_code, phone, route_from, route_to, distance_km, car_class, price_min, price_max
    )

    if telegram_message_id:
        conn = psycopg2.connect(dsn)
        try:
            cur = conn.cursor()
            cur.execute(
                "UPDATE orders SET sent_to_telegram = true, telegram_message_id = %s WHERE id = %s",
                (telegram_message_id, order_id)
            )
            conn.commit()
        finally:
            conn.close()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'tracking_code': tracking_code, 'status': 'searching'}),
    }


def send_telegram_notification(tracking_code, phone, route_from, route_to, distance_km, car_class, price_min, price_max):
    token = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')
    if not token or not chat_id:
        return None

    route_line = ''
    if route_from and route_to:
        route_line = f"📍 {route_from} → {route_to}\n"
    elif route_to:
        route_line = f"📍 до {route_to}\n"

    price_line = ''
    if price_min:
        price_line = f"💰 от {int(float(price_min)):,} ₽".replace(',', ' ') + '\n'

    km_line = f"🛣 ≈ {int(float(distance_km))} км\n" if distance_km else ''
    class_line = f"🚗 Класс: {car_class}\n" if car_class else ''

    text = (
        f"🆕 Новый заказ #{tracking_code}\n"
        f"{route_line}"
        f"{km_line}"
        f"{class_line}"
        f"{price_line}"
        f"📞 {phone}\n\n"
        f"Чтобы назначить машину — ответьте на это сообщение в формате:\n"
        f"Марка Модель, Гос.номер, Водитель, Телефон, Подача в мин.\n"
        f"Например: Toyota Camry, А123ВС77, Иван, +79991234567, 20"
    )

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = urllib.parse.urlencode({
        'chat_id': chat_id,
        'text': text,
    }).encode()

    try:
        req = urllib.request.Request(url, data=payload, method='POST')
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode())
            if result.get('ok'):
                return result['result']['message_id']
    except Exception:
        return None
    return None
