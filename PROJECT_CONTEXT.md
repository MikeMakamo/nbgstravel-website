# NBGSTRAVEL Project Context

## Project Status

- Phase: Planning only
- Code status: No application code started yet
- Goal: Rebuild the current NBGSTRAVEL website from WordPress/Elementor into a custom web application using React, Node.js, JavaScript, and MySQL

## Business Context

NBGSTRAVEL is a South African travel business offering:

- Travel packages
- International group trips
- Visa services
- Custom/private trip support
- Travel planning and transport booking support

The current website already reflects the visual direction approved by the client. The main problem is not the public design. The problem is the backend architecture and content management approach, which currently depends on WordPress, Elementor, dynamic content, and forms that behave inconsistently.

## Core Product Direction

This project is a backend/platform rebuild first, not a redesign.

The public-facing website should remain as close as possible to the current website in:

- layout
- copy structure
- content flow
- visual look and feel
- general frontend behavior

The frontend should be reproduced as closely as possible, effectively word-for-word where applicable, with only selective upgrades where they clearly improve:

- reliability
- maintainability
- form UX
- performance
- admin usability
- mobile consistency

## Current Website Reference

- Primary live site: https://nbgstravel.co.za/

Observed core sections and business functions from the live site:

- Home
- About
- Services
- Packages
- Group Trips
- Visa
- Contact
- FAQs
- Testimonials/reviews
- Previous trips gallery content

## Why the Rebuild Is Needed

The current WordPress implementation has the following issues:

- Elementor and dynamic content make backend behavior fragile
- Some functionality is inconsistent
- Some links and actions are not properly connected
- Forms and dynamic actions are doing too much in a loosely controlled way
- The business needs a dedicated custom system instead of page-builder logic

## Locked Requirements

### Frontend

- The public frontend must match the current site as closely as possible
- The frontend should keep the same general structure and presentation the client already approved
- Small upgrades are allowed only where they add clear value
- For now, a simple floating WhatsApp button is sufficient

### Backend

- The new site must be a custom dedicated system
- All important business actions must be handled by the custom backend
- The system must not depend on Elementor-style dynamic page logic

### Data Storage

- All form submissions must be saved to the database
- All inquiries must be saved to the database
- All bookings must be saved to the database
- All payment records must be saved to the database
- Reviews pulled into the system should be stored or cached in the database for stability and control

### Emails

- The system must send emails to the user
- The system must send emails to admins
- Email notifications should be triggered for inquiries, bookings, and payment-related actions
- Emails should summarize what the user booked or applied for and include relevant details such as terms and conditions
- Formal invoicing will be handled later by the agent, not automatically by the website

### Pricing and Totals

- The system must calculate totals based on the number of persons selected by the user
- Pricing structure depends on the package itself
- Supported pricing structures may include:
  - per person sharing
  - per couple
  - single supplement
  - child rate
  - other package-specific pricing structures where needed
- Deposit values will be entered by the admin
- No automatic deposit formula is required at this stage
- Deposit values may still be stored for package operations or later invoicing workflows, even though package payments are not collected directly on-site

### Payments

- Payment methods no longer need to support EFT
- Package bookings do not require direct online payment through the website
- Visa applications require PayFast payment
- PayFast transactions should be stored and reconciled through backend status handling
- PayFast is explicitly required for visa applications

### Forms and Lead Capture

- The current site uses popup-based inquiry capture in important places
- The new system should keep popup/modal inquiry behavior where appropriate
- Forms should be simpler and cleaner than the current implementation
- Forms must be tied to the page, package, or service they came from

Package booking flow direction:

- user lands on a package page
- user clicks `Book Now`
- popup/modal collects client information
- popup/modal collects preferred travel date except for packages with fixed travel dates such as Afronation-style packages
- popup/modal collects number of people
- system calculates total based on the package pricing structure and traveler count
- no direct package payment is collected on the website
- agent follows up with the user after submission

Visa application flow direction:

- user selects a visa from the visa list
- modal collects user particulars
- modal collects nationality
- modal collects travel date
- modal collects return date
- on submit, the data is sent to admin
- on submit, the user receives confirmation that the request was received
- after submission, the user is redirected to the PayFast payment page

Form recovery and unfinished-form direction:

- when a user starts filling a modal form, the package or visa context and entered data should be saved in local storage
- if the user quits midway, the system should preserve the partial form state
- unfinished form data should only be sent to admin for follow-up once the user has entered a phone number
- this abandoned-form behavior applies to modal-based lead capture and should support agent follow-up

### Anti-Spam

- The new system must reduce spam and bot submissions
- Anti-spam should be implemented without making the user experience difficult
- Planning direction includes:
  - honeypot fields
  - server-side validation
  - rate limiting
  - timing-based checks
  - optional stronger challenges only when necessary

### Reviews

- The site currently uses reviews from the company Google Business profile/page
- The new site should continue showing Google-based reviews
- Reviews should ideally be synced into the system and stored/cached in the database
- The reviews section should preserve the current frontend presentation as closely as possible

### Admin

- The client must have a simple admin panel
- Admin usability should feel as easy as WordPress for the specific tasks they perform
- The goal is not to recreate a page builder
- The goal is to create simple, structured management tools for the actual business workflows

Admin roles required:

- Super Admin: full control over the web app state and high-level operational management without needing to dig deep into the backend
- Admin: client-facing content and operations role for managing packages, visas, bookings, unfinished forms, and create/delete actions as permitted

## Admin Goals

The admin panel should let the client:

- log in securely
- create travel packages
- update travel packages
- upload package media
- publish or unpublish packages
- manage package pricing and deposits
- view inquiries
- view bookings
- view unfinished forms
- manage selected review content if needed
- update basic site-managed content where required

The admin should be form-based and structured, not free-form page-builder based.

