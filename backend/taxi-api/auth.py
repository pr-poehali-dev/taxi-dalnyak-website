import base64
import hmac
import os
import secrets

import docs
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


SMS_SENDER_READY = False


def sms_enabled():
    return SMS_SENDER_READY and bool(os.environ.get('SMSRU_API_ID'))


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
    info = (data.get('sms') or {}).get(phone.lstrip('+')) or {}
    print('sms.ru send', data.get('status'), data.get('status_code'), 'balance', data.get('balance'), 'sms', json.dumps(info, ensure_ascii=False))
    if str(data.get('status')) != 'OK' or str(info.get('status', 'OK')) != 'OK':
        code = str(info.get('status_code') or data.get('status_code'))
        if code in ('221', '220'):
            raise ApiError(503, 'Вход по СМС временно недоступен. Позвоните диспетчеру или попробуйте позже')
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
    issue_code(cur, phone, 'Код входа Такси Дальняк')
    return {'ok': True}


def issue_code(cur, phone, title, slot=''):
    key = slot + phone
    code = f"{secrets.randbelow(10000):04d}"
    cur.execute(
        f"""INSERT INTO {S}.app_sms_codes (phone, code_hash, expires_at, attempts) VALUES (%s, %s, now() + interval '5 minutes', 0)
            ON CONFLICT (phone) DO UPDATE SET code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at, attempts = 0, created_at = now()""",
        (key, sha(f'{key}:{code}')),
    )
    cur.connection.commit()
    _send_sms(phone, f'{title}: {code}')


def check_code(cur, phone, raw, slot=''):
    key = slot + phone
    code = ''.join(c for c in str(raw or '') if c.isdigit())
    cur.execute(f"SELECT code_hash, attempts, (expires_at > now()) AS alive FROM {S}.app_sms_codes WHERE phone = %s FOR UPDATE", (key,))
    row = cur.fetchone()
    if not row or not row['alive']:
        raise ApiError(400, 'Код устарел. Запросите новый')
    if row['attempts'] >= 5:
        raise ApiError(429, 'Слишком много неверных попыток. Запросите новый код')
    if not hmac.compare_digest(row['code_hash'], sha(f'{key}:{code}')):
        cur.execute(f"UPDATE {S}.app_sms_codes SET attempts = attempts + 1 WHERE phone = %s", (key,))
        cur.connection.commit()
        raise ApiError(400, 'Неверный код')
    cur.execute(f"UPDATE {S}.app_sms_codes SET expires_at = now() WHERE phone = %s", (key,))


def driver_send_code(cur, body):
    if not sms_enabled():
        raise ApiError(400, 'Вход по СМС пока не подключён')
    ip = body.get('_ip', '')
    phone = norm_phone(body.get('phone'))
    rate_limit(cur, f'sms:ip:{ip}', 15, 3600)
    rate_limit(cur, f'sms:drv:{phone}', 4, 1800)
    cur.execute(f"SELECT id FROM {S}.app_users WHERE phone = %s AND role = 'driver'", (phone,))
    exists = bool(cur.fetchone())
    if body.get('purpose') == 'register':
        if exists:
            raise ApiError(409, 'Этот номер уже зарегистрирован. Нажмите «Назад» и войдите')
        issue_code(cur, phone, 'Код регистрации водителя Дальняк', 'd:')
    else:
        if not exists:
            raise ApiError(404, 'Водитель с таким номером не найден. Зарегистрируйтесь')
        issue_code(cur, phone, 'Код входа водителя Дальняк', 'd:')
    return {'ok': True}


CLIENT_PD_VERSION = '2026-10-21'


def client_login(cur, body):
    ip = body.get('_ip', '')
    phone = norm_phone(body.get('phone'))
    rate_limit(cur, f'login:ip:{ip}', 40, 600)
    rate_limit(cur, f'login:client:{phone}', 12, 600)
    name = clean(body.get('name'), 60) or None
    if body.get('pd_consent') is not True:
        raise ApiError(400, 'Нужно согласие на обработку персональных данных')
    if sms_enabled():
        check_code(cur, phone, body.get('code'))
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
    cur.execute(
        f"UPDATE {S}.app_users SET pd_consent_at = now(), pd_consent_ver = %s, pd_consent_ip = %s WHERE id = %s",
        (CLIENT_PD_VERSION, str(ip)[:60], uid),
    )
    return {'token': create_session(cur, uid), 'name': name, 'phone': phone, 'is_new': is_new}


