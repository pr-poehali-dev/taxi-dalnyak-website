CREATE TABLE IF NOT EXISTS app_state (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_state (key, value, updated_at)
VALUES ('last_metrika_sync', '', NOW() - INTERVAL '2 days')
ON CONFLICT (key) DO NOTHING;
