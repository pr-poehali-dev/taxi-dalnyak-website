"""
Чат для такси Дальняк.
GET  /?session_id=xxx           — получить сообщения сессии
GET  /?all=true                 — получить все сессии (для админа)
POST /  body: {session_id, text, from_role}          — отправить текст
POST /  body: {session_id, image_b64, from_role}     — отправить фото (base64)
POST /  body: {session_id, mark_read: true}          — отметить прочитанными
"""
import json
import os
import base64
import uuid
import psycopg2
import boto3

HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def upload_image(image_b64: str, session_id: str) -> str:
    """Загружает base64-изображение в S3 и возвращает CDN-URL."""
    data = base64.b64decode(image_b64)
    # Определяем тип по сигнатуре
    if data[:3] == b'\xff\xd8\xff':
        ext, content_type = "jpg", "image/jpeg"
    elif data[:4] == b'\x89PNG':
        ext, content_type = "png", "image/png"
    elif data[:4] in (b'GIF8', b'GIF9'):
        ext, content_type = "gif", "image/gif"
    elif data[:4] == b'RIFF' and data[8:12] == b'WEBP':
        ext, content_type = "webp", "image/webp"
    else:
        ext, content_type = "jpg", "image/jpeg"

    key = f"chat/{session_id}/{uuid.uuid4()}.{ext}"
    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    s3.put_object(Bucket="files", Key=key, Body=data, ContentType=content_type)
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    return cdn_url


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
                SELECT id, from_role, text, created_at, is_read, image_url
                FROM chat_messages
                WHERE session_id = %s
                ORDER BY created_at ASC
            """, (session_id,))
            rows = cur.fetchall()
            messages = [
                {
                    "id": str(r[0]),
                    "from": r[1],
                    "text": r[2] or "",
                    "time": r[3].strftime("%H:%M"),
                    "is_read": r[4],
                    "image_url": r[5],
                }
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

            from_role = body.get("from_role", "client")
            text = (body.get("text") or "").strip()
            image_b64 = body.get("image_b64")
            image_url = None

            # Загрузить фото если есть
            if image_b64:
                image_url = upload_image(image_b64, session_id)
                if not text:
                    text = ""  # фото без подписи — ок

            if not text and not image_url:
                return {"statusCode": 400, "headers": HEADERS, "body": json.dumps({"error": "text or image required"})}

            # Создать/обновить сессию
            cur.execute("""
                INSERT INTO chat_sessions (session_id)
                VALUES (%s)
                ON CONFLICT (session_id) DO UPDATE SET last_message_at = NOW()
            """, (session_id,))
            cur.execute("UPDATE chat_sessions SET last_message_at = NOW() WHERE session_id = %s", (session_id,))

            # Сохранить сообщение
            cur.execute("""
                INSERT INTO chat_messages (session_id, from_role, text, image_url)
                VALUES (%s, %s, %s, %s)
                RETURNING id, created_at
            """, (session_id, from_role, text or None, image_url))
            row = cur.fetchone()
            conn.commit()

            return {"statusCode": 200, "headers": HEADERS, "body": json.dumps({
                "id": str(row[0]),
                "time": row[1].strftime("%H:%M"),
                "image_url": image_url,
                "ok": True,
            })}

    finally:
        cur.close()
        conn.close()

    return {"statusCode": 405, "headers": HEADERS, "body": json.dumps({"error": "Method not allowed"})}
