import http.client
import os
import socket
import ssl
import time
import urllib.parse
from datetime import timedelta, timezone

from common import S, TRIP_TEXT

MSK = timezone(timedelta(hours=3))


_QUEUE = []


def _send(text, trip_id=None):
    _QUEUE.append((text, trip_id))


_DIRECT = []


def disp(text, trip_id=None):
    """Короткое уведомление диспетчеру в Telegram (без дубля на почту)"""
    _DIRECT.append((None, text, trip_id))


def to_chat(chat_id, text):
    if chat_id:
        _DIRECT.append((int(chat_id), text, None))


def take_direct():
    items = list(_DIRECT)
    _DIRECT.clear()
    return items


def deliver_direct(chat_id, text, timeout=2.5, trip_id=None):
    cid = chat_id or (os.environ.get('TELEGRAM_CHAT_ID') or '').strip()
    if not cid:
        return None
    r = api('sendMessage', {'chat_id': cid, 'text': text, 'disable_web_page_preview': True}, timeout)
    return (r or {}).get('message_id') if trip_id and not chat_id else None


MAIL_TO = 'Guzaerov.alex@yandex.ru'


def _deliver_mail(text, timeout):
    import smtplib
    from email.header import Header
    from email.mime.text import MIMEText
    password = (os.environ.get('SMTP_PASSWORD') or '').strip()
    if not password:
        print('mail skipped: no SMTP_PASSWORD')
        return
    sender = (os.environ.get('SMTP_LOGIN') or MAIL_TO).strip()
    first = text.split('\n', 1)[0].lstrip('🚕🗓 ')
    msg = MIMEText(text, 'plain', 'utf-8')
    msg['Subject'] = Header(f'Такси Дальняк: {first}', 'utf-8')
    msg['From'] = sender
    msg['To'] = MAIL_TO
    try:
        with smtplib.SMTP_SSL('smtp.yandex.ru', 465, timeout=timeout) as smtp:
            smtp.login(sender, password)
            smtp.sendmail(sender, [MAIL_TO], msg.as_string())
    except Exception as e:
        print(f'mail failed: {type(e).__name__}: {e}')


TG_HOST = 'api.telegram.org'
TG_IPS = ('149.154.167.220', '149.154.167.99', '149.154.166.110')


class _HTTPSAt(http.client.HTTPSConnection):
    def __init__(self, ip, timeout):
        super().__init__(TG_HOST, 443, timeout=timeout, context=ssl.create_default_context())
        self._ip = ip

    def connect(self):
        sock = socket.create_connection((self._ip, 443), self.timeout)
        self.sock = self._context.wrap_socket(sock, server_hostname=TG_HOST)


def _deliver(text, timeout):
    token = (os.environ.get('TELEGRAM_BOT_TOKEN') or '').strip()
    chat_id = (os.environ.get('TELEGRAM_CHAT_ID') or '').strip()
    if not token or not chat_id:
        print('telegram skipped: no token or chat id')
        return
    import json
    payload = urllib.parse.urlencode({'chat_id': chat_id, 'text': text, 'disable_web_page_preview': 'true'})
    deadline = time.time() + timeout
    for ip in TG_IPS:
        left = deadline - time.time()
        if left < 0.5:
            break
        try:
            c = _HTTPSAt(ip, min(2.5, left))
            c.request('POST', f'/bot{token}/sendMessage', body=payload,
                      headers={'Content-Type': 'application/x-www-form-urlencoded', 'Host': TG_HOST})
            r = c.getresponse()
            raw = r.read()
            data = raw[:300]
            c.close()
            if r.status == 200:
                try:
                    return json.loads(raw)['result']['message_id']
                except Exception:
                    return None
            print(f'telegram http {r.status}: {data!r}')
            return
        except Exception as e:
            print(f'telegram {ip} failed: {type(e).__name__}: {e}')


def take():
    items = list(_QUEUE)
    _QUEUE.clear()
    return items


