import json
import os
import secrets
from datetime import datetime, date
from decimal import Decimal

import psycopg2
import psycopg2.extras

S = os.environ.get('MAIN_DB_SCHEMA', 'public')
COMMISSION = 150
ONLINE_SQL = "(dr.on_line AND dr.last_seen > now() - interval '90 seconds')"

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
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


def new_token():
    return secrets.token_hex(24)


def log_balance(cur, driver_id, amount, reason):
    cur.execute(
        f"INSERT INTO {S}.app_balance_log (driver_id, amount, reason) VALUES (%s, %s, %s)",
        (driver_id, amount, reason),
    )
