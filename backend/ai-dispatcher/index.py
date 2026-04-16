import json
import os
import re
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

SYSTEM_PROMPT = (
    "You are a professional dispatcher of intercity taxi service called Dalnyak. "
    "You MUST respond ONLY in Russian language. "
    "Your task is to politely and naturally communicate with the client, help them, "
    "and DEFINITELY get their phone number for callback.\n\n"
    "RULES:\n"
    "1. Be polite, friendly and professional. Don't be pushy.\n"
    "2. Use formal 'you' (on Russian).\n"
    "3. If client asks about route/price - say the exact cost will be calculated by dispatcher via phone, "
    "but approximately from 35 RUB/km (Standard), from 50 RUB/km (Comfort+), from 60 RUB/km (Minivan). "
    "Minimum order 3000 RUB.\n"
    "4. Your MAIN goal is to get the client's phone number. Do it softly and naturally, "
    "for example: 'Leave your phone number - the dispatcher will call you back and clarify everything.'\n"
    "5. When the client gave a phone number - thank them and say the dispatcher will contact them "
    "shortly from number 8 (995) 645-51-25.\n"
    "6. Do NOT use markdown formatting (**, ## etc). Write plain text.\n"
    "7. Answer SHORT - 1-3 sentences maximum.\n"
    "8. If client wrote a city - clarify from where and to where, then suggest leaving a number.\n"
    "9. Never say you are a bot or AI. You are a dispatcher.\n"
    "10. If there is UTM info about client's request - use it for personalization.\n\n"
    "TARIFFS (approximate):\n"
    "- Standard (Hyundai Solaris): from 35 RUB/km (up to 250 km), from 31 RUB/km (over 250 km), min 3000 RUB\n"
    "- Comfort+ (Toyota Camry 70): from 50 RUB/km (up to 250 km), from 42 RUB/km (over 250 km), min 5000 RUB\n"
    "- Minivan (Hyundai Starex): from 60 RUB/km (up to 250 km), from 55 RUB/km (over 250 km), min 5000 RUB\n"
    "- New territories (DPR, LPR, Kherson, Zaporizhzhia): from 80-100 RUB/km\n\n"
    "Contacts: phone 8 (995) 645-51-25, Telegram @Mezhgorod1816, WhatsApp +79956455125.\n"
    "IMPORTANT: Always respond in Russian!"
)

_ssl_ctx = ssl.create_default_context()


def https_post(host, path, body_dict, headers=None):
    """HTTPS POST with proper UTF-8 encoding"""
    body_str = json.dumps(body_dict)
    body_bytes = body_str.encode("utf-8")
    conn = http.client.HTTPSConnection(host, timeout=15, context=_ssl_ctx)
    hdrs = {
        "Content-Type": "application/json",
        "Content-Length": str(len(body_bytes)),
    }
    if headers:
        hdrs.update(headers)
    conn.request("POST", path, body=body_bytes, headers=hdrs)
    resp = conn.getresponse()
    data = resp.read().decode("utf-8")
    conn.close()
    return json.loads(data)


def call_llm(messages, api_key):
    """LLM ChatCompletion via Groq (OpenAI-compatible, works from RU)"""
    result = https_post(
        "api.groq.com",
        "/openai/v1/chat/completions",
        {
            "model": "llama-3.3-70b-versatile",
            "messages": messages,
            "max_tokens": 200,
            "temperature": 0.7,
        },
        {"Authorization": "Bearer " + api_key},
    )
    if "error" in result:
        err_msg = result.get("error", {}).get("message", "LLM error")
        raise Exception("LLM: " + err_msg)
    return result["choices"][0]["message"]["content"].strip()


def detect_phone(text):
    """Find phone number in text"""
    cleaned = re.sub(r'[^\d+]', '', text)
    if len(cleaned) >= 10:
        return cleaned
    patterns = [
        r'[\+]?[78][\s\-]?\(?\d{3}\)?\s?\-?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}',
        r'\d{10,11}',
        r'[\+]?\d[\d\s\-\(\)]{9,}',
    ]
    for p in patterns:
        m = re.search(p, text)
        if m:
            return m.group(0).strip()
    return None


def send_telegram_chat(conversation, phone, utm_info, source_ip):
    """Send chat transcript to Telegram"""
    chat_text = ""
    for msg in conversation:
        if msg["role"] == "assistant":
            chat_text += "Dispatcher: " + msg["content"] + "\n"
        elif msg["role"] == "user":
            chat_text += "Client: " + msg["content"] + "\n"

    utm_text = ""
    if utm_info:
        for k, v in utm_info.items():
            utm_text += "  " + k + ": " + v + "\n"

    text = "NEW CONTACT FROM AI-DISPATCHER\n"
    text += "---\n"
    text += "Phone: " + phone + "\n"
    text += "IP: " + (source_ip or "unknown") + "\n"

    if utm_text:
        text += "---\nUTM:\n" + utm_text

    text += "---\nConversation:\n" + chat_text

    return https_post(
        "api.telegram.org",
        "/bot" + BOT_TOKEN + "/sendMessage",
        {"chat_id": CHAT_ID, "text": text[:4000]},
    )


def handler(event, context):
    """AI dispatcher for intercity taxi: conducts dialog, gets phone, sends transcript to Telegram"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"status": "ok"})}

    raw_key = os.environ.get("GROQ_API_KEY", "").strip()
    api_key = "".join(c for c in raw_key if ord(c) < 128).strip()
    if not api_key:
        return {"statusCode": 500, "headers": CORS, "body": json.dumps({"error": "API key not configured"})}

    body = json.loads(event.get("body", "{}"))
    action = body.get("action", "chat")
    conversation = body.get("conversation", [])
    user_message = body.get("message", "")
    utm_info = body.get("utm", {})
    source_ip = (event.get("requestContext") or {}).get("identity", {}).get("sourceIp", "")

    if action == "chat":
        system_msg = SYSTEM_PROMPT
        if utm_info:
            utm_details = ", ".join(k + "=" + v for k, v in utm_info.items())
            system_msg += "\n\nClient UTM info: " + utm_details + ". Use for personalization if relevant."

        messages = [{"role": "system", "content": system_msg}]
        messages.extend(conversation)

        if user_message:
            messages.append({"role": "user", "content": user_message})

        try:
            reply = call_llm(messages, api_key)
        except Exception as e:
            return {
                "statusCode": 200,
                "headers": CORS,
                "body": json.dumps({"reply": "Извините, произошла техническая ошибка. Позвоните нам: 8 (995) 645-51-25", "phone_detected": False, "error": str(e)}),
            }

        phone = None
        if user_message:
            phone = detect_phone(user_message)

        if phone:
            full_conv = conversation + [
                {"role": "user", "content": user_message},
                {"role": "assistant", "content": reply},
            ]
            send_telegram_chat(full_conv, phone, utm_info, source_ip)

        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({
                "reply": reply,
                "phone_detected": phone is not None,
            }),
        }

    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "unknown action"})}