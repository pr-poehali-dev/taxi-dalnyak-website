import json
import os
import re
import http.client
import ssl
import urllib.parse
import uuid
from datetime import datetime, timezone

import psycopg2


DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
GEOAPIFY_API_KEY = os.environ.get("GEOAPIFY_API_KEY", "")
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")
DATABASE_URL = os.environ.get("DATABASE_URL", "")
DB_SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p85334902_taxi_dalnyak_website")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
    "Content-Type": "application/json; charset=utf-8",
}

_ssl_ctx = ssl.create_default_context()


SYSTEM_PROMPT = """Ты — Алиса, диспетчер-консультант компании «Дальняк». Межгороднее такси. Не продаёшь — помогаешь и консультируешь, и тем самым ведёшь клиента к заказу. Общаешься тепло, как живой опытный человек в мессенджере.

═══ КАК ПИШЕШЬ ═══
- ОДНО короткое сообщение = ОДНА мысль или ОДИН вопрос. Не больше 1-2 предложений за раз.
- Никаких списков, маркеров, таблиц, длинных абзацев. Клиент НЕ ЧИТАЕТ длинные тексты.
- Без канцелярита. Пиши как живой человек в мессенджере.
- Эмодзи — изредка, по настроению (🚗 👌 ✨). Не больше одного на сообщение.
- НИКОГДА не упоминай: ИИ, нейросеть, бот, ChatGPT, DeepSeek. Ты — Алиса, диспетчер.
- НЕ перечисляй классы машин списком. Если клиент сам не спросил — не вываливай.
- НЕ говори клиенту «как опытный консультант» и подобную ерунду. Просто будь живой.

═══ ПРАВИЛО ОДНОГО ВОПРОСА ═══
Опытный диспетчер не вываливает 5 вопросов сразу. Один вопрос — ответ — следующий. Так клиент втягивается.

Воронка вопросов (по одному за раз, в этом порядке):
1) Откуда едем? (если ещё не знаешь)
2) Куда?
3) Когда нужна машина? (дата + время — ОБЯЗАТЕЛЬНО, без этого заказ нельзя оформить)
4) Сколько вас человек?
5) Багаж большой? (один-два чемодана / много вещей / только сумки)
6) Туда-обратно или в один конец?
[здесь уже вызываешь calculate_route и считаешь цену, озвучиваешь]
7) Подходит цена? / Какие вопросы по поездке?
8) Закрепить машину? Тогда дайте номер телефона — водитель свяжется.
9) [получила номер] → create_order

ВАЖНО: если клиент уже в первом сообщении дал маршрут — НЕ переспрашивай его. Иди сразу к шагу 3 (когда едем).

═══ СТИЛЬ ОТВЕТОВ — ПРИМЕРЫ ═══

❌ ПЛОХО: "Здравствуйте! Меня зовут Алиса, я с радостью помогу вам с поездкой. Подскажите, пожалуйста, откуда и куда вы планируете ехать, сколько будет пассажиров и какой класс автомобиля предпочитаете?"

✅ ХОРОШО: "Привет! Откуда забрать?"

❌ ПЛОХО: "Отлично! Ростов-на-Дону → Москва, прекрасный маршрут! Расскажите, пожалуйста, когда планируете ехать и сколько будет пассажиров, чтобы я могла подобрать оптимальный вариант."

✅ ХОРОШО: "Окей, Ростов → Москва 👌 Когда нужна машина?"

❌ ПЛОХО: "По вашему маршруту стоимость составит 18 000 рублей за класс Стандарт. В эту сумму включено: расстояние 1100 км, тариф 26 руб/км, наценка 20% и так далее. Если вам нужны закрывающие документы, добавится 10%."

✅ ХОРОШО: "Посчитала — 18 000 ₽ на Стандарте. Цена фиксированная, в дороге не вырастет."
[следующее сообщение]: "Подходит?"

❌ ПЛОХО: "Чтобы оформить заказ и закрепить за вами машину, продиктуйте, пожалуйста, ваш контактный номер телефона."

✅ ХОРОШО: "Закрепляю машину. Какой номер?"

═══ КАК ВЫЯСНЯЕШЬ ВРЕМЯ ═══

Спрашивай мягко: «Когда нужна машина?» или «На какой день/час планируете?»

Если клиент говорит «завтра» — уточни время: «Окей, завтра во сколько?»
Если говорит «вечером» — уточни «Часов в 7-8 удобно?»
Если «срочно/сегодня» — «Через сколько подать?»

В заказе ОБЯЗАТЕЛЬНО должны быть и дата, и примерное время. Без них create_order не вызывай — переспроси.

═══ КЛАССЫ МАШИН ═══
Не называй сама, пока клиент не спросит или пока не дойдёшь до этапа цены.
Когда озвучиваешь цену — называй ОДИН подходящий класс (по числу людей):
• 1-3 человека — Стандарт
• 4 человека / длинная дорога — Комфорт
• нужен премиум — Комфорт+
• 5-8 человек или много багажа — Минивэн

Если клиент спросил «а какие есть?» — ответь коротко в две строки, без списка-простыни:
"Есть Стандарт (до 3-х), Комфорт (до 4-х), Комфорт+ (премиум) и Минивэн (5-8 мест). Что подойдёт?"

═══ ТАРИФЫ (для расчёта, клиенту не зачитываешь) ═══
₽ за 1 км × расстояние × 1.20 (наценка) + платные дороги (отдельно, без наценки)

Стандарт: 100-200км=30; 200-500км=27; от 500км=26; новые территории=70
Комфорт:  100-200км=35; 200-500км=32; от 500км=31; новые территории=75
Комфорт+: 100-200км=40; 200-500км=38; от 500км=36; новые территории=80
Минивэн:  100-200км=60; 200-500км=55; от 500км=50; новые территории=100

Минимум поездки — 200 км. Если меньше — мягко скажи «у нас межгород от 200 км, ближе не возим».
Закрывающие документы (если попросит) → +10% к итогу.
Округляй цену до сотен ₽ вверх.

═══ ИНСТРУМЕНТЫ ═══
- calculate_route(origin, destination) — ОБЯЗАТЕЛЬНО вызывай ДО озвучивания цены. Не придумывай км.
- create_order — вызывай ТОЛЬКО когда есть: маршрут + дата + время + телефон. Передавай pickup_date и pickup_time отдельными полями.

═══ БАЗА ЗНАНИЙ — ОПЛАТА ═══
- Принимаем наличные и онлайн водителю.
- Безнал: перевод на карту водителю в начале поездки. Чек с QR-кодом — по запросу, +10% к сумме.
- Если просят реквизиты для оплаты переводом — карта 89225055125, Яндекс Банк, Алексей Г.
- Возможна частичная или полная предоплата для брони (фиксирует цену), особенно в высокий сезон.

═══ БАЗА ЗНАНИЙ — ПОДАЧА И ОЖИДАНИЕ ═══
- Водитель приезжает за 15 минут до назначенного времени.
- Бесплатное ожидание — 30 минут, далее 10 ₽/мин.
- Встреча в аэропорту/на вокзале с табличкой — +1300 ₽.
- Если рейс задерживается, отслеживаем табло, ждём без штрафа.

═══ БАЗА ЗНАНИЙ — БАГАЖ И ЖИВОТНЫЕ ═══
- Стандартные чемоданы и сумки — бесплатно.
- Крупногабарит (велосипеды, лыжи, мебель) — оговаривается отдельно, уточни у клиента.
- Маленькие животные (переноска, на руках) — бесплатно. Крупные собаки — обсуждаем.

═══ БАЗА ЗНАНИЙ — БЕЗОПАСНОСТЬ И КОМФОРТ ═══
- Все водители проверены, стаж от 5 лет. Авто проходят ТО, всегда чистые.
- В салоне: кондиционер, зарядка для телефона, бутылка воды.
- Поддержка в пути 24/7.

═══ ВОЗРАЖЕНИЯ (отвечай коротко, по-человечески) ═══
"Дорого" → "Понимаю. Цена фиксированная — не вырастет в пути, в неё уже всё включено: подача, ожидание, вода, зарядка. Хотите, посчитаю Стандарт — будет дешевле?"
"У других нашёл дешевле" → "Бывает, только у многих цена в пути растёт. У нас названная — конечная. И поддержка 24/7. Давайте всё-таки зафиксирую цену, с чем сравнивать будет 👌"
"А вдруг машина не приедет?" → "Работаем 5 лет, ни одного срыва. Водитель свяжется заранее. Если ЧП — оператор перезвонит за 5 минут и подаст другую."
"Подумаю" → "Конечно. Давайте я закреплю машину без обязательств — передумаете, отмените, без штрафа."
"Можно с ребёнком/собакой?" → "Конечно. Кресло/бустер и питомец — бесплатно 👌"

═══ НЕСТАНДАРТНЫЙ ВОПРОС ═══
Если не знаешь точного ответа — НЕ выдумывай. Скажи: "Давайте уточню у старшего менеджера. Оставьте номер, перезвоним через пару минут." Это всё равно лид.

═══ ЕСЛИ ПРОСИТ ПОЗВОНИТЬ / ТЕХПОДДЕРЖКУ ═══
- Просит, чтобы перезвонили → возьми номер и оформи заказ-заявку (create_order с минимумом: phone + что просят).
- Просит техподдержку / старшего → дай номер: 8 (995) 645-51-25.

═══ СБРОС КОНТЕКСТА ═══
После того как заказ оформлен и ты попрощалась — забудь весь контекст. Следующее сообщение от любого пользователя встречай как нового клиента: "Здравствуйте! Я Алиса, помогу рассчитать поездку." Не вспоминай старый маршрут.
Если клиент в середине диалога пишет "новый заказ" / "другой маршрут" — мгновенно сбрось контекст и начни сначала.

═══ ЗАПРЕЩЕНО ═══
- Длинные сообщения (больше 2 коротких предложений)
- Списки и маркеры
- Задавать 2+ вопроса в одном сообщении
- Просить телефон до того как назвала цену
- Выдумывать километры (только через calculate_route)
- Оформлять заказ без даты/времени поездки
- Говорить «я ИИ/бот/нейросеть»

═══ КОНТЕКСТ КЛИКОВ ═══
Если в сообщении пользователя стоит метка [клик: ...] — это значит он ткнул в кнопку на сайте. Реагируй на это естественно, как живой диспетчер: «О, документы для бухгалтерии? Сделаем 👌 Откуда едем?». Не цитируй метку дословно, не упоминай что это «клик».
"""


TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "calculate_route",
            "description": "Рассчитать расстояние и время в пути между двумя городами/адресами через Geoapify. Возвращает км, часы, наличие платных участков. ОБЯЗАТЕЛЬНО вызывай ДО озвучивания цены.",
            "parameters": {
                "type": "object",
                "properties": {
                    "origin": {"type": "string", "description": "Город/адрес откуда (например: Ростов-на-Дону)"},
                    "destination": {"type": "string", "description": "Город/адрес куда (например: Москва)"},
                },
                "required": ["origin", "destination"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_order",
            "description": "Оформить заказ. Вызывается ТОЛЬКО когда есть: маршрут + дата + время + телефон. Без даты/времени НЕ вызывай — сначала переспроси.",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone": {"type": "string", "description": "Телефон клиента"},
                    "route_from": {"type": "string"},
                    "route_to": {"type": "string"},
                    "pickup_date": {"type": "string", "description": "Дата выезда: '15 мая', 'завтра', 'сегодня', '12.05.2026' и т.д. — как сказал клиент"},
                    "pickup_time": {"type": "string", "description": "Примерное время выезда: '14:00', 'утром', 'вечером', 'через час' и т.д."},
                    "distance_km": {"type": "number"},
                    "car_class": {"type": "string", "description": "Стандарт | Комфорт | Комфорт+ | Минивэн"},
                    "price": {"type": "number", "description": "Итоговая цена в рублях"},
                    "pax_count": {"type": "integer"},
                    "extras": {"type": "string", "description": "Дополнительно: дет.кресло, питомец, документы, багаж и т.д."},
                    "summary": {"type": "string", "description": "Короткая сводка важных деталей диалога"},
                },
                "required": ["phone", "pickup_date", "pickup_time"],
            },
        },
    },
]


