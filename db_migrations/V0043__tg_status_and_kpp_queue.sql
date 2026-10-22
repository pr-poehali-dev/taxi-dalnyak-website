ALTER TABLE t_p85334902_taxi_dalnyak_website.app_trips ADD COLUMN IF NOT EXISTS tg_chat_id bigint;
ALTER TABLE t_p85334902_taxi_dalnyak_website.app_users ADD COLUMN IF NOT EXISTS tg_chat_id bigint;
CREATE TABLE IF NOT EXISTS t_p85334902_taxi_dalnyak_website.app_tg_links (
  tg_message_id bigint PRIMARY KEY,
  trip_id bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS t_p85334902_taxi_dalnyak_website.app_kpp_reports (
  id bigserial PRIMARY KEY,
  kpp_id text NOT NULL,
  minutes integer NOT NULL,
  reporter_role text NOT NULL,
  reporter_id bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS app_kpp_reports_kpp_idx ON t_p85334902_taxi_dalnyak_website.app_kpp_reports (kpp_id, created_at DESC);