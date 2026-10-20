INSERT INTO app_sessions (user_id, token_hash, expires_at)
VALUES (4, encode(sha256(convert_to('tmp-test-session-7f3a91c2d8e04b6a', 'UTF8')), 'hex'), now() + interval '10 minutes')
ON CONFLICT (token_hash) DO UPDATE SET expires_at = now() + interval '10 minutes';