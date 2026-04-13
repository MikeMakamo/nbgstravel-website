ALTER TABLE package_inclusions
  MODIFY COLUMN item_text TEXT NOT NULL;

ALTER TABLE package_exclusions
  MODIFY COLUMN item_text TEXT NOT NULL;
