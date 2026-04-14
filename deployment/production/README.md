# Production Deployment

This folder is the single deployment source for a fresh NBGSTRAVEL server setup.

Included:
- `web-dist/` static public site build
- `admin-dist/` static admin build
- `uploads/` matching API upload files
- `database/production-database.sql` production-safe export of the current local application state
- `database/database-summary.json` expected row counts after import
- `api.env.example` starter API environment template

Current content snapshot:
- 34 packages
- 18 route stops
- 215 package inclusions
- 149 package exclusions
- 6 visa offerings
- 5 newsletter templates

Fresh-server deployment order:
1. Pull the latest repo on the server.
2. Create the cPanel Node.js application with:
   - app root: `apps/api`
   - startup file: `start.cjs`
3. Create the API environment file from `api.env.example`.
4. In `apps/api`, run:
   - `npm install --omit=dev`
   - `npm run migrate`
5. If needed while debugging, temporarily set `DIAGNOSTICS_TOKEN` and call:
   - `GET /api/diagnostics/runtime`
   - header: `x-diagnostics-token: <DIAGNOSTICS_TOKEN>`
6. Restore the production content snapshot:
   - `npm run restore:production`
   - or `npm run setup:production` to run migrate + restore in one go
7. Copy `uploads/` into the live API uploads folder so it becomes `apps/api/uploads/`.
8. Upload `web-dist/` to the main domain document root.
9. Upload `admin-dist/` to the admin subdomain document root.
10. Restart the Node.js app.

Notes:
- This export intentionally excludes local test/log tables like bookings, inquiries, abandoned leads, email logs, and review sync logs.
- The imported content keeps the current local package set and matching uploads.
- Do not run `npm run seed` afterward unless you intentionally want to re-seed defaults.
- If you prefer a manual fallback, `database/production-database.sql` can still be imported with phpMyAdmin.
- Remove or blank `DIAGNOSTICS_TOKEN` after live debugging is complete.
