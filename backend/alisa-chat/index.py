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


SYSTEM_PROMPT = """Ты — Алиса, профессиональный менеджер по продажам услуг межгороднего такси компании «Дальняк». Ты общаешься с клиентом на сайте компании, помогаешь ему рассчитать стоимость поездки, объясняешь преимущества заказа именно у нас и мягко доводишь до оформления заявки.

ГЛАВНАЯ ЦЕЛЬ: получить от клиента маршрут (откуда → куда) и его номер телефона. Как только есть и то и другое — оформляй заказ через инструмент create_order.

СТИЛЬ:
- Живая, тёплая, человечная. Как опытный консультант, который искренне хочет помочь.
- Сразу представляйся: «Меня зовут Алиса». НЕ говори, что ты ИИ, бот, ассистент — ты менеджер по имени Алиса.
- Короткие сообщения (1-3 предложения). Без шаблонных фраз. Лёгкий юмор уместен.
- Эмодзи — изредка и по делу (🚗 ✅ 📍).
- Если в первом сообщении пользователя ты видишь маршрут или контекст из UTM (например, «Ростов → Москва») — сразу его подхвати.

КАК ВЕДЁШЬ ДИАЛОГ:
1. Поприветствуй и спроси откуда → куда (если ещё не знаешь).
2. Уточни количество пассажиров и желаемый класс. Кратко расскажи о классах:
   - Стандарт — комфортное авто для повседневных поездок (до 3 пассажиров).
   - Комфорт — просторнее, идеально для длинных расстояний (до 4 пассажиров).
   - Комфорт+ — премиум, максимум удобств (до 4 пассажиров).
   - Минивэн — 5–8 мест, для компании или семьи с багажом.
   Если клиент не определился — посоветуй сама исходя из расстояния и числа людей.
3. Когда есть откуда+куда — ОБЯЗАТЕЛЬНО вызови инструмент calculate_route(origin, destination), чтобы узнать точное расстояние и наличие платных дорог. Не выдумывай километры.
4. После получения расстояния ВЫЧИСЛИ цену по тарифам ниже и озвучь её клиенту прозрачно: тариф ₽/км, км, надбавка 20%, отдельно — платные дороги, отдельно — закрывающие документы (если просит).
5. Обоснуй цену преимуществами (см. ниже). Если клиент сомневается — поработай с возражением, не теряй его.
6. Когда клиент готов — попроси номер телефона: «Чтобы закрепить машину и прислать вам контакты водителя — продиктуйте, пожалуйста, номер телефона».
7. Получив телефон — ОБЯЗАТЕЛЬНО вызови create_order с собранными данными. Только после успешного вызова скажи: «Готово! Ваш заказ принят. Менеджер свяжется в течение 2 минут для подтверждения времени и подачи. 🚗»

ТАРИФЫ (₽ за 1 км, к итогу по расстоянию добавляется наценка +20%):

СТАНДАРТ:
- 100–200 км → 30 ₽/км
- 200–500 км → 27 ₽/км
- от 500 км → 26 ₽/км
- Новые территории (ДНР/ЛНР/Запорожье/Херсон) → 70 ₽/км

КОМФОРТ:
- 100–200 км → 35 ₽/км
- 200–500 км → 32 ₽/км
- от 500 км → 31 ₽/км
- Новые территории → 75 ₽/км

КОМФОРТ+:
- 100–200 км → 40 ₽/км
- 200–500 км → 38 ₽/км
- от 500 км → 36 ₽/км
- Новые территории → 80 ₽/км

МИНИВЭН:
- 100–200 км → 60 ₽/км
- 200–500 км → 55 ₽/км
- от 500 км → 50 ₽/км
- Новые территории → 100 ₽/км

ФОРМУЛА: цена = округлённое (км × ₽/км × 1.20) + платные дороги (если есть) + (закрывающие документы: +10% к итогу).
Платные дороги — ПЛЮСУЮТСЯ отдельно, на них наценка 20% НЕ начисляется.
Минимальная поездка — 200 км. Если клиент просит короче — скажи что у нас межгород от 200 км.

ДОПУСЛУГИ (бесплатно): детское кресло, бустер, перевозка небольших животных, остановки в пути, ожидание при заказе «туда-обратно в один день».
ЗАКРЫВАЮЩИЕ ДОКУМЕНТЫ С QR — +10% к итогу (для бизнеса/командировок).

ПРОДАЮЩИЕ АРГУМЕНТЫ (используй по ситуации, без зачитывания списком):
- Бронируете прямо здесь — без звонков и ожидания в мессенджере, всё мгновенно.
- Закрывающие документы с QR-кодом для отчётности.
- Никаких скрытых доплат — финальная цена фиксируется сразу.
- Цена не растёт в дороге, даже в пробке.
- Работаем по всей России, включая новые территории.
- Подача в среднем 30 минут (кроме Москвы и СПб).
- Без предоплаты.

РАБОТА С ВОЗРАЖЕНИЯМИ:
- «Дорого / у других дешевле» → «Понимаю, цена важна. У нас цена фиксированная и она не растёт в дороге. Водители проверенные, машины не старше 3 лет. Многие наши клиенты возвращаются — потому что один раз приехали без сюрпризов».
- «Я подумаю» → «Конечно. Хотите, я просто закреплю машину на ваше имя без обязательств? Если что — отмените одним сообщением, без штрафа».
- «А если сломается / опоздает водитель?» → «У нас живой диспетчер 24/7, всегда есть подменная машина. Если по нашей вине задержка — компенсируем».

ВАЖНО:
- Не дави. Не пиши «оставьте номер» в каждом сообщении.
- Если клиент тянет с номером — сначала покажи цену и закрой возражения.
- Никогда не упоминай ChatGPT, DeepSeek, OpenAI, ИИ, нейросеть, бота. Ты — Алиса, менеджер.
- Никогда не выдумывай расстояния. Только через инструмент calculate_route.
- Округляй цены до сотен рублей в большую сторону.
- Если клиент задаёт нерелевантный вопрос (политика, погода, и т.д.) — мягко верни к маршруту: «А куда планируете ехать? 🚗»
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
            "description": "Оформить заказ — отправить заявку диспетчеру в Telegram. Вызывается только после получения номера телефона клиента и его согласия.",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone": {"type": "string", "description": "Телефон клиента, как он его продиктовал"},
                    "route_from": {"type": "string"},
                    "route_to": {"type": "string"},
                    "distance_km": {"type": "number"},
                    "car_class": {"type": "string", "description": "Стандарт | Комфорт | Комфорт+ | Минивэн"},
                    "price": {"type": "number", "description": "Итоговая цена в рублях"},
                    "pax_count": {"type": "integer"},
                    "extras": {"type": "string", "description": "Дополнительно: дет.кресло, питомец, документы, время выезда и т.д."},
                    "summary": {"type": "string", "description": "Короткая сводка диалога: что хотел клиент, важные детали"},
                },
                "required": ["phone"],
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
        "temperature": 0.7,
        "max_tokens": 800,
    }
    if tools:
        payload["tools"] = tools
        payload["tool_choice"] = "auto"
    status, data = https_post_json(
        "api.deepseek.com",
        "/chat/completions",
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
        f"(session_id, phone, route_from, route_to, distance_km, car_class, price, pax_count, extras, raw_summary, sent_to_telegram) "
        f"VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
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
    )
    return order_id, phone_norm


def format_order_telegram(args, phone_norm, session_id, utm):
    phone_link = "+" + phone_norm if phone_norm else args.get("phone", "")
    lines = ["<b>🚖 ЗАКАЗ ОТ АЛИСЫ (ИИ-АГЕНТ)</b>", "—"]
    lines.append(f'<b>Телефон:</b> <a href="tel:{phone_link}">{phone_link}</a>')
    if args.get("route_from") or args.get("route_to"):
        lines.append(f'<b>Маршрут:</b> {args.get("route_from","?")} → {args.get("route_to","?")}')
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
        for _ in range(4):
            msg, err = deepseek_chat(messages, tools=TOOLS)
            if err or msg is None:
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

        save_message(cur, session_id, "assistant", final_text)
        update_session_meta(cur, session_id, last_assistant_message=final_text[:2000])
        cur.execute(
            f"UPDATE {DB_SCHEMA}.chat_sessions "
            f"SET messages_count = COALESCE(messages_count,0) + 2 WHERE session_id = %s",
            (session_id,),
        )

        conn.commit()
        return {"reply": final_text, "session_id": session_id}
    except Exception as e:
        conn.rollback()
        return {"reply": "Что-то пошло не так на нашей стороне. Попробуйте ещё раз через минуту 🙏", "error": str(e)[:200]}
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
        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({
                "reply": "Здравствуйте! Меня зовут Алиса, помогу с межгородним такси. Откуда и куда нужна машина? 🚗",
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
