"""Админка диспетчера: список диалогов, история, отправка сообщений от оператора."""
import json
import os
import re
import http.client
import ssl

import psycopg2


DATABASE_URL = os.environ.get("DATABASE_URL", "")
DB_SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p85334902_taxi_dalnyak_website")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
    "Content-Type": "application/json; charset=utf-8",
}

_ssl_ctx = ssl.create_default_context()


def db_conn():
    return psycopg2.connect(DATABASE_URL)


def telegram_send(text):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return False
    body = json.dumps({"chat_id": TELEGRAM_CHAT_ID, "text": text[:4000], "parse_mode": "HTML"}).encode("utf-8")
    conn = http.client.HTTPSConnection("api.telegram.org", timeout=15, context=_ssl_ctx)
    try:
        conn.request("POST", f"/bot{TELEGRAM_BOT_TOKEN}/sendMessage", body=body,
                     headers={"Content-Type": "application/json", "Content-Length": str(len(body))})
        resp = conn.getresponse()
        resp.read()
        return resp.status == 200
    finally:
        conn.close()


def check_auth(event):
    """Проверяет токен админа из X-Admin-Token (или query param token)."""
    if not ADMIN_PASSWORD:
        return True  # если пароль не задан — открыто (на свой страх)
    headers = event.get("headers") or {}
    token = (
        headers.get("X-Admin-Token")
        or headers.get("x-admin-token")
        or (event.get("queryStringParameters") or {}).get("token")
        or ""
    )
    return token == ADMIN_PASSWORD


def list_sessions(only_needs=False, limit=80):
    conn = db_conn()
    try:
        cur = conn.cursor()
        where = ""
        if only_needs:
            where = "WHERE needs_operator = TRUE OR operator_active = TRUE"
        cur.execute(
            f"SELECT session_id, last_message_at, created_at, "
            f"  route_from, route_to, distance_km, car_class, quoted_price, phone, "
            f"  pickup_date, pickup_time, pax_count, extras, "
            f"  is_ordered, needs_operator, operator_active, unread_for_operator, "
            f"  last_assistant_message, drop_stage, messages_count, utm_source, utm_term "
            f"FROM {DB_SCHEMA}.chat_sessions "
            f"{where} "
            f"ORDER BY "
            f"  CASE WHEN needs_operator THEN 0 WHEN operator_active THEN 1 ELSE 2 END, "
            f"  last_message_at DESC "
            f"LIMIT %s",
            (limit,),
        )
        cols = [
            "session_id", "last_message_at", "created_at",
            "route_from", "route_to", "distance_km", "car_class", "quoted_price", "phone",
            "pickup_date", "pickup_time", "pax_count", "extras",
            "is_ordered", "needs_operator", "operator_active", "unread_for_operator",
            "last_assistant_message", "drop_stage", "messages_count", "utm_source", "utm_term",
        ]
        result = []
        for row in cur.fetchall():
            d = dict(zip(cols, row))
            for k in ("last_message_at", "created_at"):
                if d.get(k):
                    d[k] = d[k].isoformat()
            if d.get("distance_km") is not None:
                d["distance_km"] = float(d["distance_km"])
            if d.get("quoted_price") is not None:
                d["quoted_price"] = float(d["quoted_price"])
            result.append(d)
        return result
    finally:
        conn.close()


def get_session(session_id):
    conn = db_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            f"SELECT session_id, last_message_at, created_at, "
            f"  route_from, route_to, distance_km, car_class, quoted_price, phone, "
            f"  pickup_date, pickup_time, pax_count, extras, has_toll, "
            f"  is_ordered, needs_operator, operator_active, unread_for_operator, "
            f"  last_assistant_message, drop_stage, messages_count, "
            f"  utm_source, utm_medium, utm_campaign, utm_term, utm_content, "
            f"  user_agent, ip_address "
            f"FROM {DB_SCHEMA}.chat_sessions WHERE session_id = %s",
            (session_id,),
        )
        row = cur.fetchone()
        if not row:
            return None
        cols = [
            "session_id", "last_message_at", "created_at",
            "route_from", "route_to", "distance_km", "car_class", "quoted_price", "phone",
            "pickup_date", "pickup_time", "pax_count", "extras", "has_toll",
            "is_ordered", "needs_operator", "operator_active", "unread_for_operator",
            "last_assistant_message", "drop_stage", "messages_count",
            "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
            "user_agent", "ip_address",
        ]
        d = dict(zip(cols, row))
        for k in ("last_message_at", "created_at"):
            if d.get(k):
                d[k] = d[k].isoformat()
        if d.get("distance_km") is not None:
            d["distance_km"] = float(d["distance_km"])
        if d.get("quoted_price") is not None:
            d["quoted_price"] = float(d["quoted_price"])

        cur.execute(
            f"SELECT from_role, text, created_at FROM {DB_SCHEMA}.chat_messages "
            f"WHERE session_id = %s ORDER BY created_at ASC LIMIT 200",
            (session_id,),
        )
        msgs = []
        for role, text, ts in cur.fetchall():
            msgs.append({
                "role": role,
                "text": text,
                "ts": ts.isoformat() if ts else None,
            })
        d["messages"] = msgs
        return d
    finally:
        conn.close()


