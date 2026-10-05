CREATE TABLE IF NOT EXISTS gudok_calls (
    id SERIAL PRIMARY KEY,
    gudok_call_id VARCHAR(64) UNIQUE,
    caller VARCHAR(32),
    caller_digits VARCHAR(16),
    dst VARCHAR(32),
    channel_name VARCHAR(255),
    project_title VARCHAR(255),
    call_status VARCHAR(32),
    duration INTEGER,
    billsec INTEGER,
    region VARCHAR(255),
    call_number INTEGER,
    audio_url TEXT,
    called_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gudok_calls_digits ON gudok_calls (caller_digits);
CREATE INDEX IF NOT EXISTS idx_gudok_calls_called_at ON gudok_calls (called_at DESC);