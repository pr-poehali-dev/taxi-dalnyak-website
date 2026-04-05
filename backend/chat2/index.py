"""Чат такси Дальняк — сообщения клиент/оператор."""
import json
import os
import psycopg2

HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}


def db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def ok(data):
    return {"statusCode": 200, "headers": HEADERS, "body": json.dumps(data, default=str)}


def err(msg, code=400):
    return {"statusCode": code, "headers": HEADERS, "body": json.dumps({"error": msg})}


def handler(event: dict, context) -> dict:
    """Чат такси Дальняк — получение и отправка сообщений."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    conn = db()
    cur = conn.cursor()

    try:
        if method == "GET":
            # Все сессии для оператора
            if params.get("all") == "true":
                cur.execute("""
                    SELECT s.session_id, s.last_message_at,
                           COALESCE(SUM(CASE WHEN m.is_read=FALSE AND m.from_role='client' THEN 1 ELSE 0 END),0) AS unread,
                           (SELECT COALESCE(text,'[фото]') FROM chat_messages WHERE session_id=s.session_id ORDER BY created_at DESC LIMIT 1) AS last_text
                    FROM chat_sessions s
                    LEFT JOIN chat_messages m ON m.session_id=s.session_id
                    GROUP BY s.session_id, s.last_message_at
                    ORDER BY s.last_message_at DESC LIMIT 50
                """)
                rows = cur.fetchall()
                return ok({"sessions": [
                    {"session_id": r[0], "last_message_at": r[1].isoformat(), "unread": int(r[2]), "last_text": r[3] or ""}
                    for r in rows
                ]})

            # Сообщения сессии
            sid = params.get("session_id")
            if not sid:
                return err("session_id required")

            cur.execute("""
                SELECT id, from_role, COALESCE(text,''), created_at, is_read, image_url
                FROM chat_messages WHERE session_id=%s ORDER BY created_at ASC
            """, (sid,))
            rows = cur.fetchall()
            return ok({"messages": [
                {"id": str(r[0]), "from": r[1], "text": r[2], "time": r[3].strftime("%H:%M"), "is_read": r[4], "image_url": r[5]}
                for r in rows
            ]})

        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            sid = body.get("session_id")
            if not sid:
                return err("session_id required")

            # Пометить прочитанными
            if body.get("mark_read"):
                cur.execute("UPDATE chat_messages SET is_read=TRUE WHERE session_id=%s AND from_role='client'", (sid,))
                conn.commit()
                return ok({"ok": True})

            text = (body.get("text") or "").strip()
            role = body.get("from_role", "client")

            if not text:
                return err("text required")

            cur.execute("INSERT INTO chat_sessions (session_id) VALUES (%s) ON CONFLICT (session_id) DO UPDATE SET last_message_at=NOW()", (sid,))
            cur.execute("""
                INSERT INTO chat_messages (session_id, from_role, text)
                VALUES (%s, %s, %s) RETURNING id, created_at
            """, (sid, role, text))
            row = cur.fetchone()
            conn.commit()
            return ok({"id": str(row[0]), "time": row[1].strftime("%H:%M"), "ok": True})

    finally:
        cur.close()
        conn.close()

    return err("Method not allowed", 405)
