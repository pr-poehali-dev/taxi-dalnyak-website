ALTER TABLE t_p85334902_taxi_dalnyak_website.app_trips
  ADD COLUMN IF NOT EXISTS ym_client_id text,
  ADD COLUMN IF NOT EXISTS yclid text,
  ADD COLUMN IF NOT EXISTS visit_key text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS crm_status text,
  ADD COLUMN IF NOT EXISTS crm_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS crm_response text;