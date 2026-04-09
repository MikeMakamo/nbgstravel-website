# NBGSTRAVEL Deployment

This project deploys as:

- static public site from `apps/web/dist`
- static admin site from `apps/admin/dist`
- one running Node.js app from `apps/api`

## 1. Build The Frontends Locally

From the project root:

```bash
npm install
npm run build:deploy
```

That produces:

- `apps/web/dist`
- `apps/admin/dist`

The deploy build bakes the frontend API URL to `/api` by default.

If the API will live on a different domain or subdomain, build with:

```bash
set DEPLOY_API_URL=https://api.your-domain/api
npm run build:deploy
```

If the admin is deployed on its own subdomain, build it at the root path:

```bash
set DEPLOY_API_URL=https://api.your-domain/api
set DEPLOY_ADMIN_PUBLIC_PATH=/
npm run build:deploy
```

If the main website is also deployed under a subpath, you can override that too:

```bash
set DEPLOY_WEB_PUBLIC_PATH=/some-subpath/
```

## 2. Upload Static Files

Upload:

- contents of `apps/web/dist` to your main web root
- contents of `apps/admin/dist` to `/admin`

If the admin is on `admin.your-domain`, upload `apps/admin/dist` to that subdomain root instead.

Both builds include the required `.htaccess` files for SPA routing.

## 3. Deploy The API

Use `apps/api` as the cPanel Node.js app root.

Startup file:

```text
src/server.js
```

Inside the API app root run:

```bash
npm install --omit=dev
npm run migrate
npm run seed
```

## 4. Configure API Environment Variables

Minimum required values:

```text
PORT=3000
APP_URL=https://your-domain
ADMIN_URL=https://your-domain/admin
JWT_SECRET=replace-with-a-long-random-secret

DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password

SEED_SUPER_ADMIN_EMAIL=admin@your-domain
SEED_SUPER_ADMIN_PASSWORD=choose-a-strong-password
SEED_SUPER_ADMIN_FIRST_NAME=System
SEED_SUPER_ADMIN_LAST_NAME=Owner
SEED_SUPER_ADMIN_PHONE=+27000000000
SEED_DEMO_CONTENT=false
```

Optional service variables:

```text
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM="NBGSTRAVEL <no-reply@your-domain>"

PAYFAST_MERCHANT_ID=
PAYFAST_MERCHANT_KEY=
PAYFAST_PASSPHRASE=
PAYFAST_RETURN_URL=https://your-domain/visa/payment-complete
PAYFAST_CANCEL_URL=https://your-domain/visa/payment-cancelled
PAYFAST_NOTIFY_URL=https://your-domain/api/payments/payfast/notify
```

## 5. Seed Behavior

`npm run seed` is now safe for a real server by default.

It creates:

- roles
- super admin account
- terms documents

It does **not** create demo packages or visa offerings unless you explicitly set:

```text
SEED_DEMO_CONTENT=true
```

## 6. Live URL Layout

Expected layout:

- `https://your-domain/` public site
- `https://your-domain/admin/` admin site
- `https://your-domain/api/*` API

Alternative supported layout:

- `https://your-domain/` public site
- `https://admin.your-domain/` admin site
- `https://api.your-domain/` API