def db_conn():
    return psycopg2.connect(DATABASE_URL)


def https_post_json(host, path, payload, headers, timeout=60):
    body_bytes = json.dumps(payload).encode("utf-8")
    h = {"Content-Type": "application/json", "Content-Length": str(len(body_bytes))}
    h.update(headers or {})
    conn = http.client.HTTPSConnection(host, timeout=timeout, context=_ssl_ctx)
    conn.request("POST", path, body=body_bytes, headers=h)
    resp = conn.getresponse()
    data = resp.read()
    status = resp.status
    conn.close()
    return status, data.decode("utf-8", errors="ignore")


def https_get(host, path, timeout=20):
    conn = http.client.HTTPSConnection(host, timeout=timeout, context=_ssl_ctx)
    conn.request("GET", path)
    resp = conn.getresponse()
    data = resp.read()
    status = resp.status
    conn.close()
    return status, data.decode("utf-8", errors="ignore")


def geoapify_geocode(query):
    q = urllib.parse.quote(query)
    path = f"/v1/geocode/search?text={q}&lang=ru&limit=1&filter=countrycode:ru,by,kz,ua&apiKey={GEOAPIFY_API_KEY}"
    status, data = https_get("api.geoapify.com", path)
    if status != 200:
        return None
    try:
        j = json.loads(data)
        feats = j.get("features") or []
        if not feats:
            return None
        coords = feats[0]["geometry"]["coordinates"]
        return {"lat": coords[1], "lon": coords[0], "name": feats[0]["properties"].get("formatted", query)}
    except Exception:
        return None


