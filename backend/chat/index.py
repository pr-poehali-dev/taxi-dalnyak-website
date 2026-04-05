"""Чат такси Дальняк — сообщения, фото через S3, админка."""
import json
import os
import uuid
import base64
import psycopg2
import boto3

HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token, X-Session-Id",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json",
}

S3_ENDPOINT = "https://bucket.poehali.dev"
S3_BUCKET = "files"


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_s3():
    return boto3.client(
        "s3",
        endpoint_url=S3_ENDPOINT,
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )


def upload_image(b64_data):
    raw = base64.b64decode(b64_data)
    ext = "jpg"
    if raw[:8] == b'\x89PNG\r\n\x1a\n':
        ext = "png"
    elif raw[:4] == b'RIFF' and raw[8:12] == b'WEBP':
        ext = "webp"

    content_type = {"jpg": "image/jpeg", "png": "image/png", "webp": "image/webp"}.get(ext, "image/jpeg")
    key = f"chat/{uuid.uuid4().hex}.{ext}"

    s3 = get_s3()
    s3.put_object(Bucket=S3_BUCKET, Key=key, Body=raw, ContentType=content_type)

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    return cdn_url


def resp(status, body):
    return {"statusCode": status, "headers": HEADERS, "body": json.dumps(body, default=str)}


def handler(event: dict, context) -> dict:
    """Чат такси Дальняк — получение/отправка сообщений, загрузка фото."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    conn = get_conn()
    cur = conn.cursor()

    try:
        if method == "GET":
            if params.get("all") == "true":
                cur.execute("""
                    SELECT s.session_id, s.last_message_at,
                           COALESCE(SUM(CASE WHEN m.is_read = FALSE AND m.from_role = 'client' THEN 1 ELSE 0 END), 0) AS unread,
                           (SELECT COALESCE(text, '[фото]') FROM chat_messages WHERE session_id = s.session_id ORDER BY created_at DESC LIMIT 1) AS last_text
                    FROM chat_sessions s
                    LEFT JOIN chat_messages m ON m.session_id = s.session_id
                    GROUP BY s.session_id, s.last_message_at
                    ORDER BY s.last_message_at DESC
                    LIMIT 50
                """)
                rows = cur.fetchall()
                sessions = []
                for r in rows:
                    sessions.append({
                        "session_id": r[0],
                        "last_message_at": r[1].isoformat() if r[1] else "",
                        "unread": int(r[2]),
                        "last_text": r[3] or "",
                    })
                return resp(200, {"sessions": sessions})

            session_id = params.get("session_id")
            if not session_id:
                return resp(400, {"error": "session_id required"})

            cur.execute("""
                SELECT id, from_role, COALESCE(text, ''), created_at, is_read, image_url
                FROM chat_messages
                WHERE session_id = %s
                ORDER BY created_at ASC
            """, (session_id,))
            rows = cur.fetchall()
            messages = []
            for r in rows:
                messages.append({
                    "id": str(r[0]),
                    "from": r[1],
                    "text": r[2],
                    "time": r[3].strftime("%H:%M"),
                    "is_read": r[4],
                    "image_url": r[5],
                })
            return resp(200, {"messages": messages})

        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            session_id = body.get("session_id")

            if not session_id:
                return resp(400, {"error": "session_id required"})

            if body.get("mark_read"):
                cur.execute("UPDATE chat_messages SET is_read = TRUE WHERE session_id = %s AND from_role = 'client'", (session_id,))
                conn.commit()
                return resp(200, {"ok": True})

            text = (body.get("text") or "").strip()
            from_role = body.get("from_role", "client")
            image_b64 = body.get("image_b64")
            image_url = None

            if image_b64:
                image_url = upload_image(image_b64)

            if not text and not image_url:
                return resp(400, {"error": "text or image required"})

            cur.execute("""
                INSERT INTO chat_sessions (session_id)
                VALUES (%s)
                ON CONFLICT (session_id) DO UPDATE SET last_message_at = NOW()
            """, (session_id,))

            cur.execute("""
                INSERT INTO chat_messages (session_id, from_role, text, image_url)
                VALUES (%s, %s, %s, %s)
                RETURNING id, created_at
            """, (session_id, from_role, text, image_url))
            row = cur.fetchone()
            conn.commit()

            return resp(200, {
                "id": str(row[0]),
                "time": row[1].strftime("%H:%M"),
                "image_url": image_url,
                "ok": True,
            })

    finally:
        cur.close()
        conn.close()

    return resp(405, {"error": "Method not allowed"})