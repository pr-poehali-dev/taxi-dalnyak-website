ALTER TABLE t_p85334902_taxi_dalnyak_website.chat_sessions
  ADD COLUMN IF NOT EXISTS operator_active BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS needs_operator BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS operator_joined_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS unread_for_operator INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_needs_op
  ON t_p85334902_taxi_dalnyak_website.chat_sessions (needs_operator, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_msg
  ON t_p85334902_taxi_dalnyak_website.chat_sessions (last_message_at DESC);