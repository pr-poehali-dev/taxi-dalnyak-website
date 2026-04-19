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
    body_bytes = json.dumps({"chat_id": CHAT_ID, "text": text[:4000], "parse_mode": "HTML"}).encode("utf-8")
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
    """Receives lead form submissions from website and sends them to Telegram"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"status": "ok"})}

    body = json.loads(event.get("body", "{}"))
    action = body.get("action", "")

    if action not in ("lead", "callback"):
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "unknown action"})}

    is_callback = action == "callback"

    from_city = str(body.get("from", "")).strip()[:200]
    to_city = str(body.get("to", "")).strip()[:200]
    phone = str(body.get("phone", "")).strip()[:50]
    name = str(body.get("name", "")).strip()[:100]
    tariff = str(body.get("tariff", "")).strip()[:50]
    when = str(body.get("when", "")).strip()[:100]
    comment = str(body.get("comment", "")).strip()[:500]
    utm_info = body.get("utm", {}) or {}
    page = str(body.get("page", "")).strip()[:500]
    source_ip = (event.get("requestContext") or {}).get("identity", {}).get("sourceIp", "")

    digits_only = "".join(ch for ch in phone if ch.isdigit())
    if len(digits_only) < 10:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "phone required"})}

    if is_callback:
        text = "<b>⚡ ОБРАТНЫЙ ЗВОНОК ЗА 30 СЕК</b>\n"
    else:
        text = "<b>НОВАЯ ЗАЯВКА С САЙТА</b>\n"
    text += "---\n"
    if name:
        text += "<b>Имя:</b> " + name + "\n"
    text += "<b>Телефон:</b> " + phone + "\n"
    if from_city:
        text += "<b>Откуда:</b> " + from_city + "\n"
    if to_city:
        text += "<b>Куда:</b> " + to_city + "\n"
    if tariff:
        text += "<b>Тариф:</b> " + tariff + "\n"
    if when:
        text += "<b>Когда:</b> " + when + "\n"
    if comment:
        text += "<b>Комментарий:</b> " + comment + "\n"

    if utm_info:
        text += "---\n<b>UTM:</b>\n"
        for k, v in utm_info.items():
            text += "  " + str(k) + ": " + str(v) + "\n"

    text += "---\n"
    text += "IP: " + (source_ip or "—") + "\n"
    if page:
        text += "Страница: " + page

    send_telegram(text)

    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}