# NBGSTRAVEL Database Migration Plan

## Purpose

This document converts the approved schema design into an implementation sequence for future MySQL migrations.

It is still part of planning. It does not create the SQL yet, but it defines:

- migration phases
- dependency order
- table creation sequence
- seed data requirements
- post-migration validation steps

This will let the build move into execution cleanly when development starts.

## Migration Strategy

The database should be implemented in layered migrations rather than one large schema dump.

Recommended approach:

1. create foundation tables first
2. create content and package tables
3. create submission and payment tables
4. create operational logging and review tables
5. seed essential records
6. validate relationships and indexes

Benefits:

- easier debugging
- cleaner rollback during development
- clearer ownership of schema changes
- simpler future maintenance

## Migration Naming Convention

Recommended migration naming style:

- `001_create_roles_table`
- `002_create_admins_table`
- `003_create_media_assets_table`

Use three-digit prefixes to keep ordering explicit.

## Phase 1: Foundation

### Migration 001: Create `roles`

Creates:

- `roles`

Purpose:

- establish admin permission levels before user creation

Important constraints:

- unique index on `name`

Seed immediately after migration:

- `super_admin`
- `admin`

### Migration 002: Create `admins`

Creates:

- `admins`

Depends on:

- `roles`

Important constraints:

- unique index on `email`
- foreign key to `roles.id`

### Migration 003: Create `media_assets`

Creates:

- `media_assets`

Depends on:

- `admins`

Purpose:

- prepare media storage metadata before content records begin linking to uploads

## Phase 2: Managed Content

### Migration 004: Create `managed_pages`

Creates:

- `managed_pages`

Purpose:

- supports static and semi-static content blocks if needed in admin

### Migration 005: Create `faqs`

Creates:

- `faqs`

### Migration 006: Create `terms_documents`

Creates:

- `terms_documents`

Purpose:

- supports formal terms/version handling

Important fields to include from the start:

- `document_key`
- `version_label`
- `is_current`

Seed suggestion:

- one active current terms document for package-related submissions
- one active current terms document for visa-related submissions if those differ

## Phase 3: Core Business Content

### Migration 007: Create `packages`

Creates:

- `packages`

Depends on:

- `admins`

Important notes:

- group trips are represented through `package_category` or a similar subtype field
- slug must be unique
- this table should include pricing model, fixed-date support, deposit amount, SEO fields, and status fields

### Migration 008: Create `package_pricing_rules`

Creates:

- `package_pricing_rules`

Depends on:

- `packages`

Purpose:

- supports package-specific pricing logic

### Migration 009: Create `package_inclusions`

Creates:

- `package_inclusions`

Depends on:

- `packages`

### Migration 010: Create `package_exclusions`

Creates:

- `package_exclusions`

Depends on:

- `packages`

### Migration 011: Create `package_payment_plan_items`

Creates:

- `package_payment_plan_items`

Depends on:

- `packages`

Purpose:

- stores package payment notes or installment information for display and agent follow-up

### Migration 012: Create `package_media`

Creates:

- `package_media`

Depends on:

- `packages`
- `media_assets`

## Phase 4: Visa Products and User Submissions

### Migration 013: Create `visa_offerings`

Creates:

- `visa_offerings`

Purpose:

- stores the selectable visa options shown on the website

### Migration 014: Create `bookings`

Creates:

- `bookings`

Depends on:

- `packages`

Purpose:

- stores completed package booking modal submissions

Important notes:

- must snapshot pricing context
- must store quoted total
- must support admin follow-up statuses

### Migration 015: Create `inquiries`

Creates:

- `inquiries`

Depends on:

- `packages`
- `visa_offerings`

Purpose:

- stores generic inquiries outside the package booking modal

### Migration 016: Create `visa_applications`

Creates:

- `visa_applications`

Depends on:

- `visa_offerings`

Purpose:

- stores completed visa modal submissions before and after payment flow

Important notes:

- should include terms version reference if used
- should support submission and payment state tracking

### Migration 017: Create `abandoned_leads`

Creates:

