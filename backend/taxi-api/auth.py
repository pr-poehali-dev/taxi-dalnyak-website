import base64
import hmac
import os
import secrets
import uuid

import boto3

from common import (
    S, ApiError, norm_phone, clean, sha, hash_password, check_password, create_session,
    placeholder_token, rate_limit, get_config,
)
from push import send_push, dispatcher_ids, vapid_keys


def user_by_token(cur, token, role):
    if not token or len(str(token)) > 128:
        raise ApiError(401, 'Нужно войти')
    cur.execute(
        f"""SELECT u.id, u.phone, u.name, u.role, u.is_blocked FROM {S}.app_sessions s JOIN {S}.app_users u ON u.id = s.user_id
            WHERE s.token_hash = %s AND s.expires_at > now() AND u.role = %s""",
        (sha(token), role),
    )
    u = cur.fetchone()
    if not u:
        raise ApiError(401, 'Сессия устарела, войдите снова')
    if u['is_blocked'] and role == 'client':
        raise ApiError(403, 'Доступ к сервису ограничен. Свяжитесь с поддержкой')
    return u


def logout(cur, token):
    if token:
        cur.execute(
            f"DELETE FROM {S}.app_push_subs WHERE user_id = (SELECT user_id FROM {S}.app_sessions WHERE token_hash = %s)",
            (sha(token),),
        )
        cur.execute(f"DELETE FROM {S}.app_sessions WHERE token_hash = %s", (sha(token),))
    return {'ok': True}


def public_config(cur, body):
    cfg = get_config(cur)
    return {
        'rates': cfg['rates'], 'min_price': cfg['min_price'],
        'support_telegram': cfg['support_telegram'], 'support_max': cfg['support_max'], 'sms_login': sms_enabled(),
        'vapid_public': vapid_keys(cur)['public'],
    }


def push_subscribe(cur, user, body):
    endpoint = str(body.get('endpoint') or '')
    p256dh = str(body.get('p256dh') or '')
    auth = str(body.get('auth') or '')
    if not endpoint.startswith('https://') or not p256dh or not auth or len(endpoint) > 1000:
        raise ApiError(400, 'Неверная подписка')
    cur.execute(
        f"""INSERT INTO {S}.app_push_subs (user_id, endpoint, p256dh, auth) VALUES (%s, %s, %s, %s)
            ON CONFLICT (user_id, endpoint) DO UPDATE SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth""",
        (user['id'], endpoint, p256dh, auth),
    )
    cur.execute(
        f"""DELETE FROM {S}.app_push_subs WHERE user_id = %s AND id NOT IN
            (SELECT id FROM {S}.app_push_subs WHERE user_id = %s ORDER BY id DESC LIMIT 5)""",
        (user['id'], user['id']),
    )
    return {'ok': True}


def sms_enabled():
    return bool(os.environ.get('SMSRU_API_ID'))


def _send_sms(phone, text):
    import json
    import urllib.parse
    import urllib.request
    q = urllib.parse.urlencode({'api_id': os.environ['SMSRU_API_ID'], 'to': phone.lstrip('+'), 'msg': text, 'json': 1})
    try:
        with urllib.request.urlopen('https://sms.ru/sms/send?' + q, timeout=4) as r:
            data = json.loads(r.read().decode())
    except Exception:
        raise ApiError(503, 'Не удалось отправить СМС. Попробуйте через минуту')
    if str(data.get('status')) != 'OK':
        print('sms.ru error', data.get('status_code'))
        raise ApiError(503, 'Не удалось отправить СМС. Попробуйте через минуту')


