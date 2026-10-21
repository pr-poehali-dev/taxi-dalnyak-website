CREATE TABLE t_p85334902_taxi_dalnyak_website.app_funnel (
    id BIGSERIAL PRIMARY KEY,
    visitor TEXT NOT NULL,
    step TEXT NOT NULL,
    installed BOOLEAN NOT NULL DEFAULT false,
    from_ad BOOLEAN NOT NULL DEFAULT false,
    utm_source TEXT,
    utm_campaign TEXT,
    user_id BIGINT,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX app_funnel_created_idx ON t_p85334902_taxi_dalnyak_website.app_funnel (created_at);
CREATE INDEX app_funnel_visitor_idx ON t_p85334902_taxi_dalnyak_website.app_funnel (visitor);
ALTER TABLE t_p85334902_taxi_dalnyak_website.app_trips ADD COLUMN from_installed BOOLEAN NOT NULL DEFAULT true;