CREATE TABLE IF NOT EXISTS t_p85334902_taxi_dalnyak_website.lead_clicks (
  id            bigserial PRIMARY KEY,
  visit_key     text,
  channel       text NOT NULL,
  page          text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_term      text,
  utm_content   text,
  yclid         text,
  ym_client_id  text,
  user_agent    text,
  ip_address    text,
  created_at    timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lead_clicks_created ON t_p85334902_taxi_dalnyak_website.lead_clicks (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_clicks_channel ON t_p85334902_taxi_dalnyak_website.lead_clicks (channel);
CREATE INDEX IF NOT EXISTS idx_lead_clicks_visit ON t_p85334902_taxi_dalnyak_website.lead_clicks (visit_key);