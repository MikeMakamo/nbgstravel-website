# NBGSTRAVEL Database Schema Plan

## Purpose

This document defines the planned MySQL database structure for the NBGSTRAVEL custom platform.

It is based on the approved project context and system architecture and is intended to guide backend implementation.

The schema is designed to support:

- package management
- visa offerings and applications
- package booking lead capture
- abandoned modal forms
- Google reviews sync
- admin authentication and roles
- email and operational logging

Resolved database decisions:

- group trips are handled as a package category or subtype, not a separate table
- future homepage or service popups do not need extra fields for the first release
- terms handling should be more formal
- reviews do not need extra first-release display controls beyond simple visibility

## Database Design Principles

- Use structured relational tables rather than generic WordPress-style content blobs
- Keep business entities normalized where it improves clarity and querying
- Allow some flexible JSON fields only where the structure may vary by package or integration payload
- Preserve auditability for important operational actions
- Store enough status information to support admin workflows without needing to inspect raw logs

## Core Schema Groups

The database can be divided into these functional groups:

1. authentication and admin users
2. public content and package data
3. package booking leads
4. visa applications and payments
5. abandoned forms
6. reviews and sync logs
7. shared operational tables

## Authentication and Admin

### `roles`

Purpose:

- defines available admin roles

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `name` VARCHAR(50) UNIQUE
- `description` VARCHAR(255) NULL
- `created_at` DATETIME
- `updated_at` DATETIME

Seed values:

- `super_admin`
- `admin`

### `admins`

Purpose:

- stores internal users who can access the admin dashboard

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `role_id` BIGINT UNSIGNED FK -> `roles.id`
- `first_name` VARCHAR(100)
- `last_name` VARCHAR(100)
- `email` VARCHAR(150) UNIQUE
- `phone_number` VARCHAR(30) NULL
- `password_hash` VARCHAR(255)
- `is_active` TINYINT(1) DEFAULT 1
- `last_login_at` DATETIME NULL
- `created_at` DATETIME
- `updated_at` DATETIME

## Content and Managed Site Data

### `managed_pages`

Purpose:

- stores editable content for static or semi-static sections if needed later

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `slug` VARCHAR(150) UNIQUE
- `title` VARCHAR(255)
- `meta_title` VARCHAR(255) NULL
- `meta_description` TEXT NULL
- `status` ENUM('draft','published','archived')
- `content_json` JSON NULL
- `created_at` DATETIME
- `updated_at` DATETIME

### `faqs`

Purpose:

- stores FAQ entries shown across the site

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `question` VARCHAR(255)
- `answer` TEXT
- `page_scope` VARCHAR(100) NULL
- `sort_order` INT DEFAULT 0
- `is_active` TINYINT(1) DEFAULT 1
- `created_at` DATETIME
- `updated_at` DATETIME

### `terms_documents`

Purpose:

- stores reusable terms and conditions text blocks referenced in emails or forms

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `document_key` VARCHAR(100) UNIQUE
- `title` VARCHAR(255)
- `version_label` VARCHAR(50)
- `is_current` TINYINT(1) DEFAULT 1
- `content` LONGTEXT
- `is_active` TINYINT(1) DEFAULT 1
- `created_at` DATETIME
- `updated_at` DATETIME

This table should support more formal terms handling so the system can reference which version of terms applied at the time of submission.

## Media

### `media_assets`

Purpose:

- stores uploaded media metadata

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `file_name` VARCHAR(255)
- `original_name` VARCHAR(255)
- `mime_type` VARCHAR(100)
- `file_extension` VARCHAR(20)
- `file_path` VARCHAR(500)
- `file_url` VARCHAR(500) NULL
- `file_size_bytes` BIGINT UNSIGNED NULL
- `width` INT NULL
- `height` INT NULL
- `alt_text` VARCHAR(255) NULL
- `uploaded_by_admin_id` BIGINT UNSIGNED NULL FK -> `admins.id`
- `created_at` DATETIME
- `updated_at` DATETIME

This table should be future-friendly for later image optimization work.

## Travel Packages

### `packages`

Purpose:

