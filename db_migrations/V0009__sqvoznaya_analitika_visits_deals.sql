-- Сквозная аналитика: визиты из рекламы и сделки с деньгами

CREATE TABLE IF NOT EXISTS ad_visits (
    id BIGSERIAL PRIMARY KEY,
    visit_key TEXT UNIQUE NOT NULL,
    ym_client_id TEXT,
    yclid TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    landing_page TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ad_visits_key ON ad_visits(visit_key);
CREATE INDEX IF NOT EXISTS idx_ad_visits_client ON ad_visits(ym_client_id);
CREATE INDEX IF NOT EXISTS idx_ad_visits_created ON ad_visits(created_at DESC);

CREATE TABLE IF NOT EXISTS deals (
    id BIGSERIAL PRIMARY KEY,
    visit_key TEXT,
    ym_client_id TEXT,
    yclid TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    channel TEXT,
    client_name TEXT,
    client_phone TEXT,
    route_from TEXT,
    route_to TEXT,
    car_class TEXT,
    trip_date DATE,
    amount NUMERIC(12,2) DEFAULT 0,
    costs NUMERIC(12,2) DEFAULT 0,
    profit NUMERIC(12,2) DEFAULT 0,
    status TEXT DEFAULT 'new',
    comment TEXT,
    sent_to_metrika BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP,
    metrika_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_created ON deals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_phone ON deals(client_phone);
CREATE INDEX IF NOT EXISTS idx_deals_sent ON deals(sent_to_metrika);
