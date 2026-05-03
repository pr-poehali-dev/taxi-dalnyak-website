ALTER TABLE t_p85334902_taxi_dalnyak_website.chat_sessions
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_term TEXT,
  ADD COLUMN IF NOT EXISTS utm_content TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS messages_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS route_from TEXT,
  ADD COLUMN IF NOT EXISTS route_to TEXT,
  ADD COLUMN IF NOT EXISTS distance_km NUMERIC,
  ADD COLUMN IF NOT EXISTS car_class TEXT,
  ADD COLUMN IF NOT EXISTS quoted_price NUMERIC,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS is_ordered BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS drop_stage TEXT,
  ADD COLUMN IF NOT EXISTS last_assistant_message TEXT;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON t_p85334902_taxi_dalnyak_website.chat_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_is_ordered ON t_p85334902_taxi_dalnyak_website.chat_sessions(is_ordered);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON t_p85334902_taxi_dalnyak_website.chat_messages(session_id, created_at);

CREATE TABLE IF NOT EXISTS t_p85334902_taxi_dalnyak_website.chat_orders (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    phone TEXT NOT NULL,
    route_from TEXT,
    route_to TEXT,
    distance_km NUMERIC,
    car_class TEXT,
    price NUMERIC,
    pax_count INT,
    extras TEXT,
    raw_summary TEXT,
    sent_to_telegram BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_orders_created_at ON t_p85334902_taxi_dalnyak_website.chat_orders(created_at);