import json

import auth
import client
import driver
import dispatcher
from common import ApiError, connect, resp

PUBLIC = {
    'client_login': auth.client_login,
    'driver_login': auth.driver_login,
    'driver_register': auth.driver_register,
    'dispatcher_login': auth.dispatcher_login,
}

PROTECTED = {
    'client_create_trip': ('client', client.create_trip),
    'client_my_trip': ('client', client.my_trip),
    'client_cancel_trip': ('client', client.cancel_trip),
    'driver_poll': ('driver', driver.poll),
    'driver_set_line': ('driver', driver.set_line),
    'driver_take': ('driver', driver.take),
    'driver_trip_status': ('driver', driver.trip_status),
    'driver_topup_test': ('driver', driver.topup_test),
    'disp_poll': ('dispatcher', dispatcher.poll),
    'disp_assign': ('dispatcher', dispatcher.assign),
    'disp_trip_status': ('dispatcher', dispatcher.trip_status),
    'disp_broadcast': ('dispatcher', dispatcher.broadcast),
    'disp_balance': ('dispatcher', dispatcher.balance),
    'disp_driver_status': ('dispatcher', dispatcher.driver_status),
}


def handler(event: dict, context) -> dict:
    '''Единое API приложения междугороднего такси: клиент, водитель, диспетчер (действие передаётся в поле action)'''
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }
    if event.get('httpMethod') != 'POST':
        return resp(405, {'error': 'Method not allowed'})

    body = json.loads(event.get('body') or '{}')
    action = body.get('action')
    headers = {k.lower(): v for k, v in (event.get('headers') or {}).items()}
    token = headers.get('x-auth-token')

    conn = connect()
    try:
        cur = conn.cursor()
        if action in PUBLIC:
            result = PUBLIC[action](cur, body)
        elif action in PROTECTED:
            role, fn = PROTECTED[action]
            user = auth.user_by_token(cur, token, role)
            result = fn(cur, user, body)
        else:
            raise ApiError(400, 'Неизвестное действие')
        conn.commit()
        return resp(200, result)
    except ApiError as e:
        conn.rollback()
        return resp(e.code, {'error': e.message})
    finally:
        conn.close()