def geoapify_route(origin_text, destination_text):
    a = geoapify_geocode(origin_text)
    b = geoapify_geocode(destination_text)
    if not a or not b:
        return {"ok": False, "error": "geocode_failed", "origin": origin_text, "destination": destination_text}

    waypoints = f"{a['lat']},{a['lon']}|{b['lat']},{b['lon']}"
    path = f"/v1/routing?waypoints={waypoints}&mode=drive&details=route_details,toll&apiKey={GEOAPIFY_API_KEY}"
    status, data = https_get("api.geoapify.com", path, timeout=30)
    if status != 200:
        return {"ok": False, "error": f"routing_status_{status}"}
    try:
        j = json.loads(data)
        feats = j.get("features") or []
        if not feats:
            return {"ok": False, "error": "no_route"}
        props = feats[0]["properties"]
        distance_m = props.get("distance", 0)
        time_s = props.get("time", 0)
        toll = False
        legs = props.get("legs") or []
        for leg in legs:
            for step in (leg.get("steps") or []):
                if step.get("toll"):
                    toll = True
                    break
        return {
            "ok": True,
            "distance_km": round(distance_m / 1000.0, 1),
            "duration_h": round(time_s / 3600.0, 1),
            "has_toll": toll,
            "origin": a["name"],
            "destination": b["name"],
        }
    except Exception as e:
        return {"ok": False, "error": f"parse_{e}"}


def telegram_send(text):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return False
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": text[:4000], "parse_mode": "HTML"}
    status, _ = https_post_json("api.telegram.org", f"/bot{TELEGRAM_BOT_TOKEN}/sendMessage", payload, {})
    return status == 200


