import re

from common import S, ApiError, clean, rate_limit
from push import send_push, dispatcher_ids
import tg

PHONE_RE = re.compile(r'(?:\+?\d[\s\-()]*){7,}')


def mask(text):
    return PHONE_RE.sub('[номер скрыт]', text)


def _trip(cur, trip_id):
    cur.execute(
        f"SELECT id, client_id, driver_id, status, manual_driver FROM {S}.app_trips WHERE id = %s",
        (trip_id,),
    )
    t = cur.fetchone()
    if not t:
        raise ApiError(404, 'Заказ не найден')
    return t


def _check(role, user, t):
    if role == 'client' and t['client_id'] != user['id']:
        raise ApiError(403, 'Нет доступа')
    if role == 'driver' and t['driver_id'] != user['id']:
        raise ApiError(403, 'Нет доступа')


def get_messages(cur, role, user, body):
    t = _trip(cur, body.get('trip_id'))
    _check(role, user, t)
    after = int(body.get('after') or 0)
    cur.execute(
        f"""SELECT m.id, m.sender_role, m.text, m.created_at FROM {S}.app_messages m
            WHERE m.trip_id = %s AND m.id > %s ORDER BY m.id LIMIT 200""",
        (t['id'], after),
    )
    rows = cur.fetchall()
    if role != 'dispatcher':
        for r in rows:
            r['text'] = mask(r['text'])
    return {'messages': rows}


def send_message(cur, role, user, body):
    t = _trip(cur, body.get('trip_id'))
    _check(role, user, t)
    text = clean(body.get('text'), 500)
    if not text:
        raise ApiError(400, 'Введите сообщение')
    if role != 'dispatcher':
        if (not t['driver_id'] and not t['manual_driver']) or t['status'] not in ('assigned', 'enroute', 'arrived', 'in_progress'):
            raise ApiError(400, 'Чат доступен, когда назначен водитель')
        rate_limit(cur, f'chat:{user["id"]}', 30, 60)
    cur.execute(
        f"INSERT INTO {S}.app_messages (trip_id, sender_role, sender_id, text) VALUES (%s, %s, %s, %s) RETURNING id, sender_role, text, created_at",
        (t['id'], role, user['id'], text),
    )
    created = cur.fetchone()
    shown = mask(text) if role != 'dispatcher' else text
    if role == 'client':
        send_push(cur, [t['driver_id']], 'Вам написал пассажир', shown, '/app/driver', f'chat-{t["id"]}')
    elif role == 'driver':
        send_push(cur, [t['client_id']], 'Вам написал водитель', shown, '/app/client', f'chat-{t["id"]}')
    else:
        send_push(cur, [t['client_id']], 'Сообщение от диспетчера', shown, '/app/client', f'chat-{t["id"]}')
        send_push(cur, [t['driver_id']], 'Сообщение от диспетчера', shown, '/app/driver', f'chat-{t["id"]}')
    if role != 'dispatcher':
        send_push(cur, dispatcher_ids(cur), f'Новое сообщение в чате заказа №{t["id"]}', text, '/app/office-k7x2', f'dchat-{t["id"]}')
        who = 'Пассажир' if role == 'client' else 'Водитель'
        tg.disp(f"💬 {who} · заказ №{t['id']}\n\n{text}\n\n↩️ Ответьте на это сообщение — ответ уйдёт в чат заказа", t['id'])
    return {'ok': True, 'message': created}
