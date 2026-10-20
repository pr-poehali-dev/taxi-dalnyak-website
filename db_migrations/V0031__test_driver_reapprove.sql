UPDATE app_drivers SET status = 'approved', tariffs = '{comfort,standard}', on_line = true, last_seen = now(), balance = 20000 WHERE user_id IN (SELECT id FROM app_users WHERE phone = '+79990001122' AND role = 'driver');
INSERT INTO app_sessions (user_id, token_hash, expires_at)
VALUES (4, encode(sha256(convert_to('tmp-test-session-7f3a91c2d8e04b6a', 'UTF8')), 'hex'), now() + interval '15 minutes')
ON CONFLICT (token_hash) DO UPDATE SET expires_at = now() + interval '15 minutes';