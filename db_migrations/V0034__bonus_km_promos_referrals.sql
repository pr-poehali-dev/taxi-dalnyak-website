ALTER TABLE app_users ADD COLUMN IF NOT EXISTS bonus_km INTEGER NOT NULL DEFAULT 0;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS ref_code TEXT;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS referred_by BIGINT;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS ref_rewarded BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS app_users_ref_code_uq ON app_users (ref_code) WHERE ref_code IS NOT NULL;

ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS bonus_used INTEGER NOT NULL DEFAULT 0;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS bonus_earned BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS app_bonus_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    trip_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS app_bonus_log_user_idx ON app_bonus_log (user_id, id DESC);

CREATE TABLE IF NOT EXISTS app_promos (
    id BIGSERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    km INTEGER NOT NULL,
    max_uses INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_promo_uses (
    promo_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (promo_id, user_id)
);