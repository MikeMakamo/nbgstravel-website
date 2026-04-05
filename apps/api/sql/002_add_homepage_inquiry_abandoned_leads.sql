ALTER TABLE abandoned_leads
MODIFY COLUMN lead_type ENUM('package_booking', 'visa_application', 'homepage_inquiry') NOT NULL;
