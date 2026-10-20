ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS eta_at TIMESTAMPTZ;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS share_token TEXT;
UPDATE app_trips SET share_token = md5(random()::text || id::text || clock_timestamp()::text) WHERE share_token IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_trips_share ON app_trips(share_token);
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS manual_driver BOOLEAN NOT NULL DEFAULT false;