import hashlib
import hmac
import json
import os
import re
import secrets
from datetime import datetime, date
from decimal import Decimal

import psycopg2
import psycopg2.extras

S = os.environ.get('MAIN_DB_SCHEMA', 'public')

CORS = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

TARIFFS = ('standard', 'comfort', 'minivan')
ACTIVE = ('assigned', 'enroute', 'arrived', 'in_progress')
TRIP_TEXT = {
    'standard': 'Стандарт', 'comfort': 'Комфорт', 'minivan': 'Минивэн',
}

DEFAULT_CONFIG = {
    'rates': {
        'regular': {'standard': 35, 'comfort': 40, 'minivan': 60},
        'new': {'standard': 85, 'comfort': 90, 'minivan': 110},
    },
    'min_price': 2000,
    'commission_pct': 20,
    'priority_price': 1000,
    'priority_days': 30,
    'priority_delay_sec': 20,
    'cancel_limit_24h': 3,
    'cancel_limit_7d': 5,
    'payment_info': '',
    'support_telegram': 'https://t.me/Mezhgorod1816',
    'support_max': '',
}


class ApiError(Exception):
    def __init__(self, code, message):
        self.code = code
        self.message = message


def _default(o):
    if isinstance(o, Decimal):
        return float(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    return str(o)


def resp(code, data):
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps(data, default=_default, ensure_ascii=False)}


def connect():
    return psycopg2.connect(os.environ['DATABASE_URL'], cursor_factory=psycopg2.extras.RealDictCursor)


def norm_phone(raw):
    d = ''.join(c for c in str(raw or '') if c.isdigit())
    if len(d) == 11 and d[0] == '8':
        d = '7' + d[1:]
    if len(d) == 10:
        d = '7' + d
    if len(d) != 11 or d[0] != '7':
        raise ApiError(400, 'Введите номер телефона полностью')
    return '+' + d


def clean(text, limit):
    return re.sub(r'\s+', ' ', str(text or '')).strip()[:limit]


def sha(token):
    return hashlib.sha256(str(token).encode()).hexdigest()


def hash_password(pw):
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac('sha256', pw.encode(), salt, 150000)
    return f"pbkdf2${salt.hex()}${dk.hex()}"


def check_password(pw, stored):
    try:
        _, salt, dk = stored.split('$')
        calc = hashlib.pbkdf2_hmac('sha256', pw.encode(), bytes.fromhex(salt), 150000)
        return hmac.compare_digest(calc.hex(), dk)
    except Exception:
        return False


def create_session(cur, user_id, days=30):
    token = secrets.token_urlsafe(32)
    cur.execute(
        f"INSERT INTO {S}.app_sessions (user_id, token_hash, expires_at) VALUES (%s, %s, now() + make_interval(days => %s))",
        (user_id, sha(token), days),
    )
    return token


def placeholder_token():
    return secrets.token_hex(16)


def get_config(cur):
    cfg = json.loads(json.dumps(DEFAULT_CONFIG))
    cur.execute(f"SELECT value FROM {S}.app_settings WHERE key = 'config'")
    row = cur.fetchone()
    if row:
        stored = json.loads(row['value'])
        for k, v in stored.items():
            if isinstance(v, dict) and isinstance(cfg.get(k), dict):
                for k2, v2 in v.items():
                    if isinstance(v2, dict) and isinstance(cfg[k].get(k2), dict):
                        cfg[k][k2].update(v2)
                    else:
                        cfg[k][k2] = v2
            else:
                cfg[k] = v
    return cfg


def rate_limit(cur, key, limit, window_sec):
    cur.execute(
        f"SELECT count(*) AS c FROM {S}.app_rate_log WHERE key = %s AND created_at > now() - make_interval(secs => %s)",
        (key, window_sec),
    )
    if cur.fetchone()['c'] >= limit:
        raise ApiError(429, 'Слишком много попыток. Подождите немного и повторите')
    cur.execute(f"INSERT INTO {S}.app_rate_log (key) VALUES (%s)", (key,))
    cur.connection.commit()


def log_balance(cur, driver_id, amount, reason):
    cur.execute(
        f"INSERT INTO {S}.app_balance_log (driver_id, amount, reason) VALUES (%s, %s, %s)",
        (driver_id, amount, reason),
    )


def charge_commission(cur, driver_id, trip_id):
    cur.execute(f"SELECT price FROM {S}.app_trips WHERE id = %s", (trip_id,))
    price = float(cur.fetchone()['price'] or 0)
    pct = get_config(cur)['commission_pct']
    commission = round(price * pct / 100)
    cur.execute(
        f"UPDATE {S}.app_drivers SET balance = balance - %s WHERE user_id = %s AND balance >= %s RETURNING balance",
        (commission, driver_id, commission),
    )
    if not cur.fetchone():
        raise ApiError(402, f'Недостаточно средств. Комиссия за этот заказ {commission} ₽ ({pct}%). Пополните баланс')
    cur.execute(
        f"UPDATE {S}.app_trips SET commission = %s, commission_charged = true WHERE id = %s",
        (commission, trip_id),
    )
    log_balance(cur, driver_id, -commission, f"Комиссия за заказ №{trip_id}")
    return commission


def refund_commission(cur, trip_id):
    cur.execute(
        f"SELECT driver_id, commission, commission_charged FROM {S}.app_trips WHERE id = %s FOR UPDATE",
        (trip_id,),
    )
    t = cur.fetchone()
    if t and t['commission_charged'] and t['driver_id']:
        cur.execute(
            f"UPDATE {S}.app_drivers SET balance = balance + %s WHERE user_id = %s",
            (t['commission'], t['driver_id']),
        )
        cur.execute(f"UPDATE {S}.app_trips SET commission_charged = false WHERE id = %s", (trip_id,))
        log_balance(cur, t['driver_id'], t['commission'], f"Возврат комиссии за заказ №{trip_id}")