def split_into_bubbles(text):
    """Разбивает длинный ответ Алисы на 1-3 коротких сообщения."""
    if not text:
        return []
    text = text.strip()
    # Убираем markdown-маркеры списков
    text = re.sub(r"^\s*[-•*]\s+", "", text, flags=re.MULTILINE)

    # Сначала пробуем разделить по двойному переносу (модель сама поделила)
    parts = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    if len(parts) > 1:
        return parts[:3]

    # Если ответ больше 140 символов и состоит из 2+ предложений — режем
    if len(text) > 140:
        sentences = re.split(r"(?<=[.!?])\s+", text)
        sentences = [s.strip() for s in sentences if s.strip()]
        if len(sentences) >= 2:
            mid = len(sentences) // 2
            first = " ".join(sentences[:mid]).strip()
            second = " ".join(sentences[mid:]).strip()
            if first and second:
                return [first, second]

    return [text]


def normalize_phone(raw):
    digits = re.sub(r"\D", "", raw or "")
    if len(digits) == 11 and digits[0] == "8":
        digits = "7" + digits[1:]
    if len(digits) == 10:
        digits = "7" + digits
    return digits


def deepseek_chat(messages, tools=None):
    payload = {
        "model": "deepseek-chat",
        "messages": messages,
        "temperature": 0.85,
        "max_tokens": 250,
    }
    if tools:
        payload["tools"] = tools
        payload["tool_choice"] = "auto"
    status, data = https_post_json(
        "api.proxyapi.ru",
        "/deepseek/v1/chat/completions",
        payload,
        {"Authorization": f"Bearer {DEEPSEEK_API_KEY}"},
        timeout=60,
    )
    if status != 200:
        return None, f"deepseek_status_{status}: {data[:300]}"
    try:
        j = json.loads(data)
        return j["choices"][0]["message"], None
    except Exception as e:
        return None, f"parse_error: {e}"


def load_history(cur, session_id, limit=30):
    cur.execute(
        f"SELECT from_role, text FROM {DB_SCHEMA}.chat_messages "
        f"WHERE session_id = %s ORDER BY created_at ASC LIMIT %s",
        (session_id, limit),
    )
    history = []
    for role, text in cur.fetchall():
        if role == "user":
            history.append({"role": "user", "content": text})
        elif role in ("assistant", "bot"):
            history.append({"role": "assistant", "content": text})
    return history


def save_message(cur, session_id, role, text):
    cur.execute(
        f"INSERT INTO {DB_SCHEMA}.chat_messages (session_id, from_role, text) VALUES (%s, %s, %s)",
        (session_id, role, text[:8000]),
    )


def ensure_session(cur, session_id, utm, user_agent, ip):
    cur.execute(
        f"SELECT session_id FROM {DB_SCHEMA}.chat_sessions WHERE session_id = %s",
        (session_id,),
    )
    if cur.fetchone():
        cur.execute(
            f"UPDATE {DB_SCHEMA}.chat_sessions SET last_message_at = NOW() WHERE session_id = %s",
            (session_id,),
        )
        return
    cur.execute(
        f"INSERT INTO {DB_SCHEMA}.chat_sessions "
        f"(session_id, utm_source, utm_medium, utm_campaign, utm_term, utm_content, user_agent, ip_address) "
        f"VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
        (
            session_id,
            (utm or {}).get("utm_source"),
            (utm or {}).get("utm_medium"),
            (utm or {}).get("utm_campaign"),
            (utm or {}).get("utm_term"),
            (utm or {}).get("utm_content"),
            (user_agent or "")[:500],
            (ip or "")[:64],
        ),
    )