def join_session(session_id):
    """Оператор подключается — Алиса замолкает."""
    conn = db_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {DB_SCHEMA}.chat_sessions "
            f"SET operator_active = TRUE, operator_joined_at = NOW(), needs_operator = FALSE, "
            f"    unread_for_operator = 0 "
            f"WHERE session_id = %s",
            (session_id,),
        )
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


def leave_session(session_id):
    """Оператор отключается — Алиса снова отвечает."""
    conn = db_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {DB_SCHEMA}.chat_sessions "
            f"SET operator_active = FALSE, needs_operator = FALSE "
            f"WHERE session_id = %s",
            (session_id,),
        )
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


def mark_read(session_id):
    conn = db_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {DB_SCHEMA}.chat_sessions SET unread_for_operator = 0 WHERE session_id = %s",
            (session_id,),
        )
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


def send_operator_message(session_id, text):
    if not text or not text.strip():
        return {"ok": False, "error": "empty"}
    conn = db_conn()
    try:
        cur = conn.cursor()
        # Активируем оператора если ещё не активен
        cur.execute(
            f"UPDATE {DB_SCHEMA}.chat_sessions "
            f"SET operator_active = TRUE, "
            f"    operator_joined_at = COALESCE(operator_joined_at, NOW()), "
            f"    needs_operator = FALSE, "
            f"    last_message_at = NOW(), "
            f"    last_assistant_message = %s "
            f"WHERE session_id = %s",
            (text[:2000], session_id),
        )
        cur.execute(
            f"INSERT INTO {DB_SCHEMA}.chat_messages (session_id, from_role, text) VALUES (%s, %s, %s)",
            (session_id, "operator", text[:8000]),
        )
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


def stats():
    conn = db_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            f"SELECT "
            f"  COUNT(*) FILTER (WHERE needs_operator = TRUE) AS waiting, "
            f"  COUNT(*) FILTER (WHERE operator_active = TRUE) AS active, "
            f"  COUNT(*) FILTER (WHERE last_message_at > NOW() - INTERVAL '30 minutes') AS recent, "
            f"  COUNT(*) FILTER (WHERE is_ordered = TRUE AND created_at::date = CURRENT_DATE) AS orders_today, "
            f"  COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) AS sessions_today "
            f"FROM {DB_SCHEMA}.chat_sessions",
        )
        row = cur.fetchone()
        return {
            "waiting": row[0],
            "active": row[1],
            "recent": row[2],
            "orders_today": row[3],
            "sessions_today": row[4],
        }
    finally:
        conn.close()


def handler(event, context):
    """Админка для оператора-диспетчера: смотреть диалоги Алисы, перехватывать клиентов."""
    method = event.get("httpMethod", "GET")
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    qs = event.get("queryStringParameters") or {}
    action = qs.get("action") or ""

    # Auth-проверка пароля (POST /login без токена тоже разрешён)
    if action != "login" and not check_auth(event):
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "unauthorized"})}

    try:
        if method == "GET":
            if action == "list":
                only_needs = qs.get("only_needs") == "1"
                return _ok({"sessions": list_sessions(only_needs=only_needs)})
            if action == "session":
                sid = qs.get("session_id") or ""
                if not sid:
                    return _err("session_id required", 400)
                data = get_session(sid)
                if not data:
                    return _err("not_found", 404)
                return _ok(data)
            if action == "stats":
                return _ok(stats())
            return _err("unknown_action", 400)

        if method == "POST":
            try:
                body = json.loads(event.get("body") or "{}")
            except Exception:
                body = {}

            if action == "login":
                pwd = (body.get("password") or "").strip()
                if not ADMIN_PASSWORD:
                    return _ok({"ok": True, "token": "open"})
                if pwd == ADMIN_PASSWORD:
                    return _ok({"ok": True, "token": ADMIN_PASSWORD})
                return _err("wrong_password", 401)

            sid = (body.get("session_id") or "").strip()
            if not sid:
                return _err("session_id required", 400)

            if action == "join":
                return _ok(join_session(sid))
            if action == "leave":
                return _ok(leave_session(sid))
            if action == "read":
                return _ok(mark_read(sid))
            if action == "send":
                text = body.get("text") or ""
                return _ok(send_operator_message(sid, text))
            return _err("unknown_action", 400)

        return _err("method_not_allowed", 405)
    except Exception as e:
        print(f"[admin-chat] error: {e}")
        return _err(f"internal: {e}", 500)


def _ok(data):
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, ensure_ascii=False, default=str)}


def _err(msg, status=400):
    return {"statusCode": status, "headers": CORS, "body": json.dumps({"error": msg})}
