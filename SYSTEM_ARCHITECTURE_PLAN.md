# NBGSTRAVEL System Architecture Plan

## Purpose

This document translates the approved project context into a practical system architecture for the NBGSTRAVEL custom web application.

The goal is to preserve the current public website design and content presentation while replacing the existing WordPress and Elementor backend with a stable, structured, database-backed system using React, Node.js, JavaScript, and MySQL.

This is a planning document only. It does not prescribe final code libraries yet unless the choice directly affects architecture.

## Primary Architectural Goals

- Preserve the public frontend experience as closely as possible to the current site
- Replace dynamic page-builder behavior with structured application logic
- Make package and visa workflows reliable and traceable
- Save all important user actions and submissions to the database
- Give the client a simple admin experience for real business tasks
- Support future scalability without overengineering the first release

## High-Level System Shape

The platform should be split into four core layers:

1. Public frontend
2. Backend API and business logic
3. Admin application
4. Data and integration layer

At a high level:

- The public site renders the marketing pages, package listings, package details, visa pages, and modal forms
- The backend receives and validates all form submissions, writes to MySQL, triggers emails, and coordinates integrations
- The admin interface allows internal users to manage packages, visas, inquiries, bookings, reviews, and application state
- The data layer stores business entities and supports automatic review sync, auditability, and future reporting

## Recommended Application Structure

Recommended overall architecture:

- `React` for the frontend UI
- `Node.js` backend for APIs and business rules
- `MySQL` for persistent structured data
- One shared codebase or monorepo-style workspace for frontend, backend, and admin

Recommended top-level application areas:

- `web` for the public website
- `admin` for the internal dashboard
- `api` for backend services
- `shared` for reusable validation, constants, and types if needed later

This structure keeps responsibilities clear while still allowing shared business rules between the public website and admin.

## Frontend Architecture

## Public Site Responsibilities

The public frontend should handle:

- homepage and content pages
- package listing pages
- package detail pages
- visa listing and detail interactions
- modal inquiry and booking forms
- client-side form state persistence
- WhatsApp floating action button
- display of synced Google reviews

## Frontend Rendering Strategy

Because the site is public-facing and SEO matters, the frontend should use a React architecture that supports strong SEO and fast page delivery.

Recommended direction:

- server-rendered or hybrid-rendered React rather than a purely client-side SPA

Reasoning:

- package pages need to be indexable
- service pages need to preserve current SEO value
- public performance should remain strong
- frontend parity with the existing site is easier to maintain when pages can be rendered predictably

## Frontend State Boundaries

The public frontend should keep state local where possible and only send requests when needed.

Client-side state should cover:

- modal open and close state
- field validation state
- traveler count and on-screen total preview
- local storage recovery for partially filled forms
- user feedback after submission

Server-side persistence should handle:

- successful form submissions
- abandoned form captures that meet the trigger conditions
- review cache data
- page content and package data

## Frontend Route Model

Likely route families:

- `/`
- `/about`
- `/services`
- `/packages`
- `/packages/:slug`
- `/group-trips`
- `/visa`
- `/contact`
- policy and legal pages

Existing live URLs should be preserved wherever practical to reduce SEO disruption and avoid breaking known links.

## Frontend Component Model

The frontend should be built from reusable content-driven sections rather than page-builder-style ad hoc blocks.

Expected component families:

- layout and navigation
- hero sections
- package cards
- package detail sections
- modal forms
- FAQ sections
- review sections
- gallery/media sections
- CTA blocks

Package pages and visa pages should be powered by structured data, even if their visual output mirrors the current WordPress site almost exactly.

## Modal Form Architecture

Two major modal workflows are required.

### Package Booking Modal

Fields:

- name and surname
- phone number
- email
- preferred travel date, except for fixed-date packages
- number of persons

Behavior:

