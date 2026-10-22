ALTER TABLE t_p85334902_taxi_dalnyak_website.app_trips ADD COLUMN IF NOT EXISTS wish text;
ALTER TABLE t_p85334902_taxi_dalnyak_website.app_trips ADD COLUMN IF NOT EXISTS kpp_id text;
CREATE TABLE IF NOT EXISTS t_p85334902_taxi_dalnyak_website.app_offers (
  id bigserial PRIMARY KEY,
  trip_id bigint NOT NULL REFERENCES t_p85334902_taxi_dalnyak_website.app_trips(id),
  driver_id bigint NOT NULL REFERENCES t_p85334902_taxi_dalnyak_website.app_users(id),
  eta_minutes integer,
  note text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trip_id, driver_id)
);
CREATE INDEX IF NOT EXISTS app_offers_trip_idx ON t_p85334902_taxi_dalnyak_website.app_offers (trip_id, status);
ALTER TABLE t_p85334902_taxi_dalnyak_website.app_drivers ADD COLUMN IF NOT EXISTS car_year integer;
ALTER TABLE t_p85334902_taxi_dalnyak_website.app_drivers ADD COLUMN IF NOT EXISTS car_features text[] NOT NULL DEFAULT '{}'::text[];