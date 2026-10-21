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


def _send(text):
    _QUEUE.append(text)


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
            data = r.read()[:300]
            c.close()
            if r.status == 200:
                return
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
        'Открыть в кабинете: https://taxidalnyack.ru/app/office-k7x2',
    ]
    _send('\n'.join(x for x in lines if x is not None))
