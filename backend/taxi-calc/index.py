import json
import urllib.request
import urllib.parse

YANDEX_API_KEY = "71c57f36-0b99-44b3-b543-01ccfbc3bfdb"
YANDEX_SUGGEST_KEY = "71c57f36-0b99-44b3-b543-01ccfbc3bfdb"
BOT_TOKEN = "8294092024:AAG29J99kYrTw5iCYy-f7afgO7T1iubyPSs"
CHAT_ID = "-4725554768"

KPP_NAMES = [
    "изварино", "авило-успенка", "авилоуспенка", "авило успенка",
    "донецк", "луганск", "мариуполь", "бердянск", "мелитополь",
    "херсон", "запорожье", "новоазовск", "успенка", "матвеев курган",
    "куйбышево", "гуково", "должанский", "красная таловка",
    "северный", "новошахтинск",
]

NEW_TERR_CITIES = [
    "донецк", "луганск", "мариуполь", "бердянск", "мелитополь",
    "херсон", "запорожье", "горловка", "макеевка", "краматорск",
    "славянск", "северодонецк", "лисичанск", "волноваха",
    "токмак", "энергодар", "геническ", "каховка", "новая каховка",
    "алчевск", "стаханов", "антрацит", "свердловск", "ровеньки",
    "красный луч", "первомайск", "попасная", "рубежное",
    "счастье", "кременная",
    "днр", "лнр", "дпр", "лпр",
    "новые территории", "новая территория",
]

TARIFFS = {
    "standard": {
        "name": "Стандарт",
        "car": "Hyundai Solaris",
        "min_price": 3000,
        "price_under_250": 35,
        "price_over_250": 31,
        "new_terr_price": 80,
    },
    "comfort": {
        "name": "Комфорт+",
        "car": "Toyota Camry 70",
        "min_price": 5000,
        "price_under_250": 50,
        "price_over_250": 42,
        "new_terr_price": 100,
    },
    "minivan": {
        "name": "Минивэн",
        "car": "Hyundai Starex",
        "min_price": 5000,
        "price_under_250": 60,
        "price_over_250": 55,
        "new_terr_price": 100,
    },
}

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}


def geocode(address):
    """Геокодирование адреса через Яндекс"""
    url = "https://geocode-maps.yandex.ru/1.x/?" + urllib.parse.urlencode({
        "apikey": YANDEX_API_KEY,
        "geocode": address,
        "format": "json",
        "results": 1,
    })
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=8) as resp:
        data = json.loads(resp.read().decode())
    members = data["response"]["GeoObjectCollection"]["featureMember"]
    if not members:
        return None
    geo = members[0]["GeoObject"]
    pos = geo["Point"]["pos"].split()
    name = geo["metaDataProperty"]["GeocoderMetaData"]["text"]
    return {"lon": float(pos[0]), "lat": float(pos[1]), "name": name}


def get_route_distance(from_coords, to_coords):
    """Расстояние маршрута через Яндекс Router API"""
    url = "https://router.api.maps.yandex.net/v2/route?" + urllib.parse.urlencode({
        "apikey": YANDEX_API_KEY,
        "waypoints": f"{from_coords['lat']},{from_coords['lon']}|{to_coords['lat']},{to_coords['lon']}",
        "mode": "driving",
    })
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode())
    legs = data["response"]["route"]["routeLegs"]
    total_m = sum(leg["status"]["distance"]["value"] for leg in legs)
    total_s = sum(leg["status"]["duration"]["value"] for leg in legs)
    return {"distance_km": round(total_m / 1000), "duration_min": round(total_s / 60)}


def is_new_territory(city_name):
    """Проверяем, является ли город новой территорией"""
    lower = city_name.lower()
    for nt in NEW_TERR_CITIES:
        if nt in lower:
            return True
    return False


def has_kpp_crossing(from_name, to_name):
    """Проверяем, пересекает ли маршрут КПП (одна точка РФ, другая новые территории)"""
    from_nt = is_new_territory(from_name)
    to_nt = is_new_territory(to_name)
    return from_nt != to_nt


def calculate_prices(distance_km, from_name, to_name):
    """Рассчитать цены по всем тарифам"""
    crosses_kpp = has_kpp_crossing(from_name, to_name)
    from_nt = is_new_territory(from_name)
    to_nt = is_new_territory(to_name)

    results = []
    for key, t in TARIFFS.items():
        if from_nt and to_nt:
            price = distance_km * t["new_terr_price"]
        elif crosses_kpp:
            ru_km = int(distance_km * 0.5)
            nt_km = distance_km - ru_km
            if ru_km <= 250:
                ru_price = ru_km * t["price_under_250"]
            else:
                ru_price = 250 * t["price_under_250"] + (ru_km - 250) * t["price_over_250"]
            nt_price = nt_km * t["new_terr_price"]
            price = ru_price + nt_price
        else:
            if distance_km <= 250:
                price = distance_km * t["price_under_250"]
            else:
                price = 250 * t["price_under_250"] + (distance_km - 250) * t["price_over_250"]

        price = max(price, t["min_price"])
        results.append({
            "tariff": key,
            "name": t["name"],
            "car": t["car"],
            "price": price,
            "min_price": t["min_price"],
            "new_territory": crosses_kpp or (from_nt and to_nt),
        })
    return results


