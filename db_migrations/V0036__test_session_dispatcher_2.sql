INSERT INTO app_sessions (user_id, token_hash, expires_at)
VALUES (4, encode(sha256(convert_to('tmp-test-session-9b1d77e0c4a25f38', 'UTF8')), 'hex'), now() + interval '20 minutes')
ON CONFLICT (token_hash) DO UPDATE SET expires_at = now() + interval '20 minutes';
UPDATE app_users SET bonus_km = 0 WHERE phone IN ('+79990003344', '+79990000007');