- stores travel packages displayed on the website

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `title` VARCHAR(255)
- `slug` VARCHAR(255) UNIQUE
- `subtitle` VARCHAR(255) NULL
- `short_description` TEXT NULL
- `full_description` LONGTEXT NULL
- `continent` VARCHAR(100) NULL
- `country` VARCHAR(100) NULL
- `destination` VARCHAR(150) NULL
- `package_category` VARCHAR(100) NULL
- `trip_type` VARCHAR(100) NULL
- `duration_label` VARCHAR(100) NULL
- `base_price` DECIMAL(12,2) NULL
- `currency_code` VARCHAR(10) DEFAULT 'ZAR'
- `pricing_model` ENUM('per_person_sharing','per_couple','single_supplement','child_rate','custom')
- `quoted_from_label` VARCHAR(100) NULL
- `deposit_amount` DECIMAL(12,2) NULL
- `has_fixed_travel_dates` TINYINT(1) DEFAULT 0
- `fixed_travel_start_date` DATE NULL
- `fixed_travel_end_date` DATE NULL
- `booking_enabled` TINYINT(1) DEFAULT 1
- `status` ENUM('draft','published','archived') DEFAULT 'draft'
- `sort_order` INT DEFAULT 0
- `meta_title` VARCHAR(255) NULL
- `meta_description` TEXT NULL
- `created_by_admin_id` BIGINT UNSIGNED NULL FK -> `admins.id`
- `updated_by_admin_id` BIGINT UNSIGNED NULL FK -> `admins.id`
- `created_at` DATETIME
- `updated_at` DATETIME

### `package_pricing_rules`

Purpose:

- stores pricing variations for each package

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `package_id` BIGINT UNSIGNED FK -> `packages.id`
- `rule_type` ENUM('base','adult','child','single_supplement','couple','custom')
- `label` VARCHAR(100)
- `amount` DECIMAL(12,2)
- `min_persons` INT NULL
- `max_persons` INT NULL
- `notes` VARCHAR(255) NULL
- `sort_order` INT DEFAULT 0
- `created_at` DATETIME
- `updated_at` DATETIME

This table gives flexibility when a package has more nuanced pricing than a single amount.

### `package_inclusions`

Purpose:

- stores package inclusion list items

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `package_id` BIGINT UNSIGNED FK -> `packages.id`
- `item_text` VARCHAR(255)
- `sort_order` INT DEFAULT 0
- `created_at` DATETIME
- `updated_at` DATETIME

### `package_exclusions`

Purpose:

- stores package exclusion list items

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `package_id` BIGINT UNSIGNED FK -> `packages.id`
- `item_text` VARCHAR(255)
- `sort_order` INT DEFAULT 0
- `created_at` DATETIME
- `updated_at` DATETIME

### `package_payment_plan_items`

Purpose:

- stores installment or payment-plan notes shown on package pages

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `package_id` BIGINT UNSIGNED FK -> `packages.id`
- `label` VARCHAR(150)
- `amount` DECIMAL(12,2) NULL
- `description` VARCHAR(255) NULL
- `sort_order` INT DEFAULT 0
- `created_at` DATETIME
- `updated_at` DATETIME

### `package_media`

Purpose:

- joins packages to uploaded assets

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `package_id` BIGINT UNSIGNED FK -> `packages.id`
- `media_asset_id` BIGINT UNSIGNED FK -> `media_assets.id`
- `usage_type` ENUM('hero','gallery','thumbnail','banner','other') DEFAULT 'gallery'
- `sort_order` INT DEFAULT 0
- `created_at` DATETIME
- `updated_at` DATETIME

## Visa Offerings and Applications

### `visa_offerings`

Purpose:

- stores the visa options displayed on the public visa section

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `title` VARCHAR(255)
- `slug` VARCHAR(255) UNIQUE
- `country` VARCHAR(100) NULL
- `processing_time_label` VARCHAR(100) NULL
- `application_fee` DECIMAL(12,2)
- `currency_code` VARCHAR(10) DEFAULT 'ZAR'
- `description` LONGTEXT NULL
- `status` ENUM('draft','published','archived') DEFAULT 'draft'
- `sort_order` INT DEFAULT 0
- `created_at` DATETIME
- `updated_at` DATETIME

### `visa_applications`

Purpose:

- stores completed visa modal submissions

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `visa_offering_id` BIGINT UNSIGNED FK -> `visa_offerings.id`
- `full_name` VARCHAR(200)
- `phone_number` VARCHAR(30)
- `nationality` VARCHAR(100)
- `number_of_persons` INT
- `travel_date` DATE
- `return_date` DATE
- `terms_version` VARCHAR(50) NULL
- `status` ENUM('submitted','payment_pending','paid','failed','cancelled') DEFAULT 'submitted'
- `source_page_url` VARCHAR(500) NULL
- `source_context_json` JSON NULL
- `submitted_at` DATETIME
- `created_at` DATETIME
- `updated_at` DATETIME

## Package Bookings and Inquiries

### `bookings`

Purpose:

