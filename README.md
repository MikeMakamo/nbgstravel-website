# NBGSTRAVEL Platform

Custom rebuild of the NBGSTRAVEL website from WordPress and Elementor into a structured `React + Node.js + MySQL` platform.

## What Is Included

- `apps/api`
  Node and Express backend with auth, packages, visa offerings, bookings, inquiries, abandoned leads, PayFast intent flow, email logging, and Google review sync scaffolding.

- `apps/web`
  Public React site with key marketing pages, package browsing, package booking modal, visa application modal, and WhatsApp floating button.

- `apps/admin`
  Internal React admin dashboard for `Super Admin` and `Admin` workflows.

- `packages/shared`
  Shared constants and formatting helpers.

## Current Status

The project has been scaffolded and the workspace builds successfully.

What is already implemented:

- monorepo tooling
- MySQL schema SQL
- migration runner
- seed script
- API routes and auth foundation
- public frontend structure
- admin dashboard structure
- local storage abandoned-form logic
- automatic review sync scheduler foundation

## Tech Stack

- Frontend: React
- Admin: React
- Backend: Node.js + Express
- Database: MySQL
- Language: JavaScript
- Build tooling: Webpack for the React apps

## Project Structure

```text
apps/
  api/
  web/
  admin/
packages/
  shared/
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment files as needed:

- `apps/api/.env.example`
- `apps/web/.env.example`
- `apps/admin/.env.example`

3. Make sure a MySQL server is running and create a database matching the API environment values.

4. Run migrations:

```bash
npm run migrate
```

5. Seed the initial data:

```bash
npm run seed
```

6. Start the full workspace in development:

```bash
npm run dev
```

## Default Seeded Admin Login

- Email: `admin@nbgstravel.local`
- Password: `admin123`

Change this as soon as the real environment is available.

## Important Notes

- Package bookings are lead submissions only. They do not collect direct online payment.
- Visa applications create a `PayFast` payment intent after the form submission succeeds.
- Abandoned leads are only pushed to the backend once a phone number has been captured.
- Google reviews are designed to sync automatically through the backend scheduler and store locally in MySQL.

## Verification

Verified in this workspace:

- `npm install`
- `npm run build`
- direct import validation of `apps/api/src/app.js`

Not verified here:

- live MySQL migration execution
- seed execution against a real database
- full API runtime with database-backed requests

Those could not be completed in this environment because no local `docker` or confirmed MySQL service was available.

## Key Planning References

- [PROJECT_CONTEXT.md](C:\Users\thand\OneDrive\Desktop\Projects\nbgstravel website\PROJECT_CONTEXT.md)
- [SYSTEM_ARCHITECTURE_PLAN.md](C:\Users\thand\OneDrive\Desktop\Projects\nbgstravel website\SYSTEM_ARCHITECTURE_PLAN.md)
- [DATABASE_SCHEMA_PLAN.md](C:\Users\thand\OneDrive\Desktop\Projects\nbgstravel website\DATABASE_SCHEMA_PLAN.md)
- [DATABASE_MIGRATION_PLAN.md](C:\Users\thand\OneDrive\Desktop\Projects\nbgstravel website\DATABASE_MIGRATION_PLAN.md)
