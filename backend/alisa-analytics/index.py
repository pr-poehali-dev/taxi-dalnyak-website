import json
import os
import http.client
import ssl

import psycopg2


TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
YANDEX_GPT_API_KEY = os.environ.get("YANDEX_GPT_API_KEY", "")
YANDEX_FOLDER_ID = os.environ.get("YANDEX_FOLDER_ID", "")
DATABASE_URL = os.environ.get("DATABASE_URL", "")
DB_SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p85334902_taxi_dalnyak_website")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
}

_ssl_ctx = ssl.create_default_context()


def https_post_json(host, path, payload, headers, timeout=60):
    body_bytes = json.dumps(payload).encode("utf-8")
    h = {"Content-Type": "application/json", "Content-Length": str(len(body_bytes))}
    h.update(headers or {})
    conn = http.client.HTTPSConnection(host, timeout=timeout, context=_ssl_ctx)
    conn.request("POST", path, body=body_bytes, headers=h)
    resp = conn.getresponse()
    data = resp.read().decode("utf-8", errors="ignore")
    status = resp.status
    conn.close()
    return status, data


def telegram_send(text):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return False
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": text[:4000], "parse_mode": "HTML"}
    s, _ = https_post_json("api.telegram.org", f"/bot{TELEGRAM_BOT_TOKEN}/sendMessage", payload, {})
    return s == 200


def deepseek_summary(stats_text, dropped_dialogs):
    prompt = (
        "Ты — продакт-аналитик отдела продаж. Тебе дана статистика по диалогам ИИ-менеджера такси Алисы за сутки "
        "и обезличенные фрагменты диалогов, где клиенты ушли без заказа. "
        "Дай КРАТКИЙ отчёт (5-7 строк) на русском: 1) что работает, 2) на каком этапе чаще теряем клиентов, "
        "3) одна-две гипотезы как улучшить промпт Алисы. Без воды и общих фраз. Только конкретика по диалогам.\n\n"
        f"СТАТИСТИКА:\n{stats_text}\n\nФРАГМЕНТЫ ОТКАЗОВ:\n{dropped_dialogs[:3500]}"
    )
    if not YANDEX_FOLDER_ID or not YANDEX_GPT_API_KEY:
        return None
    payload = {
        "model": f"gpt://{YANDEX_FOLDER_ID}/yandexgpt/latest",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.5,
        "max_tokens": 500,
    }
    s, data = https_post_json(
        "llm.api.cloud.yandex.net",
        "/v1/chat/completions",
        payload,
        {
            "Authorization": f"Api-Key {YANDEX_GPT_API_KEY}",
            "x-folder-id": YANDEX_FOLDER_ID,
        },
        timeout=60,
    )
    if s != 200:
        return None
    try:
        j = json.loads(data)
        return j["choices"][0]["message"]["content"]
    except Exception:
        return None


def collect_stats():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()

        cur.execute(
            f"SELECT COUNT(*) FROM {DB_SCHEMA}.chat_sessions "
            f"WHERE created_at >= NOW() - INTERVAL '24 hours'"
        )
        sessions_24h = cur.fetchone()[0]

        cur.execute(
            f"SELECT COUNT(*) FROM {DB_SCHEMA}.chat_sessions "
            f"WHERE created_at >= NOW() - INTERVAL '24 hours' AND is_ordered = TRUE"
        )
        ordered_24h = cur.fetchone()[0]

        cur.execute(
            f"SELECT COUNT(*) FROM {DB_SCHEMA}.chat_sessions "
            f"WHERE created_at >= NOW() - INTERVAL '24 hours' AND messages_count > 0"
        )
        engaged_24h = cur.fetchone()[0]

        cur.execute(
            f"SELECT car_class, COUNT(*) FROM {DB_SCHEMA}.chat_sessions "
            f"WHERE created_at >= NOW() - INTERVAL '24 hours' AND car_class IS NOT NULL "
            f"GROUP BY car_class ORDER BY 2 DESC"
        )
        by_class = cur.fetchall()

        cur.execute(
            f"SELECT route_from, route_to, COUNT(*) FROM {DB_SCHEMA}.chat_sessions "
            f"WHERE created_at >= NOW() - INTERVAL '24 hours' AND route_from IS NOT NULL "
            f"GROUP BY route_from, route_to ORDER BY 3 DESC LIMIT 5"
        )
        top_routes = cur.fetchall()

        cur.execute(
            f"SELECT s.session_id, s.last_assistant_message, s.quoted_price, s.messages_count "
            f"FROM {DB_SCHEMA}.chat_sessions s "
            f"WHERE s.created_at >= NOW() - INTERVAL '24 hours' "
            f"  AND s.is_ordered = FALSE AND s.messages_count >= 4 "
            f"ORDER BY s.last_message_at DESC LIMIT 10"
        )
        dropped = cur.fetchall()

        dropped_text = ""
        for sid, last_msg, price, mc in dropped:
            cur.execute(
                f"SELECT from_role, text FROM {DB_SCHEMA}.chat_messages "
                f"WHERE session_id = %s ORDER BY created_at DESC LIMIT 4",
                (sid,),
            )
            tail = list(reversed(cur.fetchall()))
            dropped_text += f"\n— Диалог (msg={mc}, цена={price}):\n"
            for role, txt in tail:
                dropped_text += f"  {role}: {(txt or '')[:200]}\n"

        return {
            "sessions_24h": sessions_24h,
            "ordered_24h": ordered_24h,
            "engaged_24h": engaged_24h,
            "by_class": by_class,
            "top_routes": top_routes,
            "dropped_text": dropped_text,
        }
    finally:
        conn.close()


def handler(event, context):
    """Ежедневная аналитика диалогов Алисы — отчёт в Telegram"""
    method = event.get("httpMethod", "POST")
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    stats = collect_stats()
    conv = 0.0
    if stats["engaged_24h"]:
        conv = round(stats["ordered_24h"] * 100.0 / stats["engaged_24h"], 1)

    lines = ["<b>📊 ОТЧЁТ АЛИСЫ ЗА 24 ЧАСА</b>", "—"]
    lines.append(f"Сессий начато: <b>{stats['sessions_24h']}</b>")
    lines.append(f"С диалогом: <b>{stats['engaged_24h']}</b>")
    lines.append(f"Заказов оформлено: <b>{stats['ordered_24h']}</b>")
    lines.append(f"Конверсия в заказ: <b>{conv}%</b>")
    if stats["by_class"]:
        lines.append("—")
        lines.append("<b>По классам:</b>")
        for cls, n in stats["by_class"]:
            lines.append(f"  {cls}: {n}")
    if stats["top_routes"]:
        lines.append("—")
        lines.append("<b>Топ маршрутов:</b>")
        for f, t, n in stats["top_routes"]:
            lines.append(f"  {f or '?'} → {t or '?'}: {n}")

    stats_text = "\n".join(lines).replace("<b>", "").replace("</b>", "")
    insight = None
    if stats["dropped_text"] and DEEPSEEK_API_KEY:
        insight = deepseek_summary(stats_text, stats["dropped_text"])

    if insight:
        lines.append("—")
        lines.append("<b>🧠 Анализ слабых мест:</b>")
        lines.append(insight[:2000])

    text = "\n".join(lines)
    sent = telegram_send(text)

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({
            "ok": True,
            "telegram_sent": sent,
            "stats": {
                "sessions_24h": stats["sessions_24h"],
                "ordered_24h": stats["ordered_24h"],
                "engaged_24h": stats["engaged_24h"],
                "conversion_pct": conv,
            },
        }, ensure_ascii=False),
    }