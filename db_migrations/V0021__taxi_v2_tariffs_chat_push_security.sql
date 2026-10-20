ALTER TABLE app_users ADD COLUMN IF NOT EXISTS password_hash TEXT;

CREATE TABLE IF NOT EXISTS app_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_users(id),
    token_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_app_sessions_user ON app_sessions(user_id);

ALTER TABLE app_drivers ADD COLUMN IF NOT EXISTS tariffs TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE app_drivers ADD COLUMN IF NOT EXISTS priority_until TIMESTAMPTZ;
ALTER TABLE app_drivers ADD COLUMN IF NOT EXISTS block_reason TEXT;

ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS tariff TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS region TEXT NOT NULL DEFAULT 'regular';
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS distance_km NUMERIC;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS base_price NUMERIC;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS to_lat DOUBLE PRECISION;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS to_lng DOUBLE PRECISION;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS from_city TEXT;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS from_street TEXT;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS from_house TEXT;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS finished_at TIMESTAMPTZ;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS commission NUMERIC;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS commission_charged BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS rating INTEGER;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS rating_comment TEXT;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS deferred_pushed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS reminder_stage INTEGER NOT NULL DEFAULT 0;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS cancelled_by TEXT;

ALTER TABLE app_broadcasts ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE app_broadcasts ADD COLUMN IF NOT EXISTS is_removed BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS app_messages (
    id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL REFERENCES app_trips(id),
    sender_role TEXT NOT NULL,
    sender_id BIGINT NOT NULL REFERENCES app_users(id),
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_app_messages_trip ON app_messages(trip_id, id);

CREATE TABLE IF NOT EXISTS app_push_subs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_users(id),
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, endpoint)
);

CREATE TABLE IF NOT EXISTS app_driver_events (
    id BIGSERIAL PRIMARY KEY,
    driver_id BIGINT NOT NULL REFERENCES app_users(id),
    kind TEXT NOT NULL,
    trip_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_app_driver_events ON app_driver_events(driver_id, kind, created_at);

CREATE TABLE IF NOT EXISTS app_topups (
    id BIGSERIAL PRIMARY KEY,
    driver_id BIGINT NOT NULL REFERENCES app_users(id),
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_rate_log (
    key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_app_rate_log ON app_rate_log(key, created_at);