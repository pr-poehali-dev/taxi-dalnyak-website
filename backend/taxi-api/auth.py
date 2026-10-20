import hmac
import os
import uuid
import base64

import boto3

from common import S, ApiError, norm_phone, new_token


def user_by_token(cur, token, role):
    if not token:
        raise ApiError(401, 'Нужно войти')
    cur.execute(f"SELECT * FROM {S}.app_users WHERE token = %s AND role = %s", (token, role))
    u = cur.fetchone()
    if not u:
        raise ApiError(401, 'Сессия устарела, войдите снова')
    return u


def client_login(cur, body):
    phone = norm_phone(body.get('phone'))
    name = (body.get('name') or '').strip() or None
    cur.execute(f"SELECT * FROM {S}.app_users WHERE phone = %s AND role = 'client'", (phone,))
    u = cur.fetchone()
    if u:
        if name and name != u['name']:
            cur.execute(f"UPDATE {S}.app_users SET name = %s WHERE id = %s", (name, u['id']))
        return {'token': u['token'], 'name': name or u['name'], 'phone': phone}
    token = new_token()
    cur.execute(
        f"INSERT INTO {S}.app_users (phone, role, name, token) VALUES (%s, 'client', %s, %s)",
        (phone, name, token),
    )
    return {'token': token, 'name': name, 'phone': phone}


def driver_login(cur, body):
    phone = norm_phone(body.get('phone'))
    cur.execute(f"SELECT * FROM {S}.app_users WHERE phone = %s AND role = 'driver'", (phone,))
    u = cur.fetchone()
    if not u:
        raise ApiError(404, 'Водитель с таким номером не найден. Пройдите регистрацию')
    return {'token': u['token']}


def dispatcher_login(cur, body):
    pwd = os.environ.get('DISPATCHER_PASSWORD', '')
    given = str(body.get('password') or '')
    if not pwd or not hmac.compare_digest(pwd.encode(), given.encode()):
        raise ApiError(401, 'Неверный пароль')
    cur.execute(f"SELECT * FROM {S}.app_users WHERE role = 'dispatcher' LIMIT 1")
    u = cur.fetchone()
    if u:
        token = new_token()
        cur.execute(f"UPDATE {S}.app_users SET token = %s WHERE id = %s", (token, u['id']))
    else:
        token = new_token()
        cur.execute(
            f"INSERT INTO {S}.app_users (phone, role, name, token) VALUES ('dispatcher', 'dispatcher', 'Диспетчер', %s)",
            (token,),
        )
    return {'token': token}


PHOTO_FIELDS = ['license', 'sts', 'car_front', 'car_back', 'car_left', 'car_right']


def upload_photo(user_id, field, data_url):
    raw = data_url.split(',', 1)[-1]
    content = base64.b64decode(raw)
    if len(content) > 4_000_000:
        raise ApiError(400, 'Фото слишком большое')
    key = f"drivers/{user_id}/{field}_{uuid.uuid4().hex[:8]}.jpg"
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=key, Body=content, ContentType='image/jpeg')
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


def driver_register(cur, body):
    phone = norm_phone(body.get('phone'))
    name = (body.get('name') or '').strip()
    car_model = (body.get('car_model') or '').strip()
    car_plate = (body.get('car_plate') or '').strip().upper()
    car_color = (body.get('car_color') or '').strip()
    photos = body.get('photos') or {}
    if not name or not car_model or not car_plate:
        raise ApiError(400, 'Заполните имя, марку и госномер')
    missing = [f for f in PHOTO_FIELDS if not photos.get(f)]
    if missing:
        raise ApiError(400, 'Нужны все 6 фотографий')
    cur.execute(f"SELECT id FROM {S}.app_users WHERE phone = %s AND role = 'driver'", (phone,))
    if cur.fetchone():
        raise ApiError(409, 'Этот номер уже зарегистрирован. Нажмите «Войти»')
    token = new_token()
    cur.execute(
        f"INSERT INTO {S}.app_users (phone, role, name, token) VALUES (%s, 'driver', %s, %s) RETURNING id",
        (phone, name, token),
    )
    uid = cur.fetchone()['id']
    urls = {f: upload_photo(uid, f, photos[f]) for f in PHOTO_FIELDS}
    cur.execute(
        f"""INSERT INTO {S}.app_drivers
            (user_id, car_model, car_plate, car_color, status,
             photo_license, photo_sts, photo_car_front, photo_car_back, photo_car_left, photo_car_right)
            VALUES (%s, %s, %s, %s, 'pending', %s, %s, %s, %s, %s, %s)""",
        (uid, car_model, car_plate, car_color, urls['license'], urls['sts'],
         urls['car_front'], urls['car_back'], urls['car_left'], urls['car_right']),
    )
    return {'token': token}
