import hashlib
import os
import re

from common import S, clean
import tg

LINK_RE = re.compile(r'^/start\s+t(\d+)_([A-Za-z0-9]{8})$')


def link_code(trip_id, share_token):
    return 't%d_%s' % (trip_id, hashlib.sha256(f'{trip_id}:{share_token}'.encode()).hexdigest()[:8])


def _dispatcher_user(cur):
    cur.execute(f"SELECT id FROM {S}.app_users WHERE role = 'dispatcher' ORDER BY id LIMIT 1")
    r = cur.fetchone()
    return r['id'] if r else None


def handle(cur, update):
    import chat
    msg = update.get('message') or {}
    text = (msg.get('text') or '').strip()
    chat_id = (msg.get('chat') or {}).get('id')
    if not chat_id or not text:
        return {'ok': True}
    disp_chat = (os.environ.get('TELEGRAM_CHAT_ID') or '').strip()

    if str(chat_id) == disp_chat:
        reply = msg.get('reply_to_message') or {}
        if not reply:
            return {'ok': True}
        cur.execute(f"SELECT trip_id FROM {S}.app_tg_links WHERE tg_message_id = %s", (reply.get('message_id'),))
        r = cur.fetchone()
        if not r:
            m = re.search(r'№(\d+)', reply.get('text') or '')
            if not m:
                return {'ok': True}
            r = {'trip_id': int(m.group(1))}
        uid = _dispatcher_user(cur)
        if not uid:
            tg.to_chat(chat_id, 'Не найден аккаунт диспетчера')
            return {'ok': True}
        chat.send_message(cur, 'dispatcher', {'id': uid}, {'trip_id': r['trip_id'], 'text': clean(text, 500)})
        tg.to_chat(chat_id, f"✓ Отправлено в чат заказа №{r['trip_id']}")
        return {'ok': True}

    m = LINK_RE.match(text)
    if m:
        trip_id = int(m.group(1))
        cur.execute(f"SELECT id, share_token, client_id FROM {S}.app_trips WHERE id = %s", (trip_id,))
        t = cur.fetchone()
        if not t or not t['share_token'] or link_code(t['id'], t['share_token']) != f"t{m.group(1)}_{m.group(2)}":
            tg.to_chat(chat_id, 'Ссылка устарела. Откройте заказ в приложении и нажмите кнопку ещё раз.')
            return {'ok': True}
        cur.execute(f"UPDATE {S}.app_trips SET tg_chat_id = %s WHERE id = %s", (chat_id, t['id']))
        cur.execute(f"UPDATE {S}.app_users SET tg_chat_id = %s WHERE id = %s", (chat_id, t['client_id']))
        _, card = tg.trip_card(cur, t['id'])
        tg.to_chat(chat_id, '🔔 Готово! Сюда будут приходить статусы поездки: водитель назначен, выехал, на месте.\n\nМожно писать прямо сюда — сообщение уйдёт в чат заказа.\n\n' + (card or ''))
        return {'ok': True}

    if text.startswith('/start'):
        tg.to_chat(chat_id, 'Здравствуйте! Это бот такси «Дальняк».\nЗаказать поездку в любой город: https://taxidalnyack.ru')
        return {'ok': True}

    cur.execute(
        f"""SELECT id, client_id FROM {S}.app_trips WHERE tg_chat_id = %s AND status IN ('new', 'assigned', 'enroute', 'arrived', 'in_progress')
            ORDER BY id DESC LIMIT 1""",
        (chat_id,),
    )
    t = cur.fetchone()
    if not t:
        tg.to_chat(chat_id, 'Активного заказа нет. Заказать поездку: https://taxidalnyack.ru')
        return {'ok': True}
    cur.execute(
        f"INSERT INTO {S}.app_messages (trip_id, sender_role, sender_id, text) VALUES (%s, 'client', %s, %s)",
        (t['id'], t['client_id'], clean(text, 500)),
    )
    tg.disp(f"💬 Пассажир (из Telegram) · заказ №{t['id']}\n\n{clean(text, 500)}\n\n↩️ Ответьте на это сообщение", t['id'])
    tg.to_chat(chat_id, '✓ Передали в чат заказа')
    return {'ok': True}


def setup(cur, body):
    url = 'https://functions.poehali.dev/d0f607e3-1019-45b6-af55-fe5da3683ac2?tg=' + hashlib.sha256(((os.environ.get('TELEGRAM_BOT_TOKEN') or '') + 'hook').encode()).hexdigest()[:24]
    return {'hook': tg.api('setWebhook', {'url': url, 'allowed_updates': ['message']}), 'info': tg.api('getWebhookInfo', {})}


def secret_ok(qs):
    want = hashlib.sha256(((os.environ.get('TELEGRAM_BOT_TOKEN') or '') + 'hook').encode()).hexdigest()[:24]
    return (qs or {}).get('tg') == want