def notify_new_trip(cur, t):
    cur.execute(f"SELECT name, phone FROM {S}.app_users WHERE id = %s", (t['client_id'],))
    u = cur.fetchone() or {}
    when = t['scheduled_at'].astimezone(MSK).strftime('%d.%m в %H:%M (МСК)') if t['scheduled_at'] else 'Сейчас'
    head = f"🗓 НОВЫЙ ПРЕДЗАКАЗ №{t['id']}" if t['scheduled_at'] else f"🚕 НОВЫЙ ЗАКАЗ №{t['id']}"
    lines = [
        head,
        '',
        f"📍 Откуда: {t['from_text']}",
        f"🏁 Куда: {t['to_text']}",
        f"📏 {t['distance_km']} км" if t.get('distance_km') else None,
        f"💰 Цена: {int(t['price'])} ₽ · {'переводом' if t.get('pay_method') == 'transfer' else 'наличными'}",
        f"🚘 Тариф: {TRIP_TEXT.get(t['tariff'], t['tariff'])}",
        f"📱 Откуда заказ: {'установленное приложение' if t.get('from_installed', True) else 'браузер, без установки'}",
        f"⏰ Подача: {when}",
        f"👤 Пассажир: {u.get('name') or 'без имени'}, {u.get('phone') or 'телефон не указан'}",
        f"💬 Комментарий: {t['comment']}" if t.get('comment') else None,
        '',
        '↩️ Ответьте на это сообщение — текст уйдёт пассажиру в чат заказа',
        'Открыть в кабинете: https://taxidalnyack.ru/app/office-k7x2',
    ]
    _send('\n'.join(x for x in lines if x is not None), t['id'])


def api(method, params, timeout=3.0):
    """Вызов Telegram Bot API, возвращает result или None"""
    import json
    token = (os.environ.get('TELEGRAM_BOT_TOKEN') or '').strip()
    if not token:
        return None
    payload = json.dumps(params, ensure_ascii=False).encode()
    deadline = time.time() + timeout
    for ip in TG_IPS:
        left = deadline - time.time()
        if left < 0.5:
            break
        try:
            c = _HTTPSAt(ip, min(2.5, left))
            c.request('POST', f'/bot{token}/{method}', body=payload, headers={'Content-Type': 'application/json', 'Host': TG_HOST})
            r = c.getresponse()
            data = json.loads(r.read() or b'{}')
            c.close()
            return data.get('result') if data.get('ok') else {'_error': data.get('description')}
        except Exception as e:
            print(f'telegram api {ip} failed: {type(e).__name__}')
    return None


BOT_NAME = 'zakaztaxi1991bot'

STATUS_TEXT = {
    'new': '🔎 Ищем водителя',
    'assigned': '✅ Водитель назначен',
    'enroute': '🚗 Водитель выехал к вам',
    'arrived': '📍 Машина на месте, водитель ждёт вас',
    'in_progress': '🛣 Поездка началась. Счастливого пути!',
    'done': '🏁 Поездка завершена. Спасибо, что выбрали Дальняк!',
    'cancelled': '❌ Заказ отменён',
}


def trip_card(cur, trip_id, head=None):
    cur.execute(
        f"""SELECT t.id, t.status, t.from_text, t.to_text, t.price, t.share_token, t.eta_at,
                   COALESCE(d.name, t.ext_driver_name) AS driver_name, COALESCE(dr.car_model, t.ext_car_model) AS car_model,
                   COALESCE(dr.car_plate, t.ext_car_plate) AS car_plate, COALESCE(dr.car_color, t.ext_car_color) AS car_color
            FROM {S}.app_trips t LEFT JOIN {S}.app_users d ON d.id = t.driver_id LEFT JOIN {S}.app_drivers dr ON dr.user_id = t.driver_id
            WHERE t.id = %s""",
        (trip_id,),
    )
    t = cur.fetchone()
    if not t:
        return None, None
    lines = [head or STATUS_TEXT.get(t['status'], t['status']), '', f"Заказ №{t['id']}: {t['from_text']} → {t['to_text']}"]
    if t['car_model'] and t['status'] in ('assigned', 'enroute', 'arrived', 'in_progress'):
        car = ' '.join(x for x in [t['car_color'], t['car_model']] if x)
        lines.append(f"🚘 {car}, {t['car_plate'] or ''}".rstrip(', '))
        if t['driver_name']:
            lines.append(f"👤 Водитель: {t['driver_name']}")
        if t['eta_at'] and t['status'] == 'assigned':
            lines.append(f"⏱ Подача: {t['eta_at'].astimezone(MSK).strftime('%H:%M')} (МСК)")
    if t['share_token'] and t['status'] not in ('done', 'cancelled'):
        lines += ['', f"Машина на карте: https://taxidalnyack.ru/track/{t['share_token']}"]
    return t, '\n'.join(lines)


def notify_client(cur, trip_id, head=None):
    cur.execute(f"SELECT tg_chat_id FROM {S}.app_trips WHERE id = %s", (trip_id,))
    r = cur.fetchone()
    if not r or not r['tg_chat_id']:
        return
    _, text = trip_card(cur, trip_id, head)
    if text:
        to_chat(r['tg_chat_id'], text)
