CREATE TABLE IF NOT EXISTS app_users (
    id BIGSERIAL PRIMARY KEY,
    phone TEXT NOT NULL,
    role TEXT NOT NULL,
    name TEXT,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (phone, role)
);

CREATE TABLE IF NOT EXISTS app_drivers (
    user_id BIGINT PRIMARY KEY REFERENCES app_users(id),
    car_model TEXT,
    car_plate TEXT,
    car_color TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    on_line BOOLEAN NOT NULL DEFAULT false,
    balance NUMERIC NOT NULL DEFAULT 0,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    loc_at TIMESTAMPTZ,
    last_seen TIMESTAMPTZ,
    photo_license TEXT,
    photo_sts TEXT,
    photo_car_front TEXT,
    photo_car_back TEXT,
    photo_car_left TEXT,
    photo_car_right TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_trips (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES app_users(id),
    from_text TEXT,
    from_lat DOUBLE PRECISION,
    from_lng DOUBLE PRECISION,
    to_text TEXT,
    comment TEXT,
    price NUMERIC,
    status TEXT NOT NULL DEFAULT 'new',
    driver_id BIGINT REFERENCES app_users(id),
    assigned_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_trips_status ON app_trips(status);
CREATE INDEX IF NOT EXISTS idx_app_trips_client ON app_trips(client_id);
CREATE INDEX IF NOT EXISTS idx_app_trips_driver ON app_trips(driver_id);

CREATE TABLE IF NOT EXISTS app_broadcasts (
    id BIGSERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_balance_log (
    id BIGSERIAL PRIMARY KEY,
    driver_id BIGINT NOT NULL REFERENCES app_users(id),
    amount NUMERIC NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);