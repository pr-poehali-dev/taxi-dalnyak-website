import json

import auth
import bonus
import chat
import client
import driver
import dispatcher
import push
import track
from common import ApiError, connect, resp

PUBLIC = {
    'config': auth.public_config,
    'client_login': auth.client_login,
    'client_send_code': auth.client_send_code,
    'driver_login': auth.driver_login,
    'driver_register': auth.driver_register,
    'dispatcher_login': auth.dispatcher_login,
    'track': track.track,
}

PROTECTED = {
    'client_suggest': ('client', client.suggest),
    'client_reverse': ('client', client.reverse),
    'client_quote': ('client', client.quote),
    'client_create_trip': ('client', client.create_trip),
    'client_poll': ('client', client.poll),
    'client_raise_price': ('client', client.raise_price),
    'client_cancel_trip': ('client', client.cancel_trip),
    'client_rate': ('client', client.rate),
    'client_history': ('client', client.history_all),
    'client_bonus': ('client', bonus.client_bonus),
    'client_apply_code': ('client', bonus.apply_code),
    'client_chat_get': ('client', client.chat_get),
    'client_chat_send': ('client', client.chat_send),
    'client_push_subscribe': ('client', auth.push_subscribe),
    'driver_poll': ('driver', driver.poll),
    'driver_set_line': ('driver', driver.set_line),
    'driver_take': ('driver', driver.take),
    'driver_trip_status': ('driver', driver.trip_status),
    'driver_cancel': ('driver', driver.cancel),
    'driver_set_eta': ('driver', driver.set_eta),
    'driver_upload_docs': ('driver', driver.upload_docs),
    'driver_request_topup': ('driver', driver.request_topup),
    'driver_buy_priority': ('driver', driver.buy_priority),
    'driver_chat_get': ('driver', driver.chat_get),
    'driver_chat_send': ('driver', driver.chat_send),
    'driver_push_subscribe': ('driver', auth.push_subscribe),
    'disp_poll': ('dispatcher', dispatcher.poll),
    'disp_clients': ('dispatcher', dispatcher.clients),
    'disp_client_block': ('dispatcher', dispatcher.client_block),
    'disp_promos': ('dispatcher', bonus.promos),
    'disp_promo_save': ('dispatcher', bonus.promo_save),
    'disp_promo_toggle': ('dispatcher', bonus.promo_toggle),
    'disp_assign': ('dispatcher', dispatcher.assign),
    'disp_assign_external': ('dispatcher', dispatcher.assign_external),
    'disp_trip_status': ('dispatcher', dispatcher.trip_status),
    'disp_broadcast': ('dispatcher', dispatcher.broadcast),
    'disp_broadcast_remove': ('dispatcher', dispatcher.broadcast_remove),
    'disp_balance': ('dispatcher', dispatcher.balance),
    'disp_topup_resolve': ('dispatcher', dispatcher.topup_resolve),
    'disp_driver_status': ('dispatcher', dispatcher.driver_status),
    'disp_driver_tariffs': ('dispatcher', dispatcher.driver_tariffs),
    'disp_driver_priority': ('dispatcher', dispatcher.driver_priority),
    'disp_chat_get': ('dispatcher', dispatcher.trip_chat_get),
    'disp_chat_send': ('dispatcher', dispatcher.trip_chat_send),
    'disp_create_driver': ('dispatcher', dispatcher.create_driver),
    'disp_update_driver': ('dispatcher', dispatcher.update_driver),
    'disp_reset_password': ('dispatcher', dispatcher.reset_password),
    'disp_request_recheck': ('dispatcher', dispatcher.request_recheck),
    'disp_report': ('dispatcher', dispatcher.report),
    'disp_save_config': ('dispatcher', dispatcher.save_config),
    'disp_push_subscribe': ('dispatcher', auth.push_subscribe),
}


def handler(event: dict, context) -> dict:
    '''Единое API приложения междугороднего такси: пассажир, водитель, диспетчер (действие в поле action)'''
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
    if len(event.get('body') or '') > 12_000_000:
        return resp(413, {'error': 'Слишком большой запрос'})

    try:
        body = json.loads(event.get('body') or '{}')
        if not isinstance(body, dict):
            raise ValueError
    except ValueError:
        return resp(400, {'error': 'Неверный запрос'})

    action = body.get('action')
    body['_ip'] = ((event.get('requestContext') or {}).get('identity') or {}).get('sourceIp', '')
    headers = {k.lower(): v for k, v in (event.get('headers') or {}).items()}
    token = headers.get('x-auth-token')

    push.reset()
    conn = connect()
    try:
        cur = conn.cursor()
        if action == 'logout':
            result = auth.logout(cur, token)
        elif action in PUBLIC:
            result = PUBLIC[action](cur, body)
        elif action in PROTECTED:
            role, fn = PROTECTED[action]
            user = auth.user_by_token(cur, token, role)
            result = fn(cur, user, body)
        else:
            raise ApiError(400, 'Неизвестное действие')
        conn.commit()
        push.flush(conn)
        return resp(200, result)
    except ApiError as e:
        conn.rollback()
        push.reset()
        return resp(e.code, {'error': e.message})
    except Exception as e:
        try:
            conn.rollback()
        except Exception:
            pass
        push.reset()
        print('unhandled', type(e).__name__, str(e)[:200])
        return resp(503, {'error': 'Сервис занят, повторите через несколько секунд'})
    finally:
        conn.close()
