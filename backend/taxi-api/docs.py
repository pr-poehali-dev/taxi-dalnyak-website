import base64
import hashlib
import os

import boto3
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from common import S, ApiError

PREFIX = 'enc:'
DOC_COLUMNS = {
    'license': 'photo_license', 'license_back': 'photo_license_back', 'sts': 'photo_sts', 'sts_back': 'photo_sts_back',
    'car_front': 'photo_car_front', 'car_back': 'photo_car_back', 'car_left': 'photo_car_left', 'car_right': 'photo_car_right',
}
CDN = 'https://cdn.poehali.dev/projects/{}/bucket/'


def _s3():
    return boto3.client(
        's3', endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )


def _key():
    secret = os.environ.get('DOCS_ENCRYPTION_KEY') or os.environ['AWS_SECRET_ACCESS_KEY']
    return hashlib.sha256(('docs-v1:' + secret).encode()).digest()


def _random_name():
    return hashlib.sha256(os.urandom(32)).hexdigest()[:40]


def store(user_id, field, content):
    nonce = os.urandom(12)
    blob = nonce + AESGCM(_key()).encrypt(nonce, content, f'{user_id}:{field}'.encode())
    key = f"private-docs/{user_id}/{_random_name()}.bin"
    _s3().put_object(Bucket='files', Key=key, Body=blob, ContentType='application/octet-stream')
    return f'{PREFIX}{field}:{key}'


def _load(ref, user_id):
    if ref.startswith(PREFIX):
        field, key = ref[len(PREFIX):].split(':', 1)
        blob = _s3().get_object(Bucket='files', Key=key)['Body'].read()
        return AESGCM(_key()).decrypt(blob[:12], blob[12:], f'{user_id}:{field}'.encode())
    base = CDN.format(os.environ['AWS_ACCESS_KEY_ID'])
    if ref.startswith(base):
        return _s3().get_object(Bucket='files', Key=ref[len(base):])['Body'].read()
    raise ApiError(404, 'Фото не найдено')


def get(cur, user, body):
    field = body.get('field')
    if field not in DOC_COLUMNS:
        raise ApiError(400, 'Неизвестный документ')
    try:
        driver_id = int(body.get('driver_id'))
    except (TypeError, ValueError):
        raise ApiError(400, 'Укажите водителя')
    cur.execute(f"SELECT {DOC_COLUMNS[field]} AS ref FROM {S}.app_drivers WHERE user_id = %s", (driver_id,))
    row = cur.fetchone()
    if not row or not row['ref']:
        raise ApiError(404, 'Фото не найдено')
    content = _load(row['ref'], driver_id)
    print(f'doc view dispatcher={user["id"]} driver={driver_id} field={field}')
    return {'image': 'data:image/jpeg;base64,' + base64.b64encode(content).decode()}


def migrate_public(cur, limit=6):
    base = CDN.format(os.environ['AWS_ACCESS_KEY_ID'])
    s3 = _s3()
    moved = 0
    for field, col in DOC_COLUMNS.items():
        cur.execute(f"SELECT user_id, {col} AS ref FROM {S}.app_drivers WHERE {col} LIKE %s LIMIT %s", (base + '%', limit))
        for r in cur.fetchall():
            old = r['ref'][len(base):]
            content = s3.get_object(Bucket='files', Key=old)['Body'].read()
            new_ref = store(r['user_id'], field, content)
            cur.execute(f"UPDATE {S}.app_drivers SET {col} = %s WHERE user_id = %s", (new_ref, r['user_id']))
            cur.connection.commit()
            s3.delete_object(Bucket='files', Key=old)
            moved += 1
            if moved >= limit:
                return moved
    return moved