def driver_login(cur, body):
    ip = body.get('_ip', '')
    phone = norm_phone(body.get('phone'))
    pw = str(body.get('password') or '')
    rate_limit(cur, f'login:ip:{ip}', 40, 600)
    rate_limit(cur, f'login:driver:{phone}', 8, 600)
    cur.execute(f"SELECT id, password_hash FROM {S}.app_users WHERE phone = %s AND role = 'driver'", (phone,))
    u = cur.fetchone()
    if not u:
        raise ApiError(404, 'Водитель с таким номером не найден. Зарегистрируйтесь')
    if sms_enabled():
        check_code(cur, phone, body.get('code'), 'd:')
    elif not u or not u['password_hash'] or not check_password(pw, u['password_hash']):
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


PD_VERSION = '2026-10-21'
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
    return docs.store(user_id, field, content)


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
    if sms_enabled():
        pw = secrets.token_urlsafe(18)
    elif len(pw) < 8 or len(pw) > 64:
        raise ApiError(400, 'Пароль должен быть не короче 8 символов')
    if body.get('pd_consent') is not True:
        raise ApiError(400, 'Нужно согласие на обработку персональных данных')
    if any(not photos.get(f) for f in PHOTO_FIELDS):
        raise ApiError(400, 'Нужны все 8 фотографий: права и СТС с двух сторон и 4 фото авто')
    cur.execute(f"SELECT id FROM {S}.app_users WHERE phone = %s AND role = 'driver'", (phone,))
    if cur.fetchone():
        raise ApiError(409, 'Этот номер уже зарегистрирован. Нажмите «Войти»')
    if sms_enabled():
        check_code(cur, phone, body.get('code'), 'd:')
    cur.execute(
        f"INSERT INTO {S}.app_users (phone, role, name, token, password_hash) VALUES (%s, 'driver', %s, %s, %s) RETURNING id",
        (phone, name, placeholder_token(), hash_password(pw)),
    )
    uid = cur.fetchone()['id']
    urls = {f: upload_photo(uid, f, photos[f]) for f in PHOTO_FIELDS}
    cur.execute(
        f"""INSERT INTO {S}.app_drivers
            (user_id, car_model, car_plate, car_color, status, photo_license, photo_license_back, photo_sts, photo_sts_back,
             photo_car_front, photo_car_back, photo_car_left, photo_car_right, pd_consent_at, pd_consent_ver, pd_consent_ip)
            VALUES (%s, %s, %s, %s, 'pending', %s, %s, %s, %s, %s, %s, %s, %s, now(), %s, %s)""",
        (uid, car_model, car_plate, car_color, urls['license'], urls['license_back'], urls['sts'], urls['sts_back'],
         urls['car_front'], urls['car_back'], urls['car_left'], urls['car_right'], PD_VERSION, ip[:60]),
    )
    send_push(cur, dispatcher_ids(cur), 'Новый водитель', f'{name} · {car_model} ждёт проверки', '/app/office-k7x2', 'driver-new')
    return {'token': create_session(cur, uid)}


def sms_diag(cur, user, body):
    import json
    import urllib.parse
    import urllib.request
    key = os.environ.get('SMSRU_API_ID', '')
    out = {'key_len': len(key)}
    def call(path, extra=None):
        q = urllib.parse.urlencode({'api_id': key, 'json': 1, **(extra or {})})
        with urllib.request.urlopen(f'https://sms.ru/{path}?' + q, timeout=4) as r:
            return json.loads(r.read().decode())
    out['balance'] = call('my/balance')
    out['senders'] = call('my/senders')
    out['limit'] = call('my/limit')
    out['free'] = call('my/free')
    if body.get('phone'):
        out['cost'] = call('sms/cost', {'to': norm_phone(body['phone']).lstrip('+'), 'msg': 'Код входа Такси Дальняк: 1234'})
    return out
