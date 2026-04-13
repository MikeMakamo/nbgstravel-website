# NBGSTRAVEL Production Deployment

This repo now has one production deployment path.

The live layout is:
- `https://nbgstravel.co.za` for the public site
- `https://admin.nbgstravel.co.za` for the admin
- `https://api.nbgstravel.co.za` for the API

Only the API runs as a Node.js application.
The public site and admin are uploaded as static files.

## 1. Prepare the deployment bundle locally

From the project root:

```bash
npm install
npm run prepare:production
```

That command does all of the following in one pass:
- builds the public site with `https://api.nbgstravel.co.za/api`
- builds the admin with `https://api.nbgstravel.co.za/api`
- copies both static builds into `deployment/production`
- copies the current API uploads into `deployment/production/uploads`
- exports a production-safe copy of the current local database state into `deployment/production/database`

The output folder is:
- `deployment/production`

Important:
- this deployment export keeps the real local content state
- it excludes local transient/test tables like bookings, inquiries, abandoned leads, email logs, audit logs, and review sync logs

## 2. Fresh server setup

Clone or pull the latest repo on the server first.

For cPanel Node.js Application Manager:
- app root: `apps/api`
- startup file: `start.cjs`

Do not point cPanel to `src/server.js` directly.

## 3. API environment

Use:
- `apps/api/.env.production.example`

or the generated copy:
- `deployment/production/api.env.example`

Set real values for:
- `JWT_SECRET`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- SMTP values
- PayFast values

The live URL values should remain:

```text
APP_URL=https://nbgstravel.co.za
ADMIN_URL=https://admin.nbgstravel.co.za
API_PUBLIC_URL=https://api.nbgstravel.co.za/api
```

## 4. API install and schema

Inside `apps/api` on the server:

```bash
npm install --omit=dev
npm run migrate
```

## 5. Restore the production content snapshot

Inside `apps/api` on the server:

```bash
npm run restore:production
```

If you want one command for both schema and content:

```bash
npm run setup:production
```

If you are working from the repo root instead, the same commands are also available there:

```bash
npm run restore:production
npm run setup:production
```

This restores the exact current local app state from:
- `deployment/production/database/production-database.sql`

Do **not** run `npm run seed` afterward unless you intentionally want to re-seed defaults.

The restored SQL already contains the current admin, newsletter, visa, package, and terms data.

Optional fallback:
- you can still import `deployment/production/database/production-database.sql` with phpMyAdmin if you prefer

## 6. Upload API media

Copy:
- `deployment/production/uploads`

into the live API uploads path so it becomes:
- `apps/api/uploads`

This step is required because the imported database references those uploaded files.

## 7. Upload the static frontends

Upload:
- `deployment/production/web-dist` to the main site document root
- `deployment/production/admin-dist` to the admin subdomain document root

These folders already include the SPA rewrite files needed for routing.

## 8. Restart and verify

Restart the Node.js app, then verify:

- `https://api.nbgstravel.co.za/health`
- `https://api.nbgstravel.co.za/api/auth/login`
- `https://nbgstravel.co.za/packages`
- `https://admin.nbgstravel.co.za`

Also verify:
- package count matches the export
- package detail pages show imported images
- multi-stop trips show route stops
- admin newsletter loads without `404`

## 9. Production bundle contents

Authoritative deployment bundle:
- `deployment/production/README.md`
- `deployment/production/api.env.example`
- `deployment/production/database/production-database.sql`
- `deployment/production/database/database-summary.json`
- `deployment/production/uploads/`
- `deployment/production/web-dist/`
- `deployment/production/admin-dist/`

This is the only deployment bundle that should be used going forward.
