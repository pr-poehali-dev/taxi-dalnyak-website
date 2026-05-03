ALTER TABLE t_p85334902_taxi_dalnyak_website.chat_orders
  ADD COLUMN IF NOT EXISTS pickup_date TEXT,
  ADD COLUMN IF NOT EXISTS pickup_time TEXT;

ALTER TABLE t_p85334902_taxi_dalnyak_website.chat_sessions
  ADD COLUMN IF NOT EXISTS pickup_date TEXT,
  ADD COLUMN IF NOT EXISTS pickup_time TEXT;