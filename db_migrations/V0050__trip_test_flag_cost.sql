ALTER TABLE t_p85334902_taxi_dalnyak_website.app_trips
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS crm_cost numeric;
ALTER TABLE t_p85334902_taxi_dalnyak_website.app_users
  ADD COLUMN IF NOT EXISTS is_tester boolean NOT NULL DEFAULT false;
UPDATE t_p85334902_taxi_dalnyak_website.app_trips SET is_test = true WHERE id <> 40;
UPDATE t_p85334902_taxi_dalnyak_website.app_users SET is_tester = true WHERE id IN (SELECT DISTINCT client_id FROM t_p85334902_taxi_dalnyak_website.app_trips WHERE id <> 40 AND client_id IS NOT NULL) AND id <> 19;
UPDATE t_p85334902_taxi_dalnyak_website.app_trips SET ym_client_id = '1792668921847527595', yclid = '17420354899711098879', visit_key = 'JYNVGB', utm_source = 'yandex', utm_medium = 'cpc', utm_campaign = '715329740', utm_term = '---autotargeting', crm_status = NULL WHERE id = 40;