def update_session_meta(cur, session_id, **kwargs):
    if not kwargs:
        return
    cols = []
    vals = []
    for k, v in kwargs.items():
        cols.append(f"{k} = %s")
        vals.append(v)
    vals.append(session_id)
    cur.execute(
        f"UPDATE {DB_SCHEMA}.chat_sessions SET {', '.join(cols)}, last_message_at = NOW() WHERE session_id = %s",
        tuple(vals),
    )


def save_order(cur, session_id, args):
    phone_norm = normalize_phone(args.get("phone", ""))
    cur.execute(
        f"INSERT INTO {DB_SCHEMA}.chat_orders "
        f"(session_id, phone, route_from, route_to, distance_km, car_class, price, pax_count, extras, raw_summary, sent_to_telegram, pickup_date, pickup_time) "
        f"VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
        (
            session_id,
            phone_norm or args.get("phone", ""),
            args.get("route_from"),
            args.get("route_to"),
            args.get("distance_km"),
            args.get("car_class"),
            args.get("price"),
            args.get("pax_count"),
            args.get("extras"),
            args.get("summary"),
            False,
            args.get("pickup_date"),
            args.get("pickup_time"),
        ),
    )
    order_id = cur.fetchone()[0]
    update_session_meta(
        cur,
        session_id,
        is_ordered=True,
        phone=phone_norm,
        route_from=args.get("route_from"),
        route_to=args.get("route_to"),
        distance_km=args.get("distance_km"),
        car_class=args.get("car_class"),
        quoted_price=args.get("price"),
        pickup_date=args.get("pickup_date"),
        pickup_time=args.get("pickup_time"),
    )
    return order_id, phone_norm


def format_order_telegram(args, phone_norm, session_id, utm):
    phone_link = "+" + phone_norm if phone_norm else args.get("phone", "")
    lines = ["<b>🚖 ЗАКАЗ ОТ АЛИСЫ (ИИ-АГЕНТ)</b>", "—"]
    lines.append(f'<b>Телефон:</b> <a href="tel:{phone_link}">{phone_link}</a>')
    if args.get("route_from") or args.get("route_to"):
        lines.append(f'<b>Маршрут:</b> {args.get("route_from","?")} → {args.get("route_to","?")}')
    if args.get("pickup_date") or args.get("pickup_time"):
        when = " ".join(filter(None, [args.get("pickup_date"), args.get("pickup_time")]))
        lines.append(f'<b>Когда:</b> {when}')
    if args.get("distance_km"):
        lines.append(f'<b>Расстояние:</b> {args.get("distance_km")} км')
    if args.get("car_class"):
        lines.append(f'<b>Класс:</b> {args.get("car_class")}')
    if args.get("price"):
        lines.append(f'<b>Цена:</b> {int(args.get("price"))} ₽')
    if args.get("pax_count"):
        lines.append(f'<b>Пассажиров:</b> {args.get("pax_count")}')
    if args.get("extras"):
        lines.append(f'<b>Доп.:</b> {args.get("extras")}')
    if args.get("summary"):
        lines.append("—")
        lines.append(f'<i>{args.get("summary")}</i>')
    if utm:
        clean = {k: v for k, v in utm.items() if v and not str(v).startswith("{")}
        if clean:
            lines.append("—")
            lines.append("<b>UTM:</b>")
            for k, v in clean.items():
                lines.append(f"  {k}: {v}")
    lines.append("—")
    lines.append(f"session: <code>{session_id[:12]}</code>")
    return "\n".join(lines)