def client_send_code(cur, body):
    if not sms_enabled():
        raise ApiError(400, 'Вход по СМС пока не подключён')
    ip = body.get('_ip', '')
    phone = norm_phone(body.get('phone'))
    rate_limit(cur, f'sms:ip:{ip}', 15, 3600)
    rate_limit(cur, f'sms:phone:{phone}', 4, 1800)
    cur.execute(f"SELECT is_blocked FROM {S}.app_users WHERE phone = %s AND role = 'client'", (phone,))
    u = cur.fetchone()
    if u and u['is_blocked']:
        raise ApiError(403, 'Доступ к сервису ограничен. Свяжитесь с поддержкой')
    code = f"{secrets.randbelow(10000):04d}"
    cur.execute(
        f"""INSERT INTO {S}.app_sms_codes (phone, code_hash, expires_at, attempts) VALUES (%s, %s, now() + interval '5 minutes', 0)
            ON CONFLICT (phone) DO UPDATE SET code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at, attempts = 0, created_at = now()""",
        (phone, sha(f'{phone}:{code}')),
    )
    cur.connection.commit()
    _send_sms(phone, f'Код входа Такси Дальняк: {code}')
    return {'ok': True}


def client_login(cur, body):
    ip = body.get('_ip', '')
    phone = norm_phone(body.get('phone'))
    rate_limit(cur, f'login:ip:{ip}', 40, 600)
    rate_limit(cur, f'login:client:{phone}', 12, 600)
    name = clean(body.get('name'), 60) or None
    if sms_enabled():
        code = ''.join(c for c in str(body.get('code') or '') if c.isdigit())
        cur.execute(f"SELECT code_hash, attempts, (expires_at > now()) AS alive FROM {S}.app_sms_codes WHERE phone = %s FOR UPDATE", (phone,))
        row = cur.fetchone()
        if not row or not row['alive']:
            raise ApiError(400, 'Код устарел. Запросите новый')
        if row['attempts'] >= 5:
            raise ApiError(429, 'Слишком много неверных попыток. Запросите новый код')
        if not hmac.compare_digest(row['code_hash'], sha(f'{phone}:{code}')):
            cur.execute(f"UPDATE {S}.app_sms_codes SET attempts = attempts + 1 WHERE phone = %s", (phone,))
            cur.connection.commit()
            raise ApiError(400, 'Неверный код')
        cur.execute(f"UPDATE {S}.app_sms_codes SET expires_at = now() WHERE phone = %s", (phone,))
    cur.execute(f"SELECT id, name, is_blocked FROM {S}.app_users WHERE phone = %s AND role = 'client'", (phone,))
    u = cur.fetchone()
    if u and u['is_blocked']:
        raise ApiError(403, 'Доступ к сервису ограничен. Свяжитесь с поддержкой')
    is_new = not u
    if u:
        if name and name != u['name']:
            cur.execute(f"UPDATE {S}.app_users SET name = %s WHERE id = %s", (name, u['id']))
        uid, name = u['id'], name or u['name']
    else:
        cur.execute(
            f"INSERT INTO {S}.app_users (phone, role, name, token) VALUES (%s, 'client', %s, %s) RETURNING id",
            (phone, name, placeholder_token()),
        )
        uid = cur.fetchone()['id']
        ref = clean(body.get('ref'), 12).upper()
        if ref:
            cur.execute(f"SELECT id FROM {S}.app_users WHERE ref_code = %s AND role = 'client'", (ref,))
            fr = cur.fetchone()
            if fr and fr['id'] != uid:
                cur.execute(f"UPDATE {S}.app_users SET referred_by = %s WHERE id = %s", (fr['id'], uid))
    return {'token': create_session(cur, uid), 'name': name, 'phone': phone, 'is_new': is_new}


def driver_login(cur, body):
    ip = body.get('_ip', '')
    phone = norm_phone(body.get('phone'))
    pw = str(body.get('password') or '')
    rate_limit(cur, f'login:ip:{ip}', 40, 600)
    rate_limit(cur, f'login:driver:{phone}', 8, 600)
    cur.execute(f"SELECT id, password_hash FROM {S}.app_users WHERE phone = %s AND role = 'driver'", (phone,))
    u = cur.fetchone()
    if not u or not u['password_hash'] or not check_password(pw, u['password_hash']):
        raise ApiError(401, 'Неверный номер или пароль')
    return {'token': create_session(cur, u['id'])}


