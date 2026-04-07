ALTER TABLE packages
  ADD COLUMN admin_meta_json JSON NULL AFTER meta_description;
