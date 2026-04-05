"""
Чат для такси Дальняк.
GET  /?session_id=xxx           — получить сообщения сессии
GET  /?all=true                 — получить все сессии (для админа)
GET  /?session_id=xxx&all_msgs=true — все сообщения сессии для админа
POST /  body: {session_id, text, from_role}  — отправить сообщение
POST /  body: {session_id, mark_read: true}  — отметить прочитанными
"""
import json
import os
import psycopg2

HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    conn = get_conn()
    cur = conn.cursor()

    try:
        if method == "GET":
            # Все сессии для админки
            if params.get("all") == "true":
                cur.execute("""
                    SELECT s.session_id, s.last_message_at,
                           COUNT(m.id) FILTER (WHERE m.is_read = FALSE AND m.from_role = 'client') AS unread,
                           (SELECT text FROM chat_messages WHERE session_id = s.session_id ORDER BY created_at DESC LIMIT 1) AS last_text
                    FROM chat_sessions s
                    LEFT JOIN chat_messages m ON m.session_id = s.session_id
                    GROUP BY s.session_id, s.last_message_at
                    ORDER BY s.last_message_at DESC
                    LIMIT 50
                """)
                rows = cur.fetchall()
                sessions = [
                    {"session_id": r[0], "last_message_at": r[1].isoformat(), "unread": r[2], "last_text": r[3]}
                    for r in rows
                ]
                return {"statusCode": 200, "headers": HEADERS, "body": json.dumps({"sessions": sessions})}

            # Сообщения конкретной сессии
            session_id = params.get("session_id")
            if not session_id:
                return {"statusCode": 400, "headers": HEADERS, "body": json.dumps({"error": "session_id required"})}

            cur.execute("""
                SELECT id, from_role, text, created_at, is_read
                FROM chat_messages
                WHERE session_id = %s
                ORDER BY created_at ASC
            """, (session_id,))
            rows = cur.fetchall()
            messages = [
                {"id": str(r[0]), "from": r[1], "text": r[2], "time": r[3].strftime("%H:%M"), "is_read": r[4]}
                for r in rows
            ]
            return {"statusCode": 200, "headers": HEADERS, "body": json.dumps({"messages": messages})}

        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            session_id = body.get("session_id")

            if not session_id:
                return {"statusCode": 400, "headers": HEADERS, "body": json.dumps({"error": "session_id required"})}

            # Пометить прочитанными
            if body.get("mark_read"):
                cur.execute("""
                    UPDATE chat_messages SET is_read = TRUE
                    WHERE session_id = %s AND from_role = 'client'
                """, (session_id,))
                conn.commit()
                return {"statusCode": 200, "headers": HEADERS, "body": json.dumps({"ok": True})}

            text = body.get("text", "").strip()
            from_role = body.get("from_role", "client")

            if not text:
                return {"statusCode": 400, "headers": HEADERS, "body": json.dumps({"error": "text required"})}

            # Создать сессию если не существует
            cur.execute("""
                INSERT INTO chat_sessions (session_id)
                VALUES (%s)
                ON CONFLICT (session_id) DO UPDATE SET last_message_at = NOW()
            """, (session_id,))

            # Обновить время последнего сообщения
            cur.execute("""
                UPDATE chat_sessions SET last_message_at = NOW() WHERE session_id = %s
            """, (session_id,))

            # Добавить сообщение
            cur.execute("""
                INSERT INTO chat_messages (session_id, from_role, text)
                VALUES (%s, %s, %s)
                RETURNING id, created_at
            """, (session_id, from_role, text))
            row = cur.fetchone()
            conn.commit()

            return {"statusCode": 200, "headers": HEADERS, "body": json.dumps({
                "id": str(row[0]),
                "time": row[1].strftime("%H:%M"),
                "ok": True
            })}

    finally:
        cur.close()
        conn.close()

    return {"statusCode": 405, "headers": HEADERS, "body": json.dumps({"error": "Method not allowed"})}
