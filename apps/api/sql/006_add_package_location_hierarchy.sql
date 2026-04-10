ALTER TABLE packages
  ADD COLUMN region_name VARCHAR(120) NULL AFTER country;

ALTER TABLE packages
  ADD COLUMN city_name VARCHAR(120) NULL AFTER region_name;

UPDATE packages
SET city_name = destination
WHERE destination IS NOT NULL
  AND destination <> ''
  AND (city_name IS NULL OR city_name = '');
