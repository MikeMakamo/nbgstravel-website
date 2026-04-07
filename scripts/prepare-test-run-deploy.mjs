import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputRoot = path.resolve(rootDir, "deployment/client-test-run");
const publicHtmlDir = path.resolve(outputRoot, "public_html");
const adminPublicDir = path.resolve(publicHtmlDir, "admin");
const serverSourceDir = path.resolve(outputRoot, "server-source");
const cpanelAppRootDir = path.resolve(outputRoot, "cpanel-node-app-root");
const databaseDir = path.resolve(outputRoot, "database");
const deployConfig = {
  apiUrl: process.env.DEPLOY_API_URL || "/api",
  webPublicPath: process.env.DEPLOY_WEB_PUBLIC_PATH || "/",
  adminPublicPath: process.env.DEPLOY_ADMIN_PUBLIC_PATH || "/admin/"
};

function runNpm(args, env = {}) {
  const command = `npm ${args.join(" ")}`;

  execSync(command, {
    cwd: rootDir,
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      ...env
    }
  });
}

async function copyRecursive(source, destination) {
  await fs.cp(source, destination, { recursive: true });
}

async function writeText(filePath, contents) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, contents, "utf8");
}

const rootHtaccess = `RewriteEngine On

RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/uploads/
RewriteCond %{REQUEST_URI} !^/admin/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
`;

const adminHtaccess = `RewriteEngine On
RewriteBase /admin/

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /admin/index.html [L]
`;

const deployReadme = `# NBGSTRAVEL Client Test Run Deployment

This folder is the prepared deployment package for a cPanel-style client test run.

## What Is In This Package

- \`public_html/\` contains the public website build and the admin build under \`/admin\`
- \`server-source/\` contains the Node.js API source prepared for cPanel Node.js App
- \`cpanel-node-app-root/\` contains the standalone API app root you can point cPanel at directly
- \`database/migrations/\` contains the schema migration SQL files
- \`database/test_seed.sql\` contains a client demo seed export

## Recommended cPanel Structure

- Public website document root: normal website \`public_html\`
- Admin dashboard URL: \`https://your-domain/admin/\`
- Node.js app root: outside public web root if possible, using \`cpanel-node-app-root/\`
- Node.js startup file: \`src/server.js\`

## API URL Assumption In This Prepared Build

This prepared frontend build currently targets:

- \`${deployConfig.apiUrl}\`

That means the package is ready as-is when the API is reachable from the same site origin at \`/api\`.

Examples:

- Public site: \`https://demo.example.com/\`
- Admin: \`https://demo.example.com/admin/\`
- API: \`https://demo.example.com/api/*\`

If your cPanel Node.js app will instead run on a separate subdomain such as \`https://api.demo.example.com\`, regenerate the package before upload with:

\`\`\`bash
set DEPLOY_API_URL=https://api.demo.example.com/api
npm run prepare:test-run
\`\`\`

## Frontend Upload

Upload the contents of \`public_html\` into the website's public web root.

- \`public_html/\` is the main public website build
- \`public_html/admin/\` is the admin dashboard build

The builds were prepared locally with these assumptions:

- Public site path: \`${deployConfig.webPublicPath}\`
- Admin path: \`${deployConfig.adminPublicPath}\`
- Frontend API target: \`${deployConfig.apiUrl}\`

The included \`.htaccess\` files already handle SPA routing for:

- the main website
- the admin dashboard at \`/admin\`

## Backend Upload

Upload \`cpanel-node-app-root\` to the Node.js app root on cPanel.

Expected startup flow:

1. Create the Node.js app with \`src/server.js\` as the entry file.
2. Set the environment variables from \`.env.example\`.
3. Run \`npm install --omit=dev\` from the uploaded app root.
4. Run \`npm run migrate\`.
5. Run \`npm run seed\`.
6. Start the Node app.

## Suggested cPanel Environment Variables

Set these in the Node.js app environment screen before starting the app:

\`\`\`
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
\`\`\`

If Google review sync is still not needed for the client test run, those Google variables can stay empty.

## Database

Two options are prepared:

1. Preferred: run the backend migration and seed commands.
2. Alternative: import the SQL files from the \`database\` folder using phpMyAdmin or MySQL CLI.

Files:

- \`database/migrations/\` contains the schema SQL files
- \`database/test_seed.sql\` contains client test-run seed data

Preferred order:

1. Create the MySQL database and user in cPanel
2. Set the DB variables in the Node.js app
3. Run migrations from the uploaded Node.js app
4. Run the seed from the uploaded Node.js app

Alternative manual SQL route:

1. Import the SQL files in \`database/migrations/\` in order
2. Import \`database/test_seed.sql\`

## Seeded Admin Access

Default seeded admin login:

- Email: \`admin@nbgstravel.local\`
- Password: \`admin123\`

Change these using the \`SEED_SUPER_ADMIN_*\` environment variables before running the seed in the real test environment.

## Client Test Run Checklist

1. Upload and extract \`client-test-run-public_html.zip\` into the site document root
2. Upload and extract \`client-test-run-cpanel-node-app-root.zip\` into the Node.js app root
3. Create the Node.js app in cPanel using \`src/server.js\`
4. Configure environment variables
5. Run \`npm install --omit=dev\`
6. Run \`npm run migrate\`
7. Run \`npm run seed\`
8. Start or restart the Node.js app
9. Open:
   - public site
   - \`/admin\`
   - \`/health\` on the API app URL if needed
10. Log in to admin and verify packages, bookings, visas, and images

## Important Notes

- This package was prepared locally so the frontend does not need to build on cPanel.
- The deployment folder is intended as a local handoff package and is ignored from git.
- Large JPG assets are still present for the test run. They do not block deployment, but they should be optimized before final production launch.
`;

