import json
import os
import http.client
import ssl


BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")

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
    route = str(body.get("route", "")).strip()[:200]
    utm_info = body.get("utm", {}) or {}
    page = str(body.get("page", "")).strip()[:500]
    source_ip = (event.get("requestContext") or {}).get("identity", {}).get("sourceIp", "")

    digits_only = "".join(ch for ch in phone if ch.isdigit())
    if len(digits_only) < 10:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "phone required"})}

    # Build clickable phone link in tg format: +7XXXXXXXXXX
    if len(digits_only) == 11 and digits_only[0] == "8":
        digits_e164 = "7" + digits_only[1:]
    elif len(digits_only) == 10:
        digits_e164 = "7" + digits_only
    else:
        digits_e164 = digits_only
    phone_link = "+" + digits_e164

    # Filter Yandex placeholders that weren't substituted
    def is_valid_utm(v):
        if not v:
            return False
        s = str(v).strip()
        if not s:
            return False
        if s.startswith("{") or s.endswith("}"):
            return False
        return True

    clean_utm = {}
    if isinstance(utm_info, dict):
        for k, v in utm_info.items():
            if is_valid_utm(v):
                clean_utm[str(k)] = str(v)

    if is_callback:
        text = "<b>⚡ ОБРАТНЫЙ ЗВОНОК ЗА 30 СЕК</b>\n"
    else:
        text = "<b>НОВАЯ ЗАЯВКА С САЙТА</b>\n"
    text += "---\n"
    if name:
        text += "<b>Имя:</b> " + name + "\n"
    text += '<b>Телефон:</b> <a href="tel:' + phone_link + '">' + phone + "</a>\n"
    if route:
        text += "<b>Маршрут (запрос):</b> " + route + "\n"
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

    if clean_utm:
        text += "---\n<b>UTM:</b>\n"
        for k, v in clean_utm.items():
            text += "  " + k + ": " + v + "\n"

    text += "---\n"
    text += "IP: " + (source_ip or "—") + "\n"
    if page:
        text += "Страница: " + page

    send_telegram(text)

    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}