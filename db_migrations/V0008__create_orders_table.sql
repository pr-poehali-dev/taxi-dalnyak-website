CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    tracking_code TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    route_from TEXT,
    route_to TEXT,
    distance_km NUMERIC,
    car_class TEXT,
    price_min NUMERIC,
    price_max NUMERIC,
    status TEXT NOT NULL DEFAULT 'new',
    driver_name TEXT,
    car_model TEXT,
    car_plate TEXT,
    driver_phone TEXT,
    eta_minutes INTEGER,
    comment TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_to_telegram BOOLEAN DEFAULT false,
    telegram_message_id BIGINT
);

CREATE INDEX IF NOT EXISTS idx_orders_tracking_code ON orders(tracking_code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