try {
  await fs.rm(outputRoot, { recursive: true, force: true });
  await fs.mkdir(publicHtmlDir, { recursive: true });
  await fs.mkdir(adminPublicDir, { recursive: true });
  await fs.mkdir(cpanelAppRootDir, { recursive: true });
  await fs.mkdir(databaseDir, { recursive: true });

  runNpm(["run", "migrate"]);
  runNpm(["run", "seed"]);

  runNpm(["run", "build", "--workspace", "apps/web"], {
    NODE_ENV: "production",
    VITE_API_URL: deployConfig.apiUrl,
    VITE_PUBLIC_PATH: deployConfig.webPublicPath,
    BUILD_OUTPUT_DIR: publicHtmlDir
  });

  runNpm(["run", "build", "--workspace", "apps/admin"], {
    NODE_ENV: "production",
    VITE_API_URL: deployConfig.apiUrl,
    VITE_PUBLIC_PATH: deployConfig.adminPublicPath,
    BUILD_OUTPUT_DIR: adminPublicDir
  });

  await writeText(path.resolve(publicHtmlDir, ".htaccess"), rootHtaccess);
  await writeText(path.resolve(adminPublicDir, ".htaccess"), adminHtaccess);

  await fs.mkdir(serverSourceDir, { recursive: true });
  await copyRecursive(path.resolve(rootDir, "apps/api"), path.resolve(serverSourceDir, "apps/api"));
  await fs.rm(path.resolve(serverSourceDir, "apps/api/.env"), { force: true });
  await fs.rm(path.resolve(serverSourceDir, "apps/api/uploads"), { recursive: true, force: true });
  await fs.mkdir(path.resolve(serverSourceDir, "apps/api/uploads/media"), { recursive: true });
  await copyRecursive(path.resolve(rootDir, "packages/shared"), path.resolve(serverSourceDir, "apps/api/vendor/shared"));

  const apiPackagePath = path.resolve(serverSourceDir, "apps/api/package.json");
  const apiPackage = JSON.parse(await fs.readFile(apiPackagePath, "utf8"));
  apiPackage.dependencies = {
    ...apiPackage.dependencies,
    "@nbgstravel/shared": "file:./vendor/shared"
  };
  await fs.writeFile(apiPackagePath, `${JSON.stringify(apiPackage, null, 2)}\n`, "utf8");

  await copyRecursive(path.resolve(serverSourceDir, "apps/api"), cpanelAppRootDir);

  await fs.mkdir(path.resolve(databaseDir, "migrations"), { recursive: true });
  await copyRecursive(path.resolve(rootDir, "apps/api/sql"), path.resolve(databaseDir, "migrations"));

  runNpm(["run", "export:test-seed"]);

  await writeText(path.resolve(outputRoot, "DEPLOY_TEST_RUN.md"), deployReadme);

  console.log(`Prepared test-run deployment package at ${outputRoot}`);
} catch (error) {
  console.error("Failed to prepare test-run deployment package", error);
  process.exit(1);
}
