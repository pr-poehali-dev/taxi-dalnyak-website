UPDATE app_promos SET is_active = false WHERE code = 'TST-KM50';
UPDATE app_users SET bonus_km = 0 WHERE phone IN ('+79990003344', '+79990000007');
UPDATE app_sessions SET expires_at = now() WHERE token_hash = encode(sha256(convert_to('tmp-test-session-9b1d77e0c4a25f38', 'UTF8')), 'hex');
UPDATE app_sessions SET expires_at = now() WHERE user_id IN (SELECT id FROM app_users WHERE phone IN ('+79990003344', '+79990000007'));