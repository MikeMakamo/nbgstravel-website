CREATE TABLE IF NOT EXISTS roles (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  role_id BIGINT UNSIGNED NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone_number VARCHAR(30) NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_admins_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS media_assets (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_extension VARCHAR(20) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_url VARCHAR(500) NULL,
  file_size_bytes BIGINT UNSIGNED NULL,
  width INT NULL,
  height INT NULL,
  alt_text VARCHAR(255) NULL,
  uploaded_by_admin_id BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_media_uploaded_by FOREIGN KEY (uploaded_by_admin_id) REFERENCES admins(id)
);

CREATE TABLE IF NOT EXISTS managed_pages (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  slug VARCHAR(150) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  meta_title VARCHAR(255) NULL,
  meta_description TEXT NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  content_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faqs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  question VARCHAR(255) NOT NULL,
  answer TEXT NOT NULL,
  page_scope VARCHAR(100) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS terms_documents (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  document_key VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  version_label VARCHAR(50) NOT NULL,
  is_current TINYINT(1) NOT NULL DEFAULT 1,
  content LONGTEXT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_terms_document_version (document_key, version_label),
  INDEX idx_terms_documents_current (document_key, is_current)
);

CREATE TABLE IF NOT EXISTS packages (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  subtitle VARCHAR(255) NULL,
  short_description TEXT NULL,
  full_description LONGTEXT NULL,
  continent VARCHAR(100) NULL,
  country VARCHAR(100) NULL,
  destination VARCHAR(150) NULL,
  package_category VARCHAR(100) NULL,
  trip_type VARCHAR(100) NULL,
  duration_label VARCHAR(100) NULL,
  base_price DECIMAL(12, 2) NULL,
  currency_code VARCHAR(10) NOT NULL DEFAULT 'ZAR',
  pricing_model ENUM('per_person_sharing', 'per_couple', 'single_supplement', 'child_rate', 'custom') NOT NULL DEFAULT 'custom',
  quoted_from_label VARCHAR(100) NULL,
  deposit_amount DECIMAL(12, 2) NULL,
  has_fixed_travel_dates TINYINT(1) NOT NULL DEFAULT 0,
  fixed_travel_start_date DATE NULL,
  fixed_travel_end_date DATE NULL,
  booking_enabled TINYINT(1) NOT NULL DEFAULT 1,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  meta_title VARCHAR(255) NULL,
  meta_description TEXT NULL,
  created_by_admin_id BIGINT UNSIGNED NULL,
  updated_by_admin_id BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_packages_created_by FOREIGN KEY (created_by_admin_id) REFERENCES admins(id),
  CONSTRAINT fk_packages_updated_by FOREIGN KEY (updated_by_admin_id) REFERENCES admins(id)
);

CREATE TABLE IF NOT EXISTS package_pricing_rules (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  package_id BIGINT UNSIGNED NOT NULL,
  rule_type ENUM('base', 'adult', 'child', 'single_supplement', 'couple', 'custom') NOT NULL DEFAULT 'base',
  label VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  min_persons INT NULL,
  max_persons INT NULL,
  notes VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_package_pricing_rules_package FOREIGN KEY (package_id) REFERENCES packages(id)
);

CREATE TABLE IF NOT EXISTS package_inclusions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  package_id BIGINT UNSIGNED NOT NULL,
  item_text VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_package_inclusions_package FOREIGN KEY (package_id) REFERENCES packages(id)
);

CREATE TABLE IF NOT EXISTS package_exclusions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  package_id BIGINT UNSIGNED NOT NULL,
  item_text VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_package_exclusions_package FOREIGN KEY (package_id) REFERENCES packages(id)
);

CREATE TABLE IF NOT EXISTS package_payment_plan_items (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  package_id BIGINT UNSIGNED NOT NULL,
  label VARCHAR(150) NOT NULL,
  amount DECIMAL(12, 2) NULL,
  description VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_package_payment_plan_items_package FOREIGN KEY (package_id) REFERENCES packages(id)
);

CREATE TABLE IF NOT EXISTS package_media (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  package_id BIGINT UNSIGNED NOT NULL,
  media_asset_id BIGINT UNSIGNED NOT NULL,
  usage_type ENUM('hero', 'gallery', 'thumbnail', 'banner', 'other') NOT NULL DEFAULT 'gallery',
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_package_media_package FOREIGN KEY (package_id) REFERENCES packages(id),
  CONSTRAINT fk_package_media_asset FOREIGN KEY (media_asset_id) REFERENCES media_assets(id)
);

CREATE TABLE IF NOT EXISTS visa_offerings (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  country VARCHAR(100) NULL,
  processing_time_label VARCHAR(100) NULL,
  application_fee DECIMAL(12, 2) NOT NULL,
  currency_code VARCHAR(10) NOT NULL DEFAULT 'ZAR',
  description LONGTEXT NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  package_id BIGINT UNSIGNED NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  phone_number VARCHAR(30) NOT NULL,
  email VARCHAR(150) NOT NULL,
  preferred_travel_date DATE NULL,
  number_of_persons INT NOT NULL,
  pricing_model_snapshot VARCHAR(100) NULL,
  quoted_total_amount DECIMAL(12, 2) NULL,
  currency_code VARCHAR(10) NOT NULL DEFAULT 'ZAR',
  status ENUM('new', 'contact_pending', 'contacted', 'converted', 'closed') NOT NULL DEFAULT 'new',
  source_page_url VARCHAR(500) NULL,
  source_context_json JSON NULL,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookings_package FOREIGN KEY (package_id) REFERENCES packages(id),
  INDEX idx_bookings_status (status),
  INDEX idx_bookings_submitted_at (submitted_at)
);