Note:

- EFT confirmation is no longer required and should be removed from later implementation planning

## Expected Core Content/Entity Types

These are the likely major entities for the custom platform:

- Admin users
- Packages
- Group trips
- Visa services
- Package categories or continents
- Inquiries
- Bookings
- Travelers
- Payments
- Reviews
- FAQs
- Media assets
- Terms and policies

## Package Management Direction

Travel packages appear to follow repeatable business patterns. The admin should therefore use structured fields rather than freeform content blocks.

Likely package data includes:

- title
- slug
- destination
- country
- continent/category
- trip type
- short description
- full description
- duration
- travel dates
- fixed travel dates flag where applicable
- pricing model
- base price
- package-specific pricing variations where applicable
- number of travelers supported
- total calculation rules
- deposit amount or deposit rule
- inclusions
- exclusions
- payment plan information
- policy notes
- gallery/media
- package status

## Lead and Booking Flow Direction

There are at least two important submission patterns in the future system:

### 1. Quick Inquiry Popup

Used for:

- homepage inquiries
- package interest
- service interest
- simple lead capture

Requirements:

- opens in popup/modal form
- captures lightweight user details
- links the submission to the originating page/package/service
- saves to database
- emails user confirmation
- emails admin notification
- includes anti-spam measures

### 2. Package Booking Flow

Used for:

- package bookings
- traveler count selection
- total calculation

Requirements:

- calculate total based on selected number of persons
- apply the correct pricing structure for that specific package
- store booking records in database
- package bookings are inquiry/lead submissions rather than direct website payments
- notify user and admins
- include booked package details and terms/conditions in relevant emails
- support abandoned-form capture once a phone number has been entered

## Payment Status Direction

Likely payment/booking statuses should include:

- pending
- awaiting agent follow-up
- awaiting visa payment
- paid
- failed
- cancelled

This may expand later based on real business handling.

## Review Integration Direction

Current understanding:

- The site shows Google-based review content
- The current site appears to use a third-party review display layer

Preferred rebuild direction:

- integrate Google business review data in a controlled way
- use the available Google reviews API already held for the business/project
- store or cache review content in the database
- display reviews from the custom app instead of relying entirely on a fragile external widget
- reviews should refresh automatically

## Media Upload Direction

- Media upload flow should remain simple for admins
- Performance matters, but final optimization choices can be refined later when the site approaches production release
- For now, media handling decisions should favor a clean admin workflow and future flexibility

## SEO and URL Preservation

Because the live site already exists, the rebuild should preserve URLs where practical.

Planning direction:

- keep key public routes stable
- avoid unnecessary URL changes
- preserve package and service discoverability
- carry over important SEO metadata where possible

## Technical Direction

Planned stack:

- Frontend: React
- Backend: Node.js
- Language: JavaScript
- Database: MySQL

Architecture direction:

- custom frontend and backend
- structured API-driven content and booking system
- database-backed admin
- no page-builder dependency

## Design Principle

Do not rebuild WordPress flexibility.

Rebuild only the business capabilities NBGSTRAVEL actually needs in a stable, maintainable, custom system.

## Key Project Principle

This project should preserve what already works for the client:

- approved public design
- familiar package browsing flow
- recognizable brand presentation

While replacing what does not work:

- fragile dynamic backend behavior
- inconsistent form handling
- unreliable linking and content relationships
- overdependence on Elementor/plugin logic

## Resolved Planning Decisions

- Package pricing is package-dependent
- Pricing models such as per person sharing, per couple, single supplement, and child rate are valid where the package requires them
- Group trips are not a separate data model and should be handled as a package category/type
- Deposit amounts are entered by admin rather than automatically calculated by a formula
- Package booking starts from the package page via a `Book Now` popup/modal
- Package booking popup fields are:
  - name and surname
  - phone number
  - email
  - preferred travel date, except for packages with fixed travel dates
  - number of persons
- Visa applications are submitted through a modal and then redirect the user to PayFast
- Visa application modal fields are:
  - name and surname
  - phone number
  - nationality
  - number of persons
  - travelling date
  - returning date
- Emails must go to both user and admin
- Emails should summarize the user request and include terms and conditions rather than a PDF invoice
- There will be two admin roles: Super Admin and Admin
- Google reviews API access is already available
- Google reviews should refresh automatically
- Reviews should remain simple as currently displayed, with no extra first-release complexity
- Package bookings do not take EFT or PayFast on-site
- Only visa applications require PayFast payment
- EFT is no longer part of scope
- Partial form state should be saved in local storage
- Abandoned modal forms should be sent to admin only after the user has entered a phone number
- Future homepage and service popups do not need extra fields at this stage
- Terms content should be handled more formally
- Media optimization can be finalized later closer to production

## Known Open Questions

These items are still not fully finalized and should be confirmed during planning:

- full email template list and trigger map
- exact trigger behavior for when an unfinished modal submission is considered abandoned and sent to admin
- final production media optimization strategy

## Recommended Next Planning Steps

1. Define complete sitemap and page inventory from the current website
2. Define exact content model for packages, visa services, FAQs, reviews, and policies
3. Define inquiry, booking, and payment workflows in detail
4. Define admin modules and screen list
5. Define database schema at entity level
6. Define migration strategy from current WordPress data
7. Define SEO and URL preservation plan
8. Confirm payment and review integration details

## Notes For Future Compaction

This file is the primary context anchor for the project before code begins.

If the conversation is compacted later, preserve the following high-level truth:

- NBGSTRAVEL already has an approved frontend design on the live WordPress site
- The rebuild should preserve that frontend closely
- The problem to solve is backend reliability, content structure, forms, payments, and admin simplicity
- The future system must be custom, database-backed, email-enabled, and easier for the client to manage than the current Elementor setup