- `abandoned_leads`

Depends on:

- `packages`
- `visa_offerings`

Purpose:

- stores incomplete modal submissions once phone number threshold has been met and the abandonment trigger fires

### Migration 018: Create `payments`

Creates:

- `payments`

Depends on:

- `visa_applications`

Purpose:

- stores `PayFast` payment records for visa applications

## Phase 5: Reviews and Logging

### Migration 019: Create `reviews`

Creates:

- `reviews`

Purpose:

- stores Google reviews in local cache form for frontend rendering

Important constraints:

- unique index on `source_review_id`

### Migration 020: Create `review_sync_logs`

Creates:

- `review_sync_logs`

Purpose:

- tracks automatic review refresh jobs and failures

### Migration 021: Create `email_logs`

Creates:

- `email_logs`

Purpose:

- records email sends and failures for operational debugging

### Migration 022: Create `audit_logs`

Creates:

- `audit_logs`

Depends on:

- `admins`

Purpose:

- tracks meaningful admin-side actions and system changes

## Seed Data Plan

Seed data should be minimal and intentional.

Required first-release seeds:

- `roles`
- initial `super_admin` account
- baseline `terms_documents`

Optional early seeds:

- first package categories if categories later become normalized
- initial FAQ records
- starter visa offerings

## Index Plan

Indexes should be added in the same migration where the table is created unless the chosen migration tool handles them separately.

Minimum indexes required:

- unique index on `admins.email`
- unique index on `packages.slug`
- unique index on `visa_offerings.slug`
- unique index on `reviews.source_review_id`
- foreign key indexes on all relational columns
- status indexes on operational tables
- date or submitted timestamp indexes on booking and visa submission tables

## Foreign Key Policy

Recommended policy:

- use foreign keys for all core parent-child relationships
- prefer `RESTRICT` or `NO ACTION` on critical parent deletes
- use explicit admin workflows instead of cascading destructive deletes blindly

Why:

- packages, reviews, payments, and bookings are business records
- accidental deletes should be hard to perform

## Soft Delete Guidance

Soft deletes should not be added everywhere by default.

Recommended first-release approach:

- use status fields like `archived` or `inactive` for content records
- avoid hard deletion for records tied to business history
- allow true deletion only where operationally safe and intentionally scoped

## Data Integrity Rules

The future SQL implementation should enforce:

- one valid role per admin
- one valid package per booking
- one valid visa offering per visa application
- one valid visa application per payment record
- package booking submissions cannot exist without phone number and email
- abandoned leads cannot be inserted without a phone number
- review source IDs must remain unique

## Migration Validation Checklist

After running all migrations, validate:

1. all tables exist in the expected order
2. all foreign keys are present
3. all unique indexes are active
4. roles are seeded correctly
5. initial super admin can be created
6. package records can be inserted with pricing rules
7. visa application records can link to payments
8. abandoned leads can store partial JSON payloads
9. reviews can be upserted by `source_review_id`
10. audit and email logs can capture operational activity

## Recommended First SQL Milestone

When implementation begins, the first concrete milestone should be:

- foundation migrations
- package schema
- visa schema
- bookings and abandoned leads

That milestone unlocks:

- backend scaffolding
- admin CRUD
- modal form submission APIs
- pricing and booking logic

## Recommended Second SQL Milestone

The second milestone should add:

- payments
- reviews
- review sync logs
- email logs
- audit logs

That milestone unlocks:

- PayFast tracking
- automated review syncing
- operational observability

## Open Items Still Affecting Migration Work

These should be settled before writing the actual SQL files:

- full email template map and event triggers
- final rule for when an abandoned modal form is pushed to backend
- whether package categories remain free text or become a lookup table

## Summary

The migration plan now gives the project a build-ready database sequence.

It confirms:

- group trips belong under packages
- terms handling should be formalized
- reviews stay simple
- first-release schema should focus on actual business operations rather than WordPress-style flexibility

The next logical execution step after this document is the actual SQL table-definition draft or the backend folder/module scaffold that will consume this schema.
