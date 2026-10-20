ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS ext_driver_name TEXT;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS ext_driver_phone TEXT;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS ext_car_model TEXT;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS ext_car_plate TEXT;
ALTER TABLE app_trips ADD COLUMN IF NOT EXISTS ext_car_color TEXT;

UPDATE app_settings
SET value = jsonb_set(jsonb_set(value::jsonb, '{support_max}', '"https://max.ru/u/f9LHodD0cOIdPXLl7V9DCE5kMQ2FL1vfqw6MCfELM52z8xxUwdUJxz923vI"'), '{support_telegram}', '"https://t.me/Mezhgorod1816"')::text
WHERE key = 'config';