- stores completed package booking modal submissions

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `package_id` BIGINT UNSIGNED FK -> `packages.id`
- `full_name` VARCHAR(200)
- `phone_number` VARCHAR(30)
- `email` VARCHAR(150)
- `preferred_travel_date` DATE NULL
- `number_of_persons` INT
- `pricing_model_snapshot` VARCHAR(100) NULL
- `quoted_total_amount` DECIMAL(12,2) NULL
- `currency_code` VARCHAR(10) DEFAULT 'ZAR'
- `status` ENUM('new','contact_pending','contacted','converted','closed') DEFAULT 'new'
- `source_page_url` VARCHAR(500) NULL
- `source_context_json` JSON NULL
- `submitted_at` DATETIME
- `created_at` DATETIME
- `updated_at` DATETIME

This table stores the submission snapshot so future package edits do not overwrite what the user originally saw.

### `inquiries`

Purpose:

- stores generic lightweight contact or inquiry submissions not tied to full package bookings

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `inquiry_type` ENUM('homepage','package','service','contact','general')
- `package_id` BIGINT UNSIGNED NULL FK -> `packages.id`
- `visa_offering_id` BIGINT UNSIGNED NULL FK -> `visa_offerings.id`
- `full_name` VARCHAR(200) NULL
- `phone_number` VARCHAR(30) NULL
- `email` VARCHAR(150) NULL
- `message` TEXT NULL
- `source_page_url` VARCHAR(500) NULL
- `status` ENUM('new','contact_pending','contacted','closed') DEFAULT 'new'
- `submitted_at` DATETIME
- `created_at` DATETIME
- `updated_at` DATETIME

## Abandoned Forms

### `abandoned_leads`

Purpose:

- stores modal forms that were not fully submitted but are still useful because a phone number was captured

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `lead_type` ENUM('package_booking','visa_application')
- `package_id` BIGINT UNSIGNED NULL FK -> `packages.id`
- `visa_offering_id` BIGINT UNSIGNED NULL FK -> `visa_offerings.id`
- `full_name` VARCHAR(200) NULL
- `phone_number` VARCHAR(30) NOT NULL
- `email` VARCHAR(150) NULL
- `nationality` VARCHAR(100) NULL
- `preferred_travel_date` DATE NULL
- `travel_date` DATE NULL
- `return_date` DATE NULL
- `number_of_persons` INT NULL
- `partial_form_json` JSON
- `source_page_url` VARCHAR(500) NULL
- `abandon_reason` VARCHAR(100) NULL
- `status` ENUM('new','contact_pending','contacted','closed') DEFAULT 'new'
- `captured_at` DATETIME
- `created_at` DATETIME
- `updated_at` DATETIME

This table should receive data only when the user has entered a phone number and the abandoned-form trigger condition has been met.

## Payments

### `payments`

Purpose:

- stores payment records for visa applications

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `payment_type` ENUM('visa_application')
- `visa_application_id` BIGINT UNSIGNED NULL FK -> `visa_applications.id`
- `provider` ENUM('payfast')
- `provider_payment_id` VARCHAR(150) NULL
- `provider_reference` VARCHAR(150) NULL
- `amount` DECIMAL(12,2)
- `currency_code` VARCHAR(10) DEFAULT 'ZAR'
- `status` ENUM('pending','paid','failed','cancelled') DEFAULT 'pending'
- `request_payload_json` JSON NULL
- `response_payload_json` JSON NULL
- `paid_at` DATETIME NULL
- `created_at` DATETIME
- `updated_at` DATETIME

## Reviews

### `reviews`

Purpose:

- stores Google reviews locally for stable frontend rendering

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `source` ENUM('google')
- `source_review_id` VARCHAR(150) UNIQUE
- `reviewer_name` VARCHAR(150)
- `reviewer_avatar_url` VARCHAR(500) NULL
- `rating` TINYINT UNSIGNED
- `review_text` TEXT NULL
- `reviewed_at` DATETIME NULL
- `is_visible` TINYINT(1) DEFAULT 1
- `raw_payload_json` JSON NULL
- `last_synced_at` DATETIME
- `created_at` DATETIME
- `updated_at` DATETIME

### `review_sync_logs`

Purpose:

- stores sync runs and errors for Google review refresh operations

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `source` ENUM('google')
- `status` ENUM('success','partial_success','failed')
- `started_at` DATETIME
- `finished_at` DATETIME NULL
- `reviews_fetched_count` INT DEFAULT 0
- `reviews_inserted_count` INT DEFAULT 0
- `reviews_updated_count` INT DEFAULT 0
- `error_message` TEXT NULL
- `payload_json` JSON NULL
- `created_at` DATETIME
- `updated_at` DATETIME

## Email and Operational Logs

