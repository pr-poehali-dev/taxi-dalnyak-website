ALTER TABLE app_drivers ADD COLUMN IF NOT EXISTS photo_license_back TEXT;
ALTER TABLE app_drivers ADD COLUMN IF NOT EXISTS photo_sts_back TEXT;
ALTER TABLE app_drivers ADD COLUMN IF NOT EXISTS recheck_fields TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE app_drivers ADD COLUMN IF NOT EXISTS recheck_note TEXT;
ALTER TABLE app_drivers ADD COLUMN IF NOT EXISTS loc_city TEXT;
ALTER TABLE app_drivers ADD COLUMN IF NOT EXISTS loc_city_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS app_driver_presence (
    driver_id BIGINT NOT NULL REFERENCES app_users(id),
    day DATE NOT NULL,
    seconds INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (driver_id, day)
);