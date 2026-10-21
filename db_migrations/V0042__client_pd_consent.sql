ALTER TABLE t_p85334902_taxi_dalnyak_website.app_users
    ADD COLUMN pd_consent_at TIMESTAMPTZ,
    ADD COLUMN pd_consent_ver TEXT,
    ADD COLUMN pd_consent_ip TEXT;