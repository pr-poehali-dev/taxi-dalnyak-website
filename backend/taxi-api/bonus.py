import math
import random
import string

from common import S, ApiError, clean, get_config, log_balance, TARIFFS
from push import send_push

ALPHABET = ''.join(c for c in string.ascii_uppercase + string.digits if c not in '0O1IL')


def _log(cur, user_id, amount, reason, trip_id=None):
    cur.execute(
        f"INSERT INTO {S}.app_bonus_log (user_id, amount, reason, trip_id) VALUES (%s, %s, %s, %s)",
        (user_id, amount, reason, trip_id),
    )


def credit(cur, user_id, km, reason, trip_id=None):
    if km <= 0:
        return
    cur.execute(f"UPDATE {S}.app_users SET bonus_km = bonus_km + %s WHERE id = %s", (km, user_id))
    _log(cur, user_id, km, reason, trip_id)


def ref_code(cur, user_id):
    cur.execute(f"SELECT ref_code FROM {S}.app_users WHERE id = %s", (user_id,))
    row = cur.fetchone()
    if row and row['ref_code']:
        return row['ref_code']
    for _ in range(20):
        code = ''.join(random.choice(ALPHABET) for _ in range(6))
        cur.execute(
            f"UPDATE {S}.app_users SET ref_code = %s WHERE id = %s AND ref_code IS NULL AND NOT EXISTS (SELECT 1 FROM {S}.app_users WHERE ref_code = %s) RETURNING ref_code",
            (code, user_id, code),
        )
        got = cur.fetchone()
        if got:
            return got['ref_code']
    return None


def info(cur, user_id, cfg=None):
    cfg = cfg or get_config(cur)
    cur.execute(f"SELECT bonus_km FROM {S}.app_users WHERE id = %s", (user_id,))
    km = cur.fetchone()['bonus_km']
    return {
        'km': km,
        'ref_code': ref_code(cur, user_id),
        'earn_pct': cfg['bonus_earn_pct'],
        'max_pct': cfg['bonus_max_pct'],
        'ref_km': cfg['ref_bonus_km'],
    }


def options(cfg, bonus_km, prices):
    out = {}
    if bonus_km <= 0:
        return out
    for t in TARIFFS:
        rate = cfg['rates']['regular'][t]
        cap = math.floor(prices[t] * cfg['bonus_max_pct'] / 100.0)
        rub = min(math.floor(bonus_km * rate), cap)
        if rub >= 1:
            out[t] = {'rub': rub, 'km': min(bonus_km, math.ceil(rub / rate))}
    return out


def spend(cur, user_id, trip_id, tariff, base_price, cfg):
    cur.execute(f"SELECT bonus_km FROM {S}.app_users WHERE id = %s FOR UPDATE", (user_id,))
    have = cur.fetchone()['bonus_km']
    opt = options(cfg, have, {t: base_price for t in TARIFFS}).get(tariff)
    if not opt:
        return 0
    cur.execute(f"UPDATE {S}.app_users SET bonus_km = bonus_km - %s WHERE id = %s", (opt['km'], user_id))
    cur.execute(
        f"UPDATE {S}.app_trips SET bonus_used = %s, bonus_discount = %s WHERE id = %s",
        (opt['km'], opt['rub'], trip_id),
    )
    _log(cur, user_id, -opt['km'], f'Скидка на заказ №{trip_id}', trip_id)
    return opt['rub']


def refund(cur, trip_id):
    cur.execute(f"SELECT client_id, bonus_used FROM {S}.app_trips WHERE id = %s FOR UPDATE", (trip_id,))
    t = cur.fetchone()
    if t and t['bonus_used'] > 0:
        credit(cur, t['client_id'], t['bonus_used'], f'Возврат за отменённый заказ №{trip_id}', trip_id)
        cur.execute(f"UPDATE {S}.app_trips SET bonus_used = 0, bonus_discount = 0 WHERE id = %s", (trip_id,))


def on_trip_done(cur, trip_id):
    cur.execute(
        f"SELECT client_id, distance_km, bonus_earned, bonus_discount, driver_id, manual_driver, from_installed FROM {S}.app_trips WHERE id = %s FOR UPDATE",
        (trip_id,),
    )
    t = cur.fetchone()
    if not t or t['bonus_earned']:
        return
    cur.execute(f"UPDATE {S}.app_trips SET bonus_earned = true WHERE id = %s", (trip_id,))
    cfg = get_config(cur)
    if t['bonus_discount'] and float(t['bonus_discount']) > 0 and t['driver_id']:
        disc = float(t['bonus_discount'])
        cur.execute(f"UPDATE {S}.app_drivers SET balance = balance + %s WHERE user_id = %s", (disc, t['driver_id']))
        log_balance(cur, t['driver_id'], disc, f'Компенсация бонусной скидки клиента по заказу №{trip_id}')
    earn = int(math.floor(float(t['distance_km'] or 0) * cfg['bonus_earn_pct'] / 100.0))
    if not t['from_installed']:
        earn = 0
    if earn > 0:
        credit(cur, t['client_id'], earn, f'Поездка №{trip_id}', trip_id)
        send_push(cur, [t['client_id']], 'Начислены километры', f'+{earn} км на ваш счёт', '/app/client', f'bonus-{trip_id}')
    cur.execute(f"SELECT referred_by, ref_rewarded FROM {S}.app_users WHERE id = %s FOR UPDATE", (t['client_id'],))
    u = cur.fetchone()
    if u and u['referred_by'] and not u['ref_rewarded'] and cfg['ref_bonus_km'] > 0:
        km = int(cfg['ref_bonus_km'])
        cur.execute(f"UPDATE {S}.app_users SET ref_rewarded = true WHERE id = %s", (t['client_id'],))
        credit(cur, t['client_id'], km, 'Бонус за первую поездку по приглашению', trip_id)
        credit(cur, u['referred_by'], km, 'Друг совершил первую поездку', trip_id)
        send_push(cur, [t['client_id'], u['referred_by']], 'Бонус за друга', f'+{km} км на ваш счёт', '/app/client', f'ref-{trip_id}')


