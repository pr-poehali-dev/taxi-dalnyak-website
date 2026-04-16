import json
import http.client
import ssl


BOT_TOKEN = "8294092024:AAG29J99kYrTw5iCYy-f7afgO7T1iubyPSs"
CHAT_ID = "-4725554768"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}

_ssl_ctx = ssl.create_default_context()


def send_telegram(text):
    body_bytes = json.dumps({"chat_id": CHAT_ID, "text": text[:4000]}).encode("utf-8")
    conn = http.client.HTTPSConnection("api.telegram.org", timeout=10, context=_ssl_ctx)
    conn.request(
        "POST",
        "/bot" + BOT_TOKEN + "/sendMessage",
        body=body_bytes,
        headers={"Content-Type": "application/json", "Content-Length": str(len(body_bytes))},
    )
    resp = conn.getresponse()
    data = resp.read().decode("utf-8")
    conn.close()
    return json.loads(data)


def handler(event, context):
    """Sends phone leads from chat bot to Telegram"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"status": "ok"})}

    body = json.loads(event.get("body", "{}"))
    action = body.get("action", "")

    if action != "phone_lead":
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "unknown action"})}

    phone = body.get("phone", "")
    conversation = body.get("conversation", [])
    utm_info = body.get("utm", {})
    source_ip = (event.get("requestContext") or {}).get("identity", {}).get("sourceIp", "")

    chat_text = ""
    for msg in conversation:
        role = msg.get("role", "")
        content = msg.get("content", "")
        if role == "assistant":
            chat_text += "Bot: " + content + "\n"
        elif role == "user":
            chat_text += "Client: " + content + "\n"

    utm_text = ""
    if utm_info:
        for k, v in utm_info.items():
            utm_text += "  " + str(k) + ": " + str(v) + "\n"

    text = "NEW LEAD FROM WEBSITE CHAT\n"
    text += "---\n"
    text += "Phone: " + phone + "\n"
    text += "IP: " + (source_ip or "unknown") + "\n"

    if utm_text:
        text += "---\nUTM:\n" + utm_text

    if chat_text:
        text += "---\nChat:\n" + chat_text

    send_telegram(text)

    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}
