CREATE TABLE IF NOT EXISTS t_p85334902_taxi_dalnyak_website.app_trip_skips (
  driver_id bigint NOT NULL,
  trip_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (driver_id, trip_id)
);
UPDATE t_p85334902_taxi_dalnyak_website.app_drivers d SET callsign = x.n::text
FROM (SELECT user_id, row_number() OVER (ORDER BY created_at, user_id) AS n FROM t_p85334902_taxi_dalnyak_website.app_drivers) x
WHERE x.user_id = d.user_id;