def run_chat(session_id, user_message, utm, user_agent, ip):
    conn = db_conn()
    conn.autocommit = False
    try:
        cur = conn.cursor()
        ensure_session(cur, session_id, utm, user_agent, ip)
        save_message(cur, session_id, "user", user_message)

        history = load_history(cur, session_id, limit=30)

        utm_hint = ""
        if utm:
            term = utm.get("utm_term") or ""
            if term and not str(term).startswith("{"):
                utm_hint = f"\n\n[Контекст: клиент пришёл с рекламы по запросу «{term}». Если в запросе есть маршрут — учти его сразу.]"

        messages = [{"role": "system", "content": SYSTEM_PROMPT + utm_hint}] + history

        # Multi-step: до 3 итераций tool calls
        final_text = None
        last_err = None
        for _ in range(4):
            msg, err = deepseek_chat(messages, tools=TOOLS)
            if err or msg is None:
                last_err = err or "no_msg"
                print(f"[alisa] deepseek error: {last_err}")
                final_text = "Извините, на секунду пропала связь. Повторите, пожалуйста, ваш маршрут?"
                break

            tool_calls = msg.get("tool_calls") or []
            if tool_calls:
                messages.append(msg)
                for tc in tool_calls:
                    fn = tc["function"]["name"]
                    try:
                        args = json.loads(tc["function"].get("arguments") or "{}")
                    except Exception:
                        args = {}
                    if fn == "calculate_route":
                        result = geoapify_route(args.get("origin", ""), args.get("destination", ""))
                    elif fn == "create_order":
                        order_id, phone_norm = save_order(cur, session_id, args)
                        text_tg = format_order_telegram(args, phone_norm, session_id, utm)
                        sent = telegram_send(text_tg)
                        if sent:
                            cur.execute(
                                f"UPDATE {DB_SCHEMA}.chat_orders SET sent_to_telegram = TRUE WHERE id = %s",
                                (order_id,),
                            )
                        result = {"ok": True, "order_id": order_id, "telegram_sent": sent}
                    else:
                        result = {"error": "unknown_tool"}
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc["id"],
                        "content": json.dumps(result, ensure_ascii=False),
                    })
                continue

            final_text = msg.get("content") or ""
            break

        if not final_text:
            final_text = "Расскажите, откуда и куда нужна машина — посчитаю стоимость 🚗"

        # Сохраняем последнюю ошибку в meta для диагностики
        if last_err:
            try:
                update_session_meta(cur, session_id, drop_stage=str(last_err)[:500])
            except Exception:
                pass

        save_message(cur, session_id, "assistant", final_text)
        update_session_meta(cur, session_id, last_assistant_message=final_text[:2000])
        cur.execute(
            f"UPDATE {DB_SCHEMA}.chat_sessions "
            f"SET messages_count = COALESCE(messages_count,0) + 2 WHERE session_id = %s",
            (session_id,),
        )

        conn.commit()

        # Разбиваем длинный ответ на пузырьки, чтобы выглядело живо
        bubbles = split_into_bubbles(final_text)
        return {"reply": final_text, "bubbles": bubbles, "session_id": session_id}
    except Exception as e:
        conn.rollback()
        print(f"[alisa] fatal: {e}")
        return {"reply": "Что-то пошло не так на нашей стороне. Попробуйте ещё раз через минуту 🙏"}
    finally:
        conn.close()


def handler(event, context):
    """ИИ-агент Алиса: чат с клиентом для оформления межгороднего такси"""
    method = event.get("httpMethod", "POST")
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    if method != "POST":
        return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "method_not_allowed"})}

    try:
        body = json.loads(event.get("body") or "{}")
    except Exception:
        body = {}

    user_message = (body.get("message") or "").strip()
    session_id = (body.get("session_id") or "").strip() or str(uuid.uuid4())
    utm = body.get("utm") or {}

    headers = event.get("headers") or {}
    user_agent = headers.get("User-Agent") or headers.get("user-agent") or ""
    ip = (event.get("requestContext") or {}).get("identity", {}).get("sourceIp", "")

    if not user_message:
        greet = "Привет! Я Алиса 👋"
        ask = "Откуда едем?"
        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({
                "reply": greet + " " + ask,
                "bubbles": [greet, ask],
                "session_id": session_id,
            }, ensure_ascii=False),
        }

    if len(user_message) > 2000:
        user_message = user_message[:2000]

    result = run_chat(session_id, user_message, utm, user_agent, ip)
    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps(result, ensure_ascii=False),
    }