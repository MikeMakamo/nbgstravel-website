ALTER TABLE newsletter_templates
  ADD COLUMN hero_image_url VARCHAR(500) NULL AFTER footer_note;

ALTER TABLE newsletter_templates
  ADD COLUMN feature_image_url VARCHAR(500) NULL AFTER hero_image_url;

ALTER TABLE newsletter_campaigns
  ADD COLUMN hero_image_url_snapshot VARCHAR(500) NULL AFTER footer_note_snapshot;

ALTER TABLE newsletter_campaigns
  ADD COLUMN feature_image_url_snapshot VARCHAR(500) NULL AFTER hero_image_url_snapshot;