def dispatcher_login(cur, body):
    ip = body.get('_ip', '')
    rate_limit(cur, f'login:disp:{ip}', 6, 600)
    pwd = os.environ.get('DISPATCHER_PASSWORD', '')
    given = str(body.get('password') or '')
    if not pwd or not hmac.compare_digest(pwd.encode(), given.encode()):
        raise ApiError(401, 'Неверный пароль')
    cur.execute(f"SELECT id FROM {S}.app_users WHERE role = 'dispatcher' LIMIT 1")
    u = cur.fetchone()
    if u:
        uid = u['id']
    else:
        cur.execute(
            f"INSERT INTO {S}.app_users (phone, role, name, token) VALUES ('dispatcher', 'dispatcher', 'Диспетчер', %s) RETURNING id",
            (placeholder_token(),),
        )
        uid = cur.fetchone()['id']
    return {'token': create_session(cur, uid, 7)}


PHOTO_FIELDS = ['license', 'license_back', 'sts', 'sts_back', 'car_front', 'car_back', 'car_left', 'car_right']


def upload_photo(user_id, field, data_url):
    if not str(data_url).startswith('data:image/'):
        raise ApiError(400, 'Нужны фотографии')
    raw = data_url.split(',', 1)[-1]
    try:
        content = base64.b64decode(raw, validate=True)
    except Exception:
        raise ApiError(400, 'Не удалось прочитать фото')
    if len(content) > 1_500_000:
        raise ApiError(400, 'Фото слишком большое')
    if not content.startswith(b'\xff\xd8'):
        raise ApiError(400, 'Фото должно быть в формате JPEG')
    key = f"drivers/{user_id}/{field}_{uuid.uuid4().hex}.jpg"
    s3 = boto3.client(
        's3', endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=key, Body=content, ContentType='image/jpeg')
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


def driver_register(cur, body):
    ip = body.get('_ip', '')
    rate_limit(cur, f'reg:ip:{ip}', 5, 3600)
    phone = norm_phone(body.get('phone'))
    name = clean(body.get('name'), 80)
    car_model = clean(body.get('car_model'), 60)
    car_plate = clean(body.get('car_plate'), 15).upper()
    car_color = clean(body.get('car_color'), 30)
    pw = str(body.get('password') or '')
    photos = body.get('photos') or {}
    if not name or not car_model or not car_plate:
        raise ApiError(400, 'Заполните имя, марку и госномер')
    if len(pw) < 8 or len(pw) > 64:
        raise ApiError(400, 'Пароль должен быть не короче 8 символов')
    if any(not photos.get(f) for f in PHOTO_FIELDS):
        raise ApiError(400, 'Нужны все 8 фотографий: права и СТС с двух сторон и 4 фото авто')
    cur.execute(f"SELECT id FROM {S}.app_users WHERE phone = %s AND role = 'driver'", (phone,))
    if cur.fetchone():
        raise ApiError(409, 'Этот номер уже зарегистрирован. Нажмите «Войти»')
    cur.execute(
        f"INSERT INTO {S}.app_users (phone, role, name, token, password_hash) VALUES (%s, 'driver', %s, %s, %s) RETURNING id",
        (phone, name, placeholder_token(), hash_password(pw)),
    )
    uid = cur.fetchone()['id']
    urls = {f: upload_photo(uid, f, photos[f]) for f in PHOTO_FIELDS}
    cur.execute(
        f"""INSERT INTO {S}.app_drivers
            (user_id, car_model, car_plate, car_color, status, photo_license, photo_license_back, photo_sts, photo_sts_back,
             photo_car_front, photo_car_back, photo_car_left, photo_car_right)
            VALUES (%s, %s, %s, %s, 'pending', %s, %s, %s, %s, %s, %s, %s, %s)""",
        (uid, car_model, car_plate, car_color, urls['license'], urls['license_back'], urls['sts'], urls['sts_back'],
         urls['car_front'], urls['car_back'], urls['car_left'], urls['car_right']),
    )
    send_push(cur, dispatcher_ids(cur), 'Новый водитель', f'{name} · {car_model} ждёт проверки', '/app/office-k7x2', 'driver-new')
    return {'token': create_session(cur, uid)}