- tied to the specific package page
- stores package context in local storage while user interacts
- updates the displayed quoted total using package pricing rules and traveler count
- submits booking lead data to the backend
- sends confirmation to user and admins
- does not collect payment directly on-site

### Visa Application Modal

Fields:

- name and surname
- phone number
- nationality
- number of persons
- travelling date
- returning date

Behavior:

- tied to the selected visa offering
- saves progress locally while the user is completing the form
- submits application data to backend
- sends confirmation to user and admin
- redirects the user to PayFast after successful submission

## Abandoned Form Handling

The system must support partial form recovery and lead preservation.

Required behavior:

- modal input is saved to local storage during use
- package or visa context is stored with the partial submission
- if the user exits before full submission, the partial lead can still be useful operationally
- the system should only send abandoned lead data to admin once the user has entered a phone number

Architecture implication:

- local storage is the first persistence layer for in-progress forms
- backend endpoints should accept abandoned-form payloads separately from completed submissions
- admin should distinguish between completed submissions and abandoned leads

The exact timing or event trigger for abandoned-form submission is still an open planning item, but the architecture should reserve a dedicated workflow for it.

## Backend Architecture

## Backend Responsibilities

The backend should own:

- authentication and authorization
- package and visa CRUD
- validation of all submissions
- business rules for traveler-based totals
- email sending
- PayFast request coordination and transaction reconciliation
- Google reviews sync
- admin data access
- audit trails and operational status tracking

## API Style

Recommended direction:

- REST-style API for the first release

Reasoning:

- simpler to build and reason about during initial migration
- aligns well with admin CRUD and form submission workflows
- easier to debug operationally for a custom internal project

Possible API domains:

- `/auth`
- `/packages`
- `/group-trips`
- `/visas`
- `/bookings`
- `/inquiries`
- `/abandoned-leads`
- `/payments`
- `/reviews`
- `/admin`
- `/settings`

## Business Logic Separation

The backend should separate:

- request handling
- validation
- service/business logic
- database access
- external integrations

Recommended internal layers:

- controllers or route handlers
- validation layer
- services
- repositories or data access layer
- integration clients

This keeps pricing logic, review sync, email rules, and payment handling out of raw route code.

## Authentication and Authorization

Two admin roles are required:

- `super_admin`
- `admin`

### Super Admin Permissions

- manage the broader operational state of the app
- access system-wide dashboards and health indicators
- manage admin users if included in first release
- review bookings, visas, leads, reviews, and site configuration
- intervene without needing deep backend or database access

### Admin Permissions

- manage packages
- manage visas
- view and handle bookings
- review unfinished forms
- create and delete allowed records
- manage operational submissions within the client scope

Authorization should be role-based and enforced on the backend, not only hidden in the frontend UI.

## Booking and Inquiry Processing

Package bookings are not direct payments. They are lead and booking-intent captures.

Required backend flow for package bookings:

1. Receive package booking modal data
2. Validate user fields and package context
3. Resolve the applicable package pricing structure
4. Calculate quoted total from traveler count
5. Save the submission in the database
6. Trigger user confirmation email
7. Trigger admin notification email
8. Mark the record for agent follow-up

Required backend flow for visa applications:

1. Receive visa modal data
2. Validate form fields and visa selection
3. Save the application in the database
4. Create a payment intent or payable record
5. Trigger user confirmation email
6. Trigger admin notification email
7. Redirect user into the PayFast payment flow
8. Reconcile final payment status through backend handling

## Pricing Logic

Pricing must be package-driven, not globally uniform.

Architecture requirement:

- each package must declare its pricing mode
- pricing mode determines how totals are calculated
- traveler count affects totals according to that pricing mode

Examples of package-configurable pricing patterns:

- per person sharing
- per couple
- single supplement
- child rate
- custom package-specific structures

The pricing engine should be implemented as backend business logic and optionally mirrored client-side for UI preview only.

The backend remains the source of truth for submitted totals.

## Payment Architecture

