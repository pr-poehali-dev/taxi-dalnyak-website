ALTER TABLE t_p85334902_taxi_dalnyak_website.app_drivers ADD COLUMN IF NOT EXISTS callsign text NULL;
ALTER TABLE t_p85334902_taxi_dalnyak_website.app_trips ADD COLUMN IF NOT EXISTS passengers integer NULL;
ALTER TABLE t_p85334902_taxi_dalnyak_website.app_trips ADD COLUMN IF NOT EXISTS luggage text NULL;
ALTER TABLE t_p85334902_taxi_dalnyak_website.app_trips ADD COLUMN IF NOT EXISTS created_by text NULL;