def client_bonus(cur, user, body):
    cfg = get_config(cur)
    cur.execute(f"SELECT count(*) AS c FROM {S}.app_users WHERE referred_by = %s", (user['id'],))
    friends = cur.fetchone()['c']
    cur.execute(f"SELECT id, amount, reason, created_at FROM {S}.app_bonus_log WHERE user_id = %s ORDER BY id DESC LIMIT 30", (user['id'],))
    return {**info(cur, user['id'], cfg), 'friends': friends, 'log': cur.fetchall()}


def apply_code(cur, user, body):
    code = clean(body.get('code'), 40).upper().replace(' ', '')
    if not code:
        raise ApiError(400, 'Введите промокод')
    from common import rate_limit
    rate_limit(cur, f'promo:{user["id"]}', 10, 3600)
    cur.execute(f"SELECT id, km, max_uses, used_count, expires_at, is_active, (expires_at IS NOT NULL AND expires_at < now()) AS expired FROM {S}.app_promos WHERE code = %s FOR UPDATE", (code,))
    p = cur.fetchone()
    if p:
        if not p['is_active'] or p['expired']:
            raise ApiError(400, 'Промокод больше не действует')
        if p['max_uses'] is not None and p['used_count'] >= p['max_uses']:
            raise ApiError(400, 'Промокод уже использован максимальное число раз')
        cur.execute(f"INSERT INTO {S}.app_promo_uses (promo_id, user_id) VALUES (%s, %s) ON CONFLICT DO NOTHING RETURNING promo_id", (p['id'], user['id']))
        if not cur.fetchone():
            raise ApiError(400, 'Вы уже использовали этот промокод')
        cur.execute(f"UPDATE {S}.app_promos SET used_count = used_count + 1 WHERE id = %s", (p['id'],))
        credit(cur, user['id'], p['km'], f'Промокод {code}')
        return {'ok': True, 'kind': 'promo', 'km': p['km'], 'message': f"Начислено {p['km']} км"}
    cur.execute(f"SELECT id FROM {S}.app_users WHERE ref_code = %s AND role = 'client'", (code,))
    friend = cur.fetchone()
    if not friend:
        raise ApiError(400, 'Такой промокод не найден')
    if friend['id'] == user['id']:
        raise ApiError(400, 'Свой код ввести нельзя')
    cur.execute(f"SELECT referred_by FROM {S}.app_users WHERE id = %s", (user['id'],))
    if cur.fetchone()['referred_by']:
        raise ApiError(400, 'Код друга уже указан')
    cur.execute(f"SELECT 1 FROM {S}.app_trips WHERE client_id = %s AND status = 'done' LIMIT 1", (user['id'],))
    if cur.fetchone():
        raise ApiError(400, 'Код друга можно ввести только до первой поездки')
    cur.execute(f"UPDATE {S}.app_users SET referred_by = %s WHERE id = %s", (friend['id'], user['id']))
    km = int(get_config(cur)['ref_bonus_km'])
    return {'ok': True, 'kind': 'ref', 'km': km, 'message': f'Код друга принят. После первой поездки вы оба получите по {km} км'}


def promos(cur, user, body):
    cur.execute(f"SELECT id, code, km, max_uses, used_count, expires_at, is_active FROM {S}.app_promos ORDER BY id DESC LIMIT 100")
    return {'promos': cur.fetchall()}


def promo_save(cur, user, body):
    code = ''.join(c for c in clean(body.get('code'), 30).upper() if c.isalnum() or c in '-_')
    if len(code) < 3:
        raise ApiError(400, 'Промокод от 3 символов, буквы и цифры')
    try:
        km = int(body.get('km'))
    except (TypeError, ValueError):
        raise ApiError(400, 'Укажите, сколько км начислять')
    if not 1 <= km <= 100000:
        raise ApiError(400, 'Километры от 1 до 100000')
    max_uses = None
    if body.get('max_uses') not in (None, ''):
        try:
            max_uses = max(1, int(body.get('max_uses')))
        except (TypeError, ValueError):
            raise ApiError(400, 'Лимит использований указывается числом')
    days = None
    if body.get('days') not in (None, ''):
        try:
            days = max(1, int(body.get('days')))
        except (TypeError, ValueError):
            raise ApiError(400, 'Срок действия указывается числом дней')
    cur.execute(f"SELECT 1 FROM {S}.app_users WHERE ref_code = %s", (code,))
    if cur.fetchone():
        raise ApiError(400, 'Такой код уже занят')
    cur.execute(
        f"""INSERT INTO {S}.app_promos (code, km, max_uses, expires_at)
            VALUES (%s, %s, %s, CASE WHEN %s::int IS NULL THEN NULL ELSE now() + make_interval(days => %s::int) END)
            ON CONFLICT (code) DO NOTHING RETURNING id""",
        (code, km, max_uses, days, days),
    )
    if not cur.fetchone():
        raise ApiError(400, 'Такой промокод уже есть')
    return {'ok': True}


def promo_toggle(cur, user, body):
    cur.execute(f"UPDATE {S}.app_promos SET is_active = NOT is_active WHERE id = %s", (body.get('id'),))
    return {'ok': True}