### `email_logs`

Purpose:

- records transactional email attempts and outcomes

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `email_type` VARCHAR(100)
- `related_table` VARCHAR(100) NULL
- `related_record_id` BIGINT UNSIGNED NULL
- `recipient_email` VARCHAR(150)
- `recipient_name` VARCHAR(200) NULL
- `subject` VARCHAR(255)
- `status` ENUM('queued','sent','failed') DEFAULT 'queued'
- `provider_message_id` VARCHAR(150) NULL
- `error_message` TEXT NULL
- `sent_at` DATETIME NULL
- `created_at` DATETIME
- `updated_at` DATETIME

### `audit_logs`

Purpose:

- records important admin actions and operational state changes

Suggested columns:

- `id` BIGINT UNSIGNED PK
- `admin_id` BIGINT UNSIGNED NULL FK -> `admins.id`
- `action_type` VARCHAR(100)
- `entity_type` VARCHAR(100)
- `entity_id` BIGINT UNSIGNED NULL
- `description` VARCHAR(255) NULL
- `before_state_json` JSON NULL
- `after_state_json` JSON NULL
- `created_at` DATETIME

## Relationship Summary

Key relationships:

- `roles` 1-to-many `admins`
- `packages` 1-to-many `package_pricing_rules`
- `packages` 1-to-many `package_inclusions`
- `packages` 1-to-many `package_exclusions`
- `packages` 1-to-many `package_payment_plan_items`
- `packages` 1-to-many `package_media`
- `media_assets` 1-to-many `package_media`
- `packages` 1-to-many `bookings`
- `packages` 1-to-many `inquiries`
- `packages` 1-to-many `abandoned_leads`
- `visa_offerings` 1-to-many `visa_applications`
- `visa_offerings` 1-to-many `inquiries`
- `visa_offerings` 1-to-many `abandoned_leads`
- `visa_applications` 1-to-many `payments`

## Suggested Enum and Status Rules

Recommended admin-facing statuses:

### Bookings

- `new`
- `contact_pending`
- `contacted`
- `converted`
- `closed`

### Inquiries

- `new`
- `contact_pending`
- `contacted`
- `closed`

### Abandoned Leads

- `new`
- `contact_pending`
- `contacted`
- `closed`

### Visa Applications

- `submitted`
- `payment_pending`
- `paid`
- `failed`
- `cancelled`

### Payments

- `pending`
- `paid`
- `failed`
- `cancelled`

## Recommended Indexes

At minimum, add indexes for:

- all foreign keys
- `packages.slug`
- `visa_offerings.slug`
- `reviews.source_review_id`
- `bookings.status`
- `bookings.submitted_at`
- `visa_applications.status`
- `visa_applications.submitted_at`
- `payments.status`
- `abandoned_leads.status`
- `inquiries.status`
- `admins.email`

## Flexible JSON Usage

JSON is appropriate for:

- `content_json` in `managed_pages`
- `source_context_json` in submission tables
- `partial_form_json` in `abandoned_leads`
- provider payloads in `payments`
- raw API payloads in `reviews` and `review_sync_logs`
- audit state snapshots

Core business fields should still be stored in normal columns for filtering and reporting.

## Recommended Build Order

Implement the schema in this order:

1. `roles`
2. `admins`
3. `media_assets`
4. `managed_pages`
5. `faqs`
6. `terms_documents`
7. `packages`
8. `package_pricing_rules`
9. `package_inclusions`
10. `package_exclusions`
11. `package_payment_plan_items`
12. `package_media`
13. `visa_offerings`
14. `bookings`
15. `inquiries`
16. `visa_applications`
17. `abandoned_leads`
18. `payments`
19. `reviews`
20. `review_sync_logs`
21. `email_logs`
22. `audit_logs`

## Notes for Implementation

- Use `BIGINT UNSIGNED` IDs if the app is expected to grow over time
- Store timestamps consistently in UTC at the database level
- Use foreign key constraints for core relationships
- Add soft deletes only where there is a clear business reason
- Snapshot important booking and payment context so later admin edits do not rewrite historical submissions

## Open Items

These schema items may still need final confirmation during implementation:

- full email template map and trigger coverage
- exact abandoned-form trigger logic for when partial local form data should be sent to the backend
- whether package categories should use a free-text field or a normalized lookup table in first release

## Summary

This schema plan gives NBGSTRAVEL a relational database structure that matches the actual business workflows instead of recreating WordPress storage patterns.

It supports:

- structured package management
- reliable visa applications with PayFast tracking
- package lead capture without direct payment
- abandoned-form recovery
- automatic Google review syncing
- clear admin operations and auditability
