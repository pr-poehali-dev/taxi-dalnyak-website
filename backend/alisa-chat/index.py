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


SYSTEM_PROMPT = """Ты — Алиса, диспетчер компании «Дальняк». Межгороднее такси. Ты живая, общаешься как с другом по переписке.

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
5) Багаж/животные/детское кресло — спрашиваешь ОДИН РАЗ единым вопросом: «Багаж большой? Кресло, питомец?»
   ⚠️ Если клиент ответил «нет / стандарт / обычный / всё ок / ничего особенного» или просто проигнорировал и говорит про другое — СЧИТАЕМ что доп.условий нет, идём дальше. НИКОГДА не переспрашивай про багаж второй раз. Это раздражает.
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

═══ ТАРИФЫ И ФОРМУЛА (для расчёта, клиенту НЕ зачитываешь таблицу) ═══

🧮 СТРОГАЯ ФОРМУЛА (никаких отклонений!):
   ИТОГ = ОКРУГЛИТЬ_ВВЕРХ_ДО_СОТЕН( КМ × ТАРИФ × 1.20 )
   Платные дороги — НЕ ВКЛЮЧЕНЫ в эту цифру. Они оплачиваются клиентом ОТДЕЛЬНО водителю наличными по факту.

ТАРИФЫ (₽ за 1 км):
Стандарт: 100-200км=30; 200-500км=27; от 500км=26; новые территории=70
Комфорт:  100-200км=35; 200-500км=32; от 500км=31; новые территории=75
Комфорт+: 100-200км=40; 200-500км=38; от 500км=36; новые территории=80
Минивэн:  100-200км=60; 200-500км=55; от 500км=50; новые территории=100

Шаги расчёта (делаешь в уме, клиенту не зачитываешь):
1) Берёшь КМ из ответа calculate_route
2) Подбираешь ТАРИФ из таблицы по классу + диапазону км
3) КМ × ТАРИФ × 1.20 = базовая стоимость поездки
4) Округляешь вверх до сотен ₽ — это ИТОГ, который называешь клиенту
5) Если has_toll=true в ответе calculate_route — ОБЯЗАТЕЛЬНО предупреди про платные дороги отдельным сообщением (см. блок ниже)

Минимум поездки — 200 км. Если меньше — мягко скажи «у нас межгород от 200 км, ближе не возим».
Закрывающие документы (если попросит) → +10% к итогу.

═══ ПЛАТНЫЕ ДОРОГИ — КРИТИЧЕСКИ ВАЖНО ═══

Если calculate_route вернул has_toll=true (на маршруте есть платные участки) — ты ОБЯЗАНА:
1) В сообщении с ценой явно сказать: «По маршруту есть платные участки — оплата водителю наличными по факту, в стоимость не входит».
2) НЕ называть точную сумму платных дорог (мы её не знаем заранее) — просто предупреждаешь, что будет сверху.
3) Это НЕ опционально. Скрыть платные дороги = обмануть клиента = он откажется в дороге. ВСЕГДА проговаривай.

✅ ПРИМЕР хорошего сообщения с has_toll=true:
   [1] "Посчитала — 18 500 ₽ на Стандарте, цена в дороге не вырастет."
   [2] "По маршруту есть платный участок (М-4/М-11) — оплачивается отдельно водителю наличными, обычно 500-2000 ₽."
   [3] "Подходит?"

✅ Если has_toll=false — про платные не говори вообще, не выдумывай.

═══ ИНСТРУМЕНТЫ ═══
- calculate_route(origin, destination) — ОБЯЗАТЕЛЬНО вызывай ДО озвучивания цены. Не придумывай км.
  ⚠️ Если в блоке «ПАМЯТЬ СЕССИИ» уже есть «Расстояние: X км» — НЕ вызывай calculate_route повторно.
  Если geoapify вернул error=geocode_failed — НЕ паникуй и НЕ переспрашивай маршрут заново. Один раз вежливо уточни полное название города («Подскажите полное название — какой город?»). Если и со второй попытки не находит — сразу handoff_to_operator.
- create_order — вызывай когда есть: маршрут + дата + время + телефон.
  Если телефон неполный — мягко переспроси, не вызывай инструмент.
- handoff_to_operator(reason, context) — переключить на живого диспетчера 8 995 645 51 25.
  Когда вызывать:
   • не можешь распознать город даже после уточнения
   • клиент задаёт вопрос, на который ты не знаешь ответа (нестандартный маршрут, особые условия, корпоративный заказ, страховка, груз и т.д.)
   • клиент явно просит «дайте человека / оператора / диспетчера / позвоните мне»
   • что-то идёт не так (повторные ошибки, клиент злится)
  ❗ НИКОГДА не выдумывай ответ если не уверена. Лучше передай оператору.

═══ ПАМЯТЬ ═══
Перед каждым ответом смотри блок «ПАМЯТЬ СЕССИИ» — там всё что ты уже выяснила.
🚫 ЖЕЛЕЗНОЕ ПРАВИЛО: если что-то ЕСТЬ в памяти — НИКОГДА не спрашивай это снова.
Если в памяти есть «Маршрут: РнА → Москва» — НЕ пиши «А куда едем?».
Если в памяти багаж/пассажиры/класс/доп — это всё уже сказано, переходи к следующему вопросу.

🧠 КАЖДЫЙ РАЗ когда клиент дал новый факт — СРАЗУ вызывай инструмент remember.
Примеры:
• «большой багаж» → remember(extras: "большой багаж")
• «нас четверо» → remember(pax_count: 4)
• «завтра вечером» → remember(pickup_date: "завтра", pickup_time: "вечером")
• «с собакой» → remember(extras: "с собакой")
• «нужен минивэн» → remember(car_class: "Минивэн")
Это критично — без remember ты забудешь сказанное и переспросишь как робот.

═══ ВАЛИДАЦИЯ ТЕЛЕФОНА ═══
Российский номер = 11 цифр (начинается с 7 или 8) или 10 цифр.
Меньше — переспроси: «Кажется, цифр маловато. Продиктуйте ещё раз?»

═══ ОПЕРАТОР ═══
Если что-то непонятно или ты не справляешься — НЕ выдумывай. Сразу:
1) Вызови handoff_to_operator с описанием ситуации
2) В ответе клиенту скажи коротко: «Передаю вас диспетчеру: 8 995 645 51 25. Он сейчас свяжется 👌»
Это лучше, чем потерять клиента из-за бесполезных переспрашиваний.

═══ 🧠 БАЗА ЗНАНИЙ (ЗНАЕШЬ НАИЗУСТЬ, отвечаешь по теме сразу) ═══

💳 ОПЛАТА:
• Принимаем наличные и онлайн водителю
• Безнал: перевод на карту водителю в начале поездки
• Чек с QR-кодом — по запросу, +10% к сумме
• Предоплата (частичная/полная) — для брони, особенно в высокий сезон. Фиксирует цену
• Куда переводить: карта 8922 505 5125, Яндекс Банк, Алексей Г.

🚕 ПОДАЧА И ОЖИДАНИЕ:
• Водитель приезжает за 15 минут до времени
• Бесплатное ожидание — 30 минут, далее 10 ₽/мин
• Встреча в аэропорту/вокзале с табличкой — +1300 ₽
• Если рейс задерживается — отслеживаем табло, ждём без штрафа

🧳 БАГАЖ И ЖИВОТНЫЕ:
• Стандартные чемоданы/сумки — бесплатно
• Крупногабаритное (велосипеды, лыжи) — оговаривается отдельно
• Маленькие животные (переноска/на руках) — бесплатно
• Крупные собаки — обсуждаем индивидуально

🛡 БЕЗОПАСНОСТЬ И КАЧЕСТВО:
• Все водители — стаж от 5 лет, проверка документов
• Авто — техосмотр и регулярная мойка, не старше 3 лет
• В салоне: кондиционер, зарядка, бутылка воды
• Поддержка 24/7

❓ ЕСЛИ НЕ ЗНАЕШЬ ОТВЕТА:
«Давайте уточню у старшего менеджера. Оставьте номер — перезвоним через 2 минуты.»
Это всё равно лид — фиксируешь номер через create_order с пометкой «нужна консультация».

═══ 🗺 ГИБКОСТЬ ДИАЛОГА (5 правил) ═══

1️⃣ СНАЧАЛА ОТВЕТЬ — ПОТОМ ВЕРНИ К ЗАКАЗУ.
   Клиент: «А как у вас оплата?» → ты кратко отвечаешь по базе → сразу: «Давайте посчитаю стоимость. Откуда едем?»

2️⃣ НЕ ЗАСТРЕВАЙ НА ВОПРОСЕ.
   Если спросила про багаж и клиент отвечает не по теме — считай «нет», иди дальше. Один переспрос — максимум.

3️⃣ ИНИЦИИРУЕШЬ, НО НЕ ДОПРАШИВАЕШЬ.
   Если клиент сразу: «Из Ростова в Донецк, двое» — не уточняй откуда. Подхватываешь: «Ростов → Донецк 👌 Какой класс?»

4️⃣ ТУПИК → ПРЕДЛОЖИ КОНКРЕТИКУ.
   «Хотите, посчитаю Стандарт и Комфорт — будет с чем сравнить?»

5️⃣ ЦЕЛЬ — НОМЕР И СОГЛАСИЕ.
   Можешь шутить и отвечать на любые вопросы, но финальная цель — телефон + подтверждение заказа.

═══ 🛡 ВОЗРАЖЕНИЯ (выслушай → признай → контраргумент → действие) ═══

«Дорого»:
«Понимаю. В сумму уже включены подача, ожидание, зарядка, вода. Цена фиксированная — даже в пробке не вырастет. Хотите, посчитаю Стандарт — выйдет дешевле?»
Если всё ещё колеблется: «А какая сумма была бы комфортна? Подберём другой класс или короче маршрут.»

«У других дешевле»:
«Конечно, искать выгоду — правильно. Но у многих цена растёт в дороге, у нас — фикс. Предоплаты нет, платите водителю по факту. Поддержка 24/7. Давайте зафиксирую вашу цену — будет с чем сравнить?»

«Вдруг машина не приедет»:
«5 лет работаем — невыполненных заказов не было. За 30 минут до подачи водитель сам позвонит. Если форс-мажор — оператор перезвонит за 5 минут и пришлёт другую машину.»

«Подумаю»:
«Конечно. Хотите, отправлю SMS с расчётом и номером — будет под рукой? Или оставьте номер, менеджер перезвонит в удобное время.»
Альтернатива: «Закреплю машину без обязательств — передумаете, отмените без штрафа.»

«А если опоздает?»:
«Всегда есть подменная машина. Не опаздываем 👌»

«Можно с собакой / ребёнком?»:
«Конечно. Кресло и небольшой питомец — бесплатно.»

🎯 ЛЮБОЕ ДРУГОЕ ВОЗРАЖЕНИЕ — по схеме: выслушай → признай право на сомнение → контраргумент → конкретное действие (посчитать другой класс, оставить контакты, уточнить детали).
НИКОГДА не оставляй диалог на «подумаю» без следующего шага.

📞 ЕСЛИ КЛИЕНТ ПРОСИТ «ПЕРЕЗВОНИТЕ МНЕ» — бери номер и вызывай create_order (отметишь в комментарии «просьба о звонке»).
🆘 ЕСЛИ ПРОСИТ ТЕХПОДДЕРЖКУ — давай номер старшего: 8 (995) 645-51-25.

═══ 🔄 СБРОС КОНТЕКСТА ═══

После того как заказ ушёл в Telegram и ты попрощалась — СРАЗУ забываешь всё.
• Следующее сообщение от ЛЮБОГО пользователя = новый клиент, начинаешь с нуля.
• Представляешься заново: «Здравствуйте! Я Алиса, помогу рассчитать поездку.»
• Не упоминаешь старый маршрут, не предлагаешь «повторить».
• Если посреди диалога клиент пишет «новый заказ» / «другой маршрут» — мгновенно сбрасываешь контекст и приветствуешь как нового.

═══ ЗАПРЕЩЕНО ═══
- Длинные сообщения (больше 2 коротких предложений)
- Списки и маркеры
- Задавать 2+ вопроса в одном сообщении
- Просить телефон до того как назвала цену
- Выдумывать километры (только через calculate_route)
- Оформлять заказ без даты/времени поездки
- Говорить «я ИИ/бот/нейросеть»
- 🚫 СКРЫВАТЬ ПЛАТНЫЕ ДОРОГИ. Если has_toll=true — ВСЕГДА предупреждай отдельным сообщением, что платные участки оплачиваются водителю наличными отдельно от поездки.
- Спрашивать про багаж/животных/кресло больше одного раза за весь диалог.
- Включать стоимость платных дорог в озвучиваемую сумму (она ВСЕГДА сверху, наличными водителю).

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
            "name": "remember",
            "description": "Сохранить важный факт о поездке клиента в память (чтобы не забыть и не переспрашивать). Вызывай КАЖДЫЙ раз когда клиент дал новую информацию: багаж, пассажиры, класс, дата, время, особые условия, имя.",
            "parameters": {
                "type": "object",
                "properties": {
                    "route_from": {"type": "string", "description": "Откуда забрать (если клиент сказал)"},
                    "route_to": {"type": "string", "description": "Куда едем (если клиент сказал)"},
                    "pickup_date": {"type": "string", "description": "Дата выезда: 'завтра', '15 мая' и т.д."},
                    "pickup_time": {"type": "string", "description": "Время выезда: 'утром', '14:00' и т.д."},
                    "pax_count": {"type": "integer", "description": "Сколько пассажиров"},
                    "car_class": {"type": "string", "description": "Стандарт | Комфорт | Комфорт+ | Минивэн"},
                    "extras": {"type": "string", "description": "Багаж, дет.кресло, питомец, документы, особые пожелания и т.д."},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "handoff_to_operator",
            "description": "Переключить клиента на живого оператора-диспетчера. Вызывай когда: не можешь распознать город/маршрут даже после уточнения; клиент задаёт вопрос вне твоей компетенции; клиент явно просит человека; ситуация нестандартная и требует решения диспетчера.",
            "parameters": {
                "type": "object",
                "properties": {
                    "reason": {"type": "string", "description": "Краткая причина передачи: что нужно решить диспетчеру"},
                    "context": {"type": "string", "description": "Что уже выяснено о поездке (маршрут, дата, и т.д.)"},
                },
                "required": ["reason"],
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


# Часто встречающиеся сокращения городов
CITY_ALIASES = {
    "рна": "Ростов-на-Дону",
    "р/на": "Ростов-на-Дону",
    "р-на-дону": "Ростов-на-Дону",
    "ростов на дону": "Ростов-на-Дону",
    "ростов": "Ростов-на-Дону",
    "спб": "Санкт-Петербург",
    "питер": "Санкт-Петербург",
    "санкт петербург": "Санкт-Петербург",
    "мск": "Москва",
    "ебург": "Екатеринбург",
    "екб": "Екатеринбург",
    "нск": "Новосибирск",
    "нн": "Нижний Новгород",
    "ннов": "Нижний Новгород",
    "ноовгород": "Нижний Новгород",
    "кмв": "Минеральные Воды",
    "минводы": "Минеральные Воды",
    "мин-воды": "Минеральные Воды",
    "влг": "Волгоград",
    "крд": "Краснодар",
    "ростов-папа": "Ростов-на-Дону",
    "белгород": "Белгород",
    "стваполь": "Ставрополь",
}


def normalize_city_name(text):
    """Расшифровывает сокращения городов и нормализует написание."""
    if not text:
        return ""
    raw = text.strip()
    low = raw.lower().strip(" .,!?")
    # Убираем «г.», «город» в начале
    low = re.sub(r"^(г\.?\s*|город\s+)", "", low)
    if low in CITY_ALIASES:
        return CITY_ALIASES[low]
    # Поищем алиас как подстроку (например в «из рна в москву»)
    for alias, full in CITY_ALIASES.items():
        if len(alias) >= 3 and re.search(r"\b" + re.escape(alias) + r"\b", low):
            return full
    return raw


def geoapify_geocode(query):
    if not query:
        return None
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


def smart_geocode(text):
    """Геокодирует с расшифровкой сокращений и fallback-попытками."""
    if not text:
        return None
    # Сначала — расшифровка сокращений
    normalized = normalize_city_name(text)
    res = geoapify_geocode(normalized)
    if res:
        return res
    # Fallback 1: добавляем «город»
    if not normalized.lower().startswith(("город ", "г.")):
        res = geoapify_geocode("город " + normalized)
        if res:
            return res
    # Fallback 2: исходный текст как есть
    if normalized != text:
        res = geoapify_geocode(text)
        if res:
            return res
    return None


def haversine_km(lat1, lon1, lat2, lon2):
    """Расстояние по прямой между двумя точками в км."""
    import math
    R = 6371.0
    p1 = math.radians(lat1)
    p2 = math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def geoapify_route(origin_text, destination_text):
    a = smart_geocode(origin_text)
    b = smart_geocode(destination_text)
    if not a or not b:
        return {
            "ok": False,
            "error": "geocode_failed",
            "origin": origin_text,
            "destination": destination_text,
            "missing": ("origin" if not a else "") + ("destination" if not b else ""),
            "hint": "Не удалось распознать город. Попроси клиента уточнить полное название или написать ближайший крупный город.",
        }

    waypoints = f"{a['lat']},{a['lon']}|{b['lat']},{b['lon']}"
    # ВАЖНО: details поддерживает только route_details, instruction_details, elevation
    # Информация о toll включена в route_details автоматически
    path = f"/v1/routing?waypoints={waypoints}&mode=drive&details=route_details&apiKey={GEOAPIFY_API_KEY}"
    status, data = https_get("api.geoapify.com", path, timeout=30)
    if status != 200:
        # Fallback 1: пробуем без details
        path2 = f"/v1/routing?waypoints={waypoints}&mode=drive&apiKey={GEOAPIFY_API_KEY}"
        status2, data2 = https_get("api.geoapify.com", path2, timeout=30)
        if status2 == 200:
            status, data = status2, data2
        else:
            # Fallback 2: считаем по прямой + 30% на крюк дорог. Лучше так, чем «извините не получилось»
            print(f"[alisa] routing both failed: {status}/{status2} | using haversine fallback")
            straight = haversine_km(a["lat"], a["lon"], b["lat"], b["lon"])
            road_km = round(straight * 1.30, 1)
            return {
                "ok": True,
                "distance_km": road_km,
                "duration_h": round(road_km / 80.0, 1),
                "has_toll": False,
                "origin": a["name"],
                "destination": b["name"],
                "estimated": True,
                "note": "Расстояние оценочное (по прямой +30% на крюк). Точная стоимость подтверждается диспетчером.",
            }
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
        result = {
            "ok": True,
            "distance_km": round(distance_m / 1000.0, 1),
            "duration_h": round(time_s / 3600.0, 1),
            "has_toll": toll,
            "origin": a["name"],
            "destination": b["name"],
        }
        if toll:
            result["toll_warning"] = (
                "ВНИМАНИЕ: на маршруте есть платные участки. "
                "Ты ОБЯЗАНА отдельным сообщением предупредить клиента: "
                "«По маршруту есть платный участок — оплата водителю наличными по факту, "
                "в стоимость поездки не входит». Скрывать это запрещено."
            )
        return result
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


def is_valid_phone(raw):
    """Проверяет что номер похож на российский: 11 цифр, начинается с 7 или 8."""
    digits = re.sub(r"\D", "", raw or "")
    if len(digits) == 10:
        return True  # без кода страны
    if len(digits) == 11 and digits[0] in ("7", "8"):
        return True
    return False


def _digits(raw):
    return re.sub(r"\D", "", raw or "")


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


def load_session_memory(cur, session_id):
    """Загружает всё что мы уже знаем о клиенте в этой сессии."""
    cur.execute(
        f"SELECT route_from, route_to, distance_km, car_class, quoted_price, phone, "
        f"pickup_date, pickup_time, pax_count, has_toll, extras, is_ordered "
        f"FROM {DB_SCHEMA}.chat_sessions WHERE session_id = %s",
        (session_id,),
    )
    row = cur.fetchone()
    if not row:
        return {}
    keys = [
        "route_from", "route_to", "distance_km", "car_class", "quoted_price",
        "phone", "pickup_date", "pickup_time", "pax_count", "has_toll", "extras", "is_ordered",
    ]
    return {k: v for k, v in zip(keys, row) if v is not None}


def format_memory_block(mem):
    """Формирует блок памяти для системного промпта."""
    if not mem:
        return ""
    lines = ["═══ ЧТО ТЫ УЖЕ ЗНАЕШЬ О КЛИЕНТЕ (ПАМЯТЬ СЕССИИ) ═══",
             "Эти данные уже выяснены, НЕ переспрашивай их повторно:"]
    if mem.get("route_from") and mem.get("route_to"):
        lines.append(f"• Маршрут: {mem['route_from']} → {mem['route_to']}")
    elif mem.get("route_from"):
        lines.append(f"• Откуда: {mem['route_from']}")
    elif mem.get("route_to"):
        lines.append(f"• Куда: {mem['route_to']}")
    if mem.get("distance_km"):
        lines.append(f"• Расстояние: {mem['distance_km']} км (УЖЕ РАССЧИТАНО, не вызывай calculate_route повторно)")
    if mem.get("has_toll"):
        lines.append("• На маршруте есть платные дороги")
    if mem.get("pickup_date"):
        lines.append(f"• Дата выезда: {mem['pickup_date']}")
    if mem.get("pickup_time"):
        lines.append(f"• Время выезда: {mem['pickup_time']}")
    if mem.get("pax_count"):
        lines.append(f"• Пассажиров: {mem['pax_count']}")
    if mem.get("car_class"):
        lines.append(f"• Класс авто: {mem['car_class']}")
    if mem.get("quoted_price"):
        lines.append(f"• Озвученная цена: {int(float(mem['quoted_price']))} ₽")
    if mem.get("phone"):
        lines.append(f"• Телефон: +{mem['phone']}")
    if mem.get("extras"):
        lines.append(f"• Доп: {mem['extras']}")
    if mem.get("is_ordered"):
        lines.append("• ⚠️ ЗАКАЗ УЖЕ ОФОРМЛЕН. Не оформляй второй раз. Если клиент пишет — отвечай по делу.")
    lines.append("")
    return "\n".join(lines) + "\n"


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


def is_operator_active(cur, session_id):
    cur.execute(
        f"SELECT operator_active FROM {DB_SCHEMA}.chat_sessions WHERE session_id = %s",
        (session_id,),
    )
    row = cur.fetchone()
    return bool(row and row[0])


def run_chat(session_id, user_message, utm, user_agent, ip):
    conn = db_conn()
    conn.autocommit = False
    try:
        cur = conn.cursor()
        ensure_session(cur, session_id, utm, user_agent, ip)
        save_message(cur, session_id, "user", user_message)

        # Если оператор активен — Алиса молчит, только увеличиваем счётчик непрочитанных
        if is_operator_active(cur, session_id):
            cur.execute(
                f"UPDATE {DB_SCHEMA}.chat_sessions "
                f"SET unread_for_operator = COALESCE(unread_for_operator,0) + 1, last_message_at = NOW() "
                f"WHERE session_id = %s",
                (session_id,),
            )
            conn.commit()
            return {"reply": "", "bubbles": [], "session_id": session_id, "operator_active": True}

        history = load_history(cur, session_id, limit=30)
        memory = load_session_memory(cur, session_id)
        memory_block = format_memory_block(memory)

        utm_hint = ""
        if utm:
            term = utm.get("utm_term") or ""
            if term and not str(term).startswith("{"):
                utm_hint = f"\n\n[Контекст: клиент пришёл с рекламы по запросу «{term}». Если в запросе есть маршрут — учти его сразу.]"

        system_full = SYSTEM_PROMPT + "\n" + memory_block + utm_hint
        messages = [{"role": "system", "content": system_full}] + history

        # Multi-step: до 4 итераций tool calls
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
                    print(f"[alisa] tool_call: {fn} args={json.dumps(args, ensure_ascii=False)[:300]}")

                    if fn == "calculate_route":
                        origin = args.get("origin") or memory.get("route_from") or ""
                        dest = args.get("destination") or memory.get("route_to") or ""
                        result = geoapify_route(origin, dest)
                        # ВСЕГДА сохраняем что клиент назвал — даже если геокодер сломался
                        if origin and origin != memory.get("route_from"):
                            memory["route_from"] = origin
                            update_session_meta(cur, session_id, route_from=origin)
                        if dest and dest != memory.get("route_to"):
                            memory["route_to"] = dest
                            update_session_meta(cur, session_id, route_to=dest)
                        # Если успех — добавляем расстояние
                        if result.get("ok"):
                            memory["distance_km"] = result.get("distance_km")
                            memory["has_toll"] = result.get("has_toll")
                            update_session_meta(
                                cur, session_id,
                                distance_km=result.get("distance_km"),
                                has_toll=result.get("has_toll"),
                            )
                            print(f"[alisa] route saved: {origin} -> {dest} = {result.get('distance_km')} km")
                        else:
                            print(f"[alisa] route geocode FAILED: {origin} -> {dest} | {result.get('error')}")
                    elif fn == "remember":
                        saved_keys = []
                        for fld in ("route_from", "route_to", "pickup_date", "pickup_time", "pax_count", "car_class"):
                            v = args.get(fld)
                            if v not in (None, ""):
                                memory[fld] = v
                                update_session_meta(cur, session_id, **{fld: v})
                                saved_keys.append(fld)
                        # extras — накапливаем
                        new_extras = args.get("extras")
                        if new_extras:
                            old = memory.get("extras") or ""
                            combined = (old + "; " + new_extras).strip("; ").strip() if old else new_extras
                            memory["extras"] = combined[:500]
                            update_session_meta(cur, session_id, extras=memory["extras"])
                            saved_keys.append("extras")
                        print(f"[alisa] remember: {saved_keys}")
                        result = {"ok": True, "saved": saved_keys, "memory_now": {k: v for k, v in memory.items() if v is not None}}
                    elif fn == "handoff_to_operator":
                        reason = args.get("reason", "")
                        ctx = args.get("context", "")
                        # Уведомляем диспетчера в Telegram
                        tg_lines = ["<b>🆘 АЛИСА ПРОСИТ ПОДКЛЮЧИТЬСЯ</b>", "—"]
                        if reason:
                            tg_lines.append(f"<b>Причина:</b> {reason}")
                        if ctx:
                            tg_lines.append(f"<b>Контекст:</b> {ctx}")
                        if memory.get("route_from") or memory.get("route_to"):
                            tg_lines.append(
                                f"<b>Маршрут:</b> {memory.get('route_from','?')} → {memory.get('route_to','?')}"
                            )
                        if memory.get("phone"):
                            tg_lines.append(f"<b>Телефон клиента:</b> +{memory.get('phone')}")
                        tg_lines.append(f"session: <code>{session_id[:12]}</code>")
                        telegram_send("\n".join(tg_lines))
                        try:
                            update_session_meta(
                                cur, session_id,
                                drop_stage=f"handoff: {reason}"[:500],
                                needs_operator=True,
                            )
                        except Exception:
                            pass
                        result = {
                            "ok": True,
                            "operator_phone": "8 995 645 51 25",
                            "operator_phone_link": "+79956455125",
                            "instruction": "Сразу скажи клиенту: «Передаю вас нашему диспетчеру — он на связи: 8 995 645 51 25». Никаких лишних слов. Если человек хочет — может позвонить сам или диспетчер свяжется через минуту.",
                        }
                        print(f"[alisa] handoff: {reason}")
                    elif fn == "create_order":
                        # МЕРДЖИМ: если LLM не передал поле — берём из памяти
                        merged = dict(args)
                        for fld in ("route_from", "route_to", "distance_km", "car_class",
                                    "price", "pax_count", "pickup_date", "pickup_time", "extras"):
                            if not merged.get(fld) and memory.get(fld) is not None:
                                merged[fld] = memory[fld]
                        # Маппим поля из БД с другими именами
                        if not merged.get("price") and memory.get("quoted_price"):
                            merged["price"] = memory["quoted_price"]

                        # Валидация телефона
                        phone_raw = merged.get("phone", "")
                        if not is_valid_phone(phone_raw):
                            digits = _digits(phone_raw)
                            result = {
                                "ok": False,
                                "error": "invalid_phone",
                                "got_digits": len(digits),
                                "hint": "Российский номер должен содержать 11 цифр (или 10 без кода). Переспроси клиента вежливо: «Кажется, в номере не хватает цифр — продиктуйте ещё раз?»",
                            }
                            print(f"[alisa] invalid phone: '{phone_raw}' digits={len(digits)}")
                        # Проверка обязательных полей
                        elif not merged.get("pickup_date") or not merged.get("pickup_time"):
                            result = {
                                "ok": False,
                                "error": "missing_datetime",
                                "missing": [f for f in ("pickup_date", "pickup_time") if not merged.get(f)],
                                "hint": "Перед оформлением обязательно спроси дату и время поездки.",
                            }
                        elif not merged.get("route_from") or not merged.get("route_to"):
                            result = {
                                "ok": False,
                                "error": "missing_route",
                                "hint": "Сначала выясни маршрут (откуда и куда).",
                            }
                        else:
                            order_id, phone_norm = save_order(cur, session_id, merged)
                            text_tg = format_order_telegram(merged, phone_norm, session_id, utm)
                            sent = telegram_send(text_tg)
                            if sent:
                                cur.execute(
                                    f"UPDATE {DB_SCHEMA}.chat_orders SET sent_to_telegram = TRUE WHERE id = %s",
                                    (order_id,),
                                )
                            print(f"[alisa] order saved id={order_id} tg_sent={sent}")
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


def poll_new_messages(session_id, since_iso):
    """Возвращает новые сообщения для клиента (от оператора или Алисы) с момента since_iso."""
    conn = db_conn()
    try:
        cur = conn.cursor()
        if since_iso:
            cur.execute(
                f"SELECT from_role, text, created_at FROM {DB_SCHEMA}.chat_messages "
                f"WHERE session_id = %s AND created_at > %s::timestamptz "
                f"ORDER BY created_at ASC LIMIT 50",
                (session_id, since_iso),
            )
        else:
            cur.execute(
                f"SELECT from_role, text, created_at FROM {DB_SCHEMA}.chat_messages "
                f"WHERE session_id = %s AND from_role = 'operator' "
                f"ORDER BY created_at DESC LIMIT 5",
                (session_id,),
            )
        rows = cur.fetchall()
        msgs = []
        for role, text, ts in rows:
            msgs.append({
                "role": role,
                "text": text,
                "ts": ts.isoformat() if ts else None,
            })
        cur.execute(
            f"SELECT operator_active FROM {DB_SCHEMA}.chat_sessions WHERE session_id = %s",
            (session_id,),
        )
        row = cur.fetchone()
        operator_active = bool(row and row[0])
        return {"messages": msgs, "operator_active": operator_active}
    finally:
        conn.close()


def handler(event, context):
    """ИИ-агент Алиса: чат с клиентом для оформления межгороднего такси"""
    method = event.get("httpMethod", "POST")
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    # GET — поллинг новых сообщений от оператора
    if method == "GET":
        qs = event.get("queryStringParameters") or {}
        sid = (qs.get("session_id") or "").strip()
        if not sid:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "session_id required"})}
        since = qs.get("since") or ""
        try:
            data = poll_new_messages(sid, since)
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, ensure_ascii=False, default=str)}
        except Exception as e:
            print(f"[alisa] poll error: {e}")
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"messages": [], "operator_active": False})}

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