def send_telegram(order_data):
    """Отправляем заявку в Telegram бот"""
    prices_text = ""
    for p in order_data.get("prices", []):
        prices_text += f"  • {p['name']} ({p['car']}): {p['price']:,}₽\n"

    nt_tag = ""
    if order_data.get("new_territory"):
        nt_tag = "🔴 НОВЫЕ ТЕРРИТОРИИ\n"

    msg = (
        f"🚕 НОВАЯ ЗАЯВКА\n"
        f"{'─' * 25}\n"
        f"{nt_tag}"
        f"📍 Откуда: {order_data['from']}\n"
        f"📍 Куда: {order_data['to']}\n"
        f"📏 Расстояние: {order_data['distance_km']} км\n"
        f"⏱ Время в пути: ~{order_data['duration_min']} мин\n"
        f"👥 Пассажиров: {order_data['passengers']}\n"
        f"📅 Дата/время: {order_data['date']}\n"
        f"📞 Телефон: {order_data['phone']}\n"
        f"{'─' * 25}\n"
        f"💰 Расчёт:\n{prices_text}"
    )

    utm = order_data.get("utm", "")
    if utm:
        msg += f"{'─' * 25}\n🔗 UTM: {utm}\n"

    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = json.dumps({"chat_id": CHAT_ID, "text": msg, "parse_mode": "HTML"}).encode()
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode())


def suggest_city(query):
    """Подсказки городов через Яндекс Suggest API"""
    url = "https://suggest-maps.yandex.ru/v1/suggest?" + urllib.parse.urlencode({
        "apikey": YANDEX_SUGGEST_KEY,
        "text": query,
        "types": "locality,province",
        "lang": "ru",
        "results": 5,
    })
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=5) as resp:
        data = json.loads(resp.read().decode())
    results = []
    for item in data.get("results", []):
        title = item.get("title", {}).get("text", "")
        subtitle = item.get("subtitle", {}).get("text", "")
        full = f"{title}, {subtitle}" if subtitle else title
        results.append({"title": title, "subtitle": subtitle, "full": full})
    return results


def handler(event, context):
    """Бэкенд для ИИ-ассистента такси: расчёт маршрута, цен и отправка заявки в Telegram"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    if action == "suggest" and method == "GET":
        q = params.get("q", "")
        if len(q) < 2:
            return {"statusCode": 200, "headers": CORS, "body": json.dumps([])}
        try:
            results = suggest_city(q)
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(results)}
        except Exception:
            return {"statusCode": 200, "headers": CORS, "body": json.dumps([])}

    if action == "calc" and method == "POST":
        body = json.loads(event.get("body", "{}"))
        from_city = body.get("from", "")
        to_city = body.get("to", "")
        passengers = body.get("passengers", 1)

        if not from_city or not to_city:
            return {
                "statusCode": 400,
                "headers": CORS,
                "body": json.dumps({"error": "Укажите откуда и куда"}),
            }

        from_geo = geocode(from_city)
        to_geo = geocode(to_city)
        if not from_geo or not to_geo:
            return {
                "statusCode": 400,
                "headers": CORS,
                "body": json.dumps({"error": "Не удалось найти один из городов"}),
            }

        try:
            route = get_route_distance(from_geo, to_geo)
        except Exception:
            dist_lat = abs(from_geo["lat"] - to_geo["lat"])
            dist_lon = abs(from_geo["lon"] - to_geo["lon"])
            approx_km = int(((dist_lat ** 2 + dist_lon ** 2) ** 0.5) * 111 * 1.3)
            route = {"distance_km": approx_km, "duration_min": int(approx_km / 80 * 60)}

        prices = calculate_prices(route["distance_km"], from_geo["name"], to_geo["name"])

        if passengers and int(passengers) > 4:
            prices = [p for p in prices if p["tariff"] == "minivan"]

        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({
                "from": from_geo["name"],
                "to": to_geo["name"],
                "distance_km": route["distance_km"],
                "duration_min": route["duration_min"],
                "prices": prices,
                "new_territory": any(p["new_territory"] for p in prices),
            }),
        }

    if action == "order" and method == "POST":
        body = json.loads(event.get("body", "{}"))
        required = ["from", "to", "phone", "date", "passengers", "distance_km", "prices"]
        for field in required:
            if field not in body:
                return {
                    "statusCode": 400,
                    "headers": CORS,
                    "body": json.dumps({"error": f"Поле {field} обязательно"}),
                }

        order_data = {
            "from": body["from"],
            "to": body["to"],
            "distance_km": body["distance_km"],
            "duration_min": body.get("duration_min", 0),
            "passengers": body["passengers"],
            "date": body["date"],
            "phone": body["phone"],
            "prices": body["prices"],
            "utm": body.get("utm", ""),
            "new_territory": body.get("new_territory", False),
        }

        try:
            send_telegram(order_data)
            return {
                "statusCode": 200,
                "headers": CORS,
                "body": json.dumps({"ok": True, "message": "Заявка отправлена! Диспетчер свяжется с вами."}),
            }
        except Exception:
            return {
                "statusCode": 500,
                "headers": CORS,
                "body": json.dumps({"error": "Ошибка отправки. Позвоните: 8-995-645-51-25"}),
            }

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"status": "ok", "actions": ["suggest", "calc", "order"]}),
    }