Only visa applications require direct online payment in scope.

Required payment design:

- `PayFast` integration for visa application payments
- payment record stored before redirect where applicable
- payment status updated after return, callback, or verification flow
- visa application linked to payment record in the database

Package submissions do not require direct online payment in the first release.

## Email Architecture

Emails must be transactional and event-driven.

Expected email categories:

- package booking received
- visa application received
- admin notification for package booking
- admin notification for visa application
- payment confirmation or failure for visa payment
- abandoned lead notification once valid trigger conditions are met

Email content requirements:

- summarize what the user submitted
- include relevant package or visa details
- include terms and conditions where appropriate
- avoid formal invoice generation in this stage

Email sending should be handled asynchronously where possible to keep request handling responsive.

## Google Reviews Integration

The reviews section should not depend entirely on an embedded external widget.

Recommended architecture:

- scheduled backend sync from Google reviews API
- review data normalized and stored in MySQL
- frontend renders reviews from local database cache
- admin can view sync state and optionally hide or feature items later if needed

Automatic sync is required.

Architecture implication:

- backend needs a scheduled task or cron-capable job runner
- review records should include source identifiers and sync timestamps

## Admin Architecture

## Admin Experience Goals

The admin should feel simple and task-oriented, not technical.

The admin UI should be organized around business jobs:

- manage packages
- manage visa offerings
- review incoming leads
- inspect unfinished forms
- monitor visa payments
- monitor review sync
- update key site-managed content

## Admin Modules

Recommended first-release admin modules:

### Dashboard

- counts for new bookings
- counts for visa applications
- counts for unfinished forms
- counts for pending operational actions
- basic review sync visibility

### Packages

- create package
- edit package
- delete package
- draft or publish status
- pricing configuration
- fixed-date package toggle
- media assignment

### Visas

- create visa offering
- edit visa offering
- delete visa offering
- pricing or payable amount setup
- status management

### Bookings

- list package bookings
- filter by package, status, date, or traveler count
- view full lead details
- track agent follow-up state

### Visa Applications

- list visa submissions
- view applicant details
- see linked payment status
- filter by payment state and travel dates

### Unfinished Forms

- list abandoned or partial leads
- distinguish package and visa origin
- show whether phone number was captured
- support follow-up workflows

### Reviews

- view latest synced reviews
- inspect sync state
- optionally mark reviews for display control if later required

### Settings

- site-level contact settings
- admin notification recipients
- terms and conditions content blocks
- integration keys and operational settings if included in admin scope

## Data Architecture

## Core Entities

Likely first-release tables or entity groups:

- admins
- roles
- packages
- package_pricing_rules
- package_media
- group_trips
- visa_offerings
- bookings
- booking_travelers_summary
- visa_applications
- payments
- inquiries
- abandoned_leads
- reviews
- review_sync_logs
- faqs
- pages or managed_content
- media_assets
- email_logs
- audit_logs

The final schema can be refined later, but the architecture should assume normalized business records rather than storing everything as generic JSON blobs.

## Key Entity Relationships

Examples of important relationships:

- one package can have many bookings
- one visa offering can have many visa applications
- one visa application can have one or more payment records if retries are allowed
- one package can have multiple pricing rules
- one package can have multiple media assets
- one abandoned lead can optionally relate to a package or visa offering
- reviews come from an external source but are stored locally

## Auditability

The system should track important state changes such as:

- package creation and edits
- visa offering changes
- booking creation
- payment updates
- review sync runs
- admin-level destructive actions

This will help operationally once the client starts using the platform actively.

## Validation and Security Architecture

## Validation

Validation should exist in both frontend and backend, with backend validation treated as authoritative.

Validation categories:

- required fields
- email and phone formatting
- date sanity checks
- traveler count rules
- package and visa existence checks
- role authorization checks

## Anti-Spam

Anti-spam should be layered.

Recommended strategy:

- honeypot fields
- server-side validation
- request throttling or rate limiting
- timing-based checks for suspiciously fast submissions
- optional escalations later if spam volume demands it

This protects lead quality while keeping the UX light.

## Sensitive Data Handling

The app will collect personal details, so architecture should assume:

- secure transport over HTTPS in production
- secure credential handling
- environment-variable-based secrets management
- restricted admin access
- careful logging that does not expose sensitive data unnecessarily

## Integration Architecture

## PayFast

The backend should integrate with PayFast as a backend-owned payment flow rather than leaving payment state entirely to the client side.

Needs:

- initiate payment flow
- persist payment attempt state
- process verification or callback data
- reconcile status in local records

## Google Reviews API

The reviews integration should be server-side.

Needs:

- secure API credentials
- scheduled synchronization
- deduplication by source identifier
- local persistence

## Email Provider

The architecture should allow a transactional email provider to be plugged into the backend cleanly through a service layer.

Needs:

- templated emails
- admin and user recipient handling
- reliable delivery logging

## Content and Media Architecture

## Content Model Principle

Packages, visas, FAQs, policies, and other managed sections should be stored as structured content.

Do not use a generic visual page-builder approach in the custom system.

## Media Handling

For the first stage:

- support straightforward admin uploads and media assignment
- associate media with packages and other content records
- store enough metadata for later optimization work

Final production image optimization decisions can be deferred, but the architecture should avoid locking us into a poor file model now.

## Operational Architecture

## Background Jobs

The system will likely need background or scheduled processing for:

- Google reviews sync
- email retries or queued sends
- payment reconciliation tasks if needed
- abandoned-form processing if triggered asynchronously

Even if the first version keeps this simple, the architecture should leave room for a small worker or scheduled task layer.

## Logging and Monitoring

At minimum, the app should support:

- request logging
- error logging
- integration error capture
- admin action logging
- review sync logs

Super Admin should have enough visibility into system state to avoid needing raw backend access for common operational issues.

## Deployment Architecture

This can remain flexible for now, but the architecture assumes:

- frontend and backend can be deployed together or separately
- MySQL is hosted in a persistent managed environment
- environment-specific configuration is used for API keys, email settings, and review credentials
- production hosting must support scheduled tasks or an equivalent mechanism for automatic review sync

## Migration Architecture

The migration should be treated as a controlled content and workflow migration rather than a full WordPress behavior clone.

Migration priorities:

1. preserve page structure and URLs
2. extract packages and visa content into structured records
3. recreate current frontend appearance
4. replace forms with custom modal workflows
5. connect admin tools to the new database-driven content model

## Non-Goals For First Release

These items should not drive first-release complexity unless business needs change:

- rebuilding Elementor-like editing freedom
- full invoice generation and PDF automation
- advanced CRM features beyond lead and booking management
- final production-grade media optimization system
- broad multi-role enterprise permissions beyond Super Admin and Admin

## Recommended Initial Build Sequence

1. Finalize sitemap and route inventory from the live site
2. Finalize content schema for packages, visas, reviews, FAQs, and policies
3. Finalize modal submission workflows and email trigger map
4. Define MySQL schema
5. Scaffold backend API and auth
6. Build admin modules for packages, visas, bookings, and unfinished forms
7. Recreate frontend pages with structured data sources
8. Add PayFast visa payment flow
9. Add Google reviews auto-sync
10. Prepare migration and production-hardening tasks

## Summary

The right architecture for NBGSTRAVEL is a structured custom platform with:

- a React-based public frontend that closely mirrors the current approved design
- a Node.js backend that owns business logic, integrations, emails, and operational workflows
- a MySQL data model that stores packages, bookings, visa applications, reviews, and admin-managed content
- a simple but powerful admin interface designed around the client's real daily tasks

This architecture preserves the strength of the current public website while removing the instability caused by WordPress, Elementor, and loosely connected dynamic behavior.