CREATE TABLE IF NOT EXISTS inquiries (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  inquiry_type ENUM('homepage', 'package', 'service', 'contact', 'general') NOT NULL,
  package_id BIGINT UNSIGNED NULL,
  visa_offering_id BIGINT UNSIGNED NULL,
  full_name VARCHAR(200) NULL,
  phone_number VARCHAR(30) NULL,
  email VARCHAR(150) NULL,
  message TEXT NULL,
  source_page_url VARCHAR(500) NULL,
  status ENUM('new', 'contact_pending', 'contacted', 'closed') NOT NULL DEFAULT 'new',
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_inquiries_package FOREIGN KEY (package_id) REFERENCES packages(id),
  CONSTRAINT fk_inquiries_visa_offering FOREIGN KEY (visa_offering_id) REFERENCES visa_offerings(id),
  INDEX idx_inquiries_status (status)
);

CREATE TABLE IF NOT EXISTS visa_applications (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  visa_offering_id BIGINT UNSIGNED NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  phone_number VARCHAR(30) NOT NULL,
  nationality VARCHAR(100) NOT NULL,
  number_of_persons INT NOT NULL,
  travel_date DATE NOT NULL,
  return_date DATE NOT NULL,
  terms_version VARCHAR(50) NULL,
  status ENUM('submitted', 'payment_pending', 'paid', 'failed', 'cancelled') NOT NULL DEFAULT 'submitted',
  source_page_url VARCHAR(500) NULL,
  source_context_json JSON NULL,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_visa_applications_visa_offering FOREIGN KEY (visa_offering_id) REFERENCES visa_offerings(id),
  INDEX idx_visa_applications_status (status),
  INDEX idx_visa_applications_submitted_at (submitted_at)
);

CREATE TABLE IF NOT EXISTS abandoned_leads (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  lead_type ENUM('package_booking', 'visa_application') NOT NULL,
  package_id BIGINT UNSIGNED NULL,
  visa_offering_id BIGINT UNSIGNED NULL,
  full_name VARCHAR(200) NULL,
  phone_number VARCHAR(30) NOT NULL,
  email VARCHAR(150) NULL,
  nationality VARCHAR(100) NULL,
  preferred_travel_date DATE NULL,
  travel_date DATE NULL,
  return_date DATE NULL,
  number_of_persons INT NULL,
  partial_form_json JSON NOT NULL,
  source_page_url VARCHAR(500) NULL,
  abandon_reason VARCHAR(100) NULL,
  status ENUM('new', 'contact_pending', 'contacted', 'closed') NOT NULL DEFAULT 'new',
  captured_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_abandoned_leads_package FOREIGN KEY (package_id) REFERENCES packages(id),
  CONSTRAINT fk_abandoned_leads_visa_offering FOREIGN KEY (visa_offering_id) REFERENCES visa_offerings(id),
  INDEX idx_abandoned_leads_status (status)
);

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  payment_type ENUM('visa_application') NOT NULL,
  visa_application_id BIGINT UNSIGNED NULL,
  provider ENUM('payfast') NOT NULL,
  provider_payment_id VARCHAR(150) NULL,
  provider_reference VARCHAR(150) NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency_code VARCHAR(10) NOT NULL DEFAULT 'ZAR',
  status ENUM('pending', 'paid', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
  request_payload_json JSON NULL,
  response_payload_json JSON NULL,
  paid_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_visa_application FOREIGN KEY (visa_application_id) REFERENCES visa_applications(id),
  INDEX idx_payments_status (status)
);

CREATE TABLE IF NOT EXISTS reviews (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  source ENUM('google') NOT NULL DEFAULT 'google',
  source_review_id VARCHAR(150) NOT NULL UNIQUE,
  reviewer_name VARCHAR(150) NOT NULL,
  reviewer_avatar_url VARCHAR(500) NULL,
  rating TINYINT UNSIGNED NOT NULL,
  review_text TEXT NULL,
  reviewed_at DATETIME NULL,
  is_visible TINYINT(1) NOT NULL DEFAULT 1,
  raw_payload_json JSON NULL,
  last_synced_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS review_sync_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  source ENUM('google') NOT NULL DEFAULT 'google',
  status ENUM('success', 'partial_success', 'failed') NOT NULL,
  started_at DATETIME NOT NULL,
  finished_at DATETIME NULL,
  reviews_fetched_count INT NOT NULL DEFAULT 0,
  reviews_inserted_count INT NOT NULL DEFAULT 0,
  reviews_updated_count INT NOT NULL DEFAULT 0,
  error_message TEXT NULL,
  payload_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  email_type VARCHAR(100) NOT NULL,
  related_table VARCHAR(100) NULL,
  related_record_id BIGINT UNSIGNED NULL,
  recipient_email VARCHAR(150) NOT NULL,
  recipient_name VARCHAR(200) NULL,
  subject VARCHAR(255) NOT NULL,
  status ENUM('queued', 'sent', 'failed') NOT NULL DEFAULT 'queued',
  provider_message_id VARCHAR(150) NULL,
  error_message TEXT NULL,
  sent_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  admin_id BIGINT UNSIGNED NULL,
  action_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  description VARCHAR(255) NULL,
  before_state_json JSON NULL,
  after_state_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_logs_admin FOREIGN KEY (admin_id) REFERENCES admins(id)
);
