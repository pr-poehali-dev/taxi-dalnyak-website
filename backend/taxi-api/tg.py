import os
import urllib.parse
import urllib.request
from datetime import timedelta, timezone

from common import S, TRIP_TEXT

MSK = timezone(timedelta(hours=3))


def _send(text):
    token = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')
    if not token or not chat_id:
        return
    payload = urllib.parse.urlencode({
        'chat_id': chat_id, 'text': text, 'disable_web_page_preview': 'true',
    }).encode()
    try:
        urllib.request.urlopen(urllib.request.Request(
            f'https://api.telegram.org/bot{token}/sendMessage', data=payload, method='POST'), timeout=3)
    except Exception as e:
        print(f'telegram send failed: {type(e).__name__}')


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
        f"⏰ Подача: {when}",
        f"👤 Пассажир: {u.get('name') or 'без имени'}, {u.get('phone') or 'телефон не указан'}",
        f"💬 Комментарий: {t['comment']}" if t.get('comment') else None,
        '',
        'Открыть в кабинете: https://taxidalnyack.ru/app/office-k7x2',
    ]
    _send('\n'.join(x for x in lines if x is not None))
