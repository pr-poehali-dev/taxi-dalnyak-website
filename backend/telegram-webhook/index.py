import json
import os
import re
import psycopg2
import urllib.request
import urllib.parse


def handler(event: dict, context) -> dict:
    '''Принимает ответы диспетчера в Telegram на сообщения о заказах и обновляет статус заказа.
    Формат ответа (reply на сообщение о заказе): "Марка Модель, Гос.номер, Водитель, Телефон, Подача в мин"
    Args: event с httpMethod POST, body — Telegram Update JSON
    Returns: JSON статус обработки
    '''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if method != 'POST':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}

    update = json.loads(event.get('body') or '{}')
    message = update.get('message') or {}
    reply_to = message.get('reply_to_message')
    text = message.get('text') or ''

    if not reply_to or not text:
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True, 'skipped': True})}

    replied_message_id = reply_to.get('message_id')
    replied_text = reply_to.get('text') or ''

    match = re.search(r'#([A-Z0-9]{6})', replied_text)
    if not match:
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True, 'skipped': True})}

    tracking_code = match.group(1)

    parts = [p.strip() for p in text.split(',')]
    car_model = parts[0] if len(parts) > 0 else None
    car_plate = parts[1] if len(parts) > 1 else None
    driver_name = parts[2] if len(parts) > 2 else None
    driver_phone = parts[3] if len(parts) > 3 else None
    eta_minutes = None
    if len(parts) > 4:
        digits = re.sub(r'\D', '', parts[4])
        if digits:
            eta_minutes = int(digits)

    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    try:
        cur = conn.cursor()
        cur.execute(
            """
            UPDATE orders SET
                status = 'assigned',
                car_model = COALESCE(%s, car_model),
                car_plate = COALESCE(%s, car_plate),
                driver_name = COALESCE(%s, driver_name),
                driver_phone = COALESCE(%s, driver_phone),
                eta_minutes = COALESCE(%s, eta_minutes),
                updated_at = now()
            WHERE tracking_code = %s
            RETURNING id
            """,
            (car_model, car_plate, driver_name, driver_phone, eta_minutes, tracking_code)
        )
        row = cur.fetchone()
        conn.commit()
    finally:
        conn.close()

    if row:
        send_confirmation(message.get('chat', {}).get('id'), tracking_code, car_model, car_plate, driver_name, eta_minutes)

    return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True, 'updated': bool(row)})}


def send_confirmation(chat_id, tracking_code, car_model, car_plate, driver_name, eta_minutes):
    token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if not token or not chat_id:
        return

    text = f"✅ Заказ #{tracking_code} обновлён: машина назначена. Пассажир увидит это на сайте."
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = urllib.parse.urlencode({'chat_id': chat_id, 'text': text}).encode()
    try:
        req = urllib.request.Request(url, data=payload, method='POST')
        urllib.request.urlopen(req, timeout=10)
    except Exception:
        pass
