import json
import os
import urllib.request

BOT_TOKEN = "8294092024:AAG29J99kYrTw5iCYy-f7afgO7T1iubyPSs"
CHAT_ID = "-4725554768"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}

SYSTEM_PROMPT = """Ты — профессиональный диспетчер службы межгородного такси "Дальняк".
Твоя задача — вежливо и естественно общаться с клиентом, помочь ему и ОБЯЗАТЕЛЬНО получить его номер телефона для обратной связи.

ПРАВИЛА:
1. Будь вежливым, дружелюбным и профессиональным. Не будь навязчивым.
2. Обращайся на "вы".
3. Если клиент спрашивает о маршруте/цене — скажи что точную стоимость рассчитает диспетчер по телефону, но ориентировочно от 35₽/км (Стандарт), от 50₽/км (Комфорт+), от 60₽/км (Минивэн). Минимальный заказ 3000₽.
4. Твоя ГЛАВНАЯ цель — получить номер телефона клиента. Делай это мягко и естественно, например: "Оставьте номер телефона — диспетчер перезвонит и всё уточнит".
5. Когда клиент дал номер телефона — поблагодари и скажи что диспетчер свяжется в ближайшее время с номера 8 (995) 645-51-25.
6. Не используй markdown-разметку (**, ## и т.д.). Пиши простым текстом.
7. Отвечай КОРОТКО — 1-3 предложения максимум.
8. Если клиент написал город — уточни откуда и куда, затем предложи оставить номер.
9. Никогда не говори что ты бот или ИИ. Ты — диспетчер.
10. Если есть UTM-информация о запросе клиента — используй её для персонализации (например, если utm содержит город — спроси подтверждение).

ТАРИФЫ (ориентировочные):
- Стандарт (Hyundai Solaris): от 35₽/км (до 250 км), от 31₽/км (свыше 250 км), мин. 3000₽
- Комфорт+ (Toyota Camry 70): от 50₽/км (до 250 км), от 42₽/км (свыше 250 км), мин. 5000₽
- Минивэн (Hyundai Starex): от 60₽/км (до 250 км), от 55₽/км (свыше 250 км), мин. 5000₽
- Новые территории (ДНР, ЛНР, Херсон, Запорожье): от 80-100₽/км

Способы связи: телефон 8 (995) 645-51-25, Telegram @Mezhgorod1816, WhatsApp +79956455125."""


def call_openai(messages, api_key):
    """Вызов OpenAI ChatCompletion API"""
    url = "https://api.openai.com/v1/chat/completions"
    payload = json.dumps({
        "model": "gpt-4o-mini",
        "messages": messages,
        "max_tokens": 200,
        "temperature": 0.7,
    }).encode()
    req = urllib.request.Request(url, data=payload, headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    })
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode())
    return data["choices"][0]["message"]["content"].strip()


def detect_phone(text):
    """Ищем номер телефона в тексте"""
    import re
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
    """Отправляем переписку в Telegram"""
    chat_text = ""
    for msg in conversation:
        if msg["role"] == "assistant":
            chat_text += f"🤖 Диспетчер: {msg['content']}\n"
        elif msg["role"] == "user":
            chat_text += f"👤 Клиент: {msg['content']}\n"

    utm_text = ""
    if utm_info:
        for k, v in utm_info.items():
            utm_text += f"  {k}: {v}\n"

    msg = (
        f"📞 НОВЫЙ КОНТАКТ ОТ AI-ДИСПЕТЧЕРА\n"
        f"{'─' * 30}\n"
        f"📱 Телефон: {phone}\n"
        f"🌐 IP: {source_ip or 'неизвестен'}\n"
    )

    if utm_text:
        msg += f"{'─' * 30}\n🔗 UTM:\n{utm_text}"

    msg += f"{'─' * 30}\n💬 Переписка:\n{chat_text}"

    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = json.dumps({
        "chat_id": CHAT_ID,
        "text": msg[:4000],
    }).encode()
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode())


def handler(event, context):
    """AI-диспетчер такси: ведёт диалог с клиентом, получает телефон и отправляет переписку в Telegram"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"status": "ok"})}

    api_key = os.environ.get("OPENAI_API_KEY", "")
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
            utm_details = ", ".join(f"{k}={v}" for k, v in utm_info.items())
            system_msg += f"\n\nИнформация о запросе клиента (UTM): {utm_details}. Используй это для персонализации, если релевантно."

        messages = [{"role": "system", "content": system_msg}]
        messages.extend(conversation)

        if user_message:
            messages.append({"role": "user", "content": user_message})

        reply = call_openai(messages, api_key)

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
