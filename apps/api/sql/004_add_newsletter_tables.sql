CREATE TABLE IF NOT EXISTS newsletter_lists (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  description TEXT NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(150) NOT NULL UNIQUE,
  first_name VARCHAR(100) NULL,
  status ENUM('subscribed', 'unsubscribed', 'bounced') NOT NULL DEFAULT 'subscribed',
  source ENUM('website', 'admin', 'import') NOT NULL DEFAULT 'website',
  unsubscribe_token VARCHAR(64) NOT NULL UNIQUE,
  subscribed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at DATETIME NULL,
  last_emailed_at DATETIME NULL,
  notes VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS newsletter_list_subscribers (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  newsletter_list_id BIGINT UNSIGNED NOT NULL,
  newsletter_subscriber_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_newsletter_list_subscriber (newsletter_list_id, newsletter_subscriber_id),
  CONSTRAINT fk_newsletter_list_subscribers_list FOREIGN KEY (newsletter_list_id) REFERENCES newsletter_lists(id),
  CONSTRAINT fk_newsletter_list_subscribers_subscriber FOREIGN KEY (newsletter_subscriber_id) REFERENCES newsletter_subscribers(id)
);

CREATE TABLE IF NOT EXISTS newsletter_templates (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  template_key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  preheader VARCHAR(255) NULL,
  heading VARCHAR(255) NOT NULL,
  intro_text TEXT NULL,
  body_html LONGTEXT NOT NULL,
  cta_label VARCHAR(100) NULL,
  cta_url VARCHAR(500) NULL,
  footer_note TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  newsletter_list_id BIGINT UNSIGNED NOT NULL,
  newsletter_template_id BIGINT UNSIGNED NOT NULL,
  sent_by_admin_id BIGINT UNSIGNED NOT NULL,
  campaign_name VARCHAR(150) NOT NULL,
  subject_snapshot VARCHAR(255) NOT NULL,
  preheader_snapshot VARCHAR(255) NULL,
  heading_snapshot VARCHAR(255) NOT NULL,
  intro_text_snapshot TEXT NULL,
  body_html_snapshot LONGTEXT NOT NULL,
  cta_label_snapshot VARCHAR(100) NULL,
  cta_url_snapshot VARCHAR(500) NULL,
  footer_note_snapshot TEXT NULL,
  status ENUM('draft', 'sending', 'sent', 'partial', 'failed') NOT NULL DEFAULT 'draft',
  total_recipients INT NOT NULL DEFAULT 0,
  sent_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_newsletter_campaigns_list FOREIGN KEY (newsletter_list_id) REFERENCES newsletter_lists(id),
  CONSTRAINT fk_newsletter_campaigns_template FOREIGN KEY (newsletter_template_id) REFERENCES newsletter_templates(id),
  CONSTRAINT fk_newsletter_campaigns_admin FOREIGN KEY (sent_by_admin_id) REFERENCES admins(id)
);

CREATE TABLE IF NOT EXISTS newsletter_campaign_recipients (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  newsletter_campaign_id BIGINT UNSIGNED NOT NULL,
  newsletter_subscriber_id BIGINT UNSIGNED NOT NULL,
  recipient_email VARCHAR(150) NOT NULL,
  status ENUM('queued', 'sent', 'failed', 'skipped') NOT NULL DEFAULT 'queued',
  provider_message_id VARCHAR(150) NULL,
  error_message TEXT NULL,
  sent_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_newsletter_campaign_recipient (newsletter_campaign_id, newsletter_subscriber_id),
  CONSTRAINT fk_newsletter_campaign_recipients_campaign FOREIGN KEY (newsletter_campaign_id) REFERENCES newsletter_campaigns(id),
  CONSTRAINT fk_newsletter_campaign_recipients_subscriber FOREIGN KEY (newsletter_subscriber_id) REFERENCES newsletter_subscribers(id)
);
