import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const deploymentDir = path.resolve(rootDir, "deployment", "production");
const databaseDir = path.resolve(deploymentDir, "database");
const uploadsDir = path.resolve(deploymentDir, "uploads");
const webDir = path.resolve(deploymentDir, "web-dist");
const adminDir = path.resolve(deploymentDir, "admin-dist");
const readmePath = path.resolve(deploymentDir, "README.md");
const envExamplePath = path.resolve(deploymentDir, "api.env.example");
const summaryPath = path.resolve(databaseDir, "database-summary.json");
const sqlPath = path.resolve(databaseDir, "production-database.sql");

const productionConfig = {
  appUrl: process.env.PROD_APP_URL || "https://nbgstravel.co.za",
  adminUrl: process.env.PROD_ADMIN_URL || "https://admin.nbgstravel.co.za",
  apiOrigin: process.env.PROD_API_ORIGIN || "https://api.nbgstravel.co.za",
  apiUrl: process.env.PROD_API_URL || "https://api.nbgstravel.co.za/api",
  webPublicPath: process.env.PROD_WEB_PUBLIC_PATH || "/",
  adminPublicPath: process.env.PROD_ADMIN_PUBLIC_PATH || "/"
};

const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "nbgstravel",
  password: process.env.DB_PASSWORD || "nbgstravel",
  database: process.env.DB_NAME || "nbgstravel"
};

const localUploadsAbsolutePath = path.resolve(rootDir, "apps", "api", "uploads");

const includedTables = [
  "roles",
  "admins",
  "terms_documents",
  "managed_pages",
  "faqs",
  "newsletter_lists",
  "newsletter_templates",
  "newsletter_subscribers",
  "newsletter_list_subscribers",
  "newsletter_campaigns",
  "newsletter_campaign_recipients",
  "visa_offerings",
  "visa_applications",
  "payments",
  "packages",
  "package_route_stops",
  "package_pricing_rules",
  "package_payment_plan_items",
  "package_media",
  "package_inclusions",
  "package_exclusions",
  "media_assets",
  "schema_migrations"
];

const deleteOrder = [...includedTables].reverse();
const excludedTables = ["bookings", "inquiries", "abandoned_leads", "reviews", "review_sync_logs", "email_logs", "audit_logs"];

function run(command, env = {}) {
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

function resetDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDir(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
  fs.cpSync(sourceDir, targetDir, { recursive: true, force: true });
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDateTime(date) {
  return `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function sanitizeString(value) {
  let result = String(value);

  const replacements = [
    ["http://localhost:4000/api", productionConfig.apiUrl],
    ["http://localhost:4000/uploads", `${productionConfig.apiOrigin}/uploads`],
    ["http://localhost:4000", productionConfig.apiOrigin],
    ["http://localhost:5174", productionConfig.adminUrl],
    ["http://localhost:5173", productionConfig.appUrl]
  ];

  for (const [from, to] of replacements) {
    result = result.split(from).join(to);
  }

  const windowsUploadsPrefix = `${localUploadsAbsolutePath}\\`;
  const windowsUploadsIndex = result.indexOf(windowsUploadsPrefix);

  if (windowsUploadsIndex >= 0) {
    result = `/uploads/${result.slice(windowsUploadsIndex + windowsUploadsPrefix.length).replace(/\\/g, "/")}`;
  }

  const uploadsPathIndex = result.toLowerCase().indexOf("\\uploads\\");

  if (uploadsPathIndex >= 0) {
    result = result.slice(uploadsPathIndex).replace(/\\/g, "/");
  }

  return result;
}

function sanitizeValue(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Date) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeValue(item)]));
  }

  if (typeof value === "string") {
    return sanitizeString(value);
  }

  return value;
}

function sqlValue(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (value instanceof Date) {
    const hasTime =
      value.getHours() !== 0 || value.getMinutes() !== 0 || value.getSeconds() !== 0 || value.getMilliseconds() !== 0;
    return `'${hasTime ? formatDateTime(value) : formatDate(value)}'`;
  }

  if (Buffer.isBuffer(value)) {
    return `X'${value.toString("hex")}'`;
  }

  if (Array.isArray(value) || isPlainObject(value)) {
    return `'${JSON.stringify(value).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
  }

  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "NULL";
  }

  return `'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
}

function buildDeploymentReadme(counts) {
  return `# Production Deployment

This folder is the single deployment source for a fresh NBGSTRAVEL server setup.

Included:
- \`web-dist/\` static public site build
- \`admin-dist/\` static admin build
- \`uploads/\` matching API upload files
- \`database/production-database.sql\` production-safe export of the current local application state
- \`database/database-summary.json\` expected row counts after import
- \`api.env.example\` starter API environment template

Current content snapshot:
- ${counts.packages || 0} packages
- ${counts.package_route_stops || 0} route stops
- ${counts.package_inclusions || 0} package inclusions
- ${counts.package_exclusions || 0} package exclusions
- ${counts.visa_offerings || 0} visa offerings
- ${counts.newsletter_templates || 0} newsletter templates

Fresh-server deployment order:
1. Pull the latest repo on the server.
2. Create the cPanel Node.js application with:
   - app root: \`apps/api\`
   - startup file: \`start.cjs\`
3. Create the API environment file from \`api.env.example\`.
4. In \`apps/api\`, run:
   - \`npm install --omit=dev\`
   - \`npm run migrate\`
5. If needed while debugging, temporarily set \`DIAGNOSTICS_TOKEN\` and call:
   - \`GET /api/diagnostics/runtime\`
   - header: \`x-diagnostics-token: <DIAGNOSTICS_TOKEN>\`
6. Restore the production content snapshot:
   - \`npm run restore:production\`
   - or \`npm run setup:production\` to run migrate + restore in one go
7. Copy \`uploads/\` into the live API uploads folder so it becomes \`apps/api/uploads/\`.
8. Upload \`web-dist/\` to the main domain document root.
9. Upload \`admin-dist/\` to the admin subdomain document root.
10. Restart the Node.js app.

Notes:
- This export intentionally excludes local test/log tables like bookings, inquiries, abandoned leads, email logs, and review sync logs.
- The imported content keeps the current local package set and matching uploads.
- Do not run \`npm run seed\` afterward unless you intentionally want to re-seed defaults.
- If you prefer a manual fallback, \`database/production-database.sql\` can still be imported with phpMyAdmin.
- Remove or blank \`DIAGNOSTICS_TOKEN\` after live debugging is complete.
`;
}

function buildApiEnvExample() {
  return `APP_URL=${productionConfig.appUrl}
ADMIN_URL=${productionConfig.adminUrl}
API_PUBLIC_URL=${productionConfig.apiUrl}
JWT_SECRET=replace-with-a-long-random-secret
DIAGNOSTICS_TOKEN=temporary-debug-token-remove-after-use

DB_HOST=localhost
DB_PORT=3306
DB_NAME=replace_with_database_name
DB_USER=replace_with_database_user
DB_PASSWORD=replace_with_database_password

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM="NBGSTRAVEL <no-reply@nbgstravel.co.za>"

PAYFAST_MERCHANT_ID=
PAYFAST_MERCHANT_KEY=
PAYFAST_PASSPHRASE=
PAYFAST_RETURN_URL=${productionConfig.appUrl}/visa/payment-complete
PAYFAST_CANCEL_URL=${productionConfig.appUrl}/visa/payment-cancelled
PAYFAST_NOTIFY_URL=${productionConfig.apiUrl}/payments/payfast/notify
`;
}

async function exportDatabase() {
  const pool = mysql.createPool(dbConfig);

  try {
    const counts = {};
    const lines = [
      "-- NBGSTRAVEL production deployment export",
      `-- Generated at ${new Date().toISOString()}`,
      "-- This export excludes volatile local test/log tables.",
      "",
      "SET FOREIGN_KEY_CHECKS = 0;",
      ""
    ];

    for (const tableName of deleteOrder) {
      lines.push(`DELETE FROM \`${tableName}\`;`);
    }

    lines.push("");

    for (const tableName of includedTables) {
      const [rows] = await pool.query(`SELECT * FROM \`${tableName}\``);
      counts[tableName] = rows.length;

      if (!rows.length) {
        continue;
      }

      const sanitizedRows = rows.map((row) => sanitizeValue(row));
      const columns = Object.keys(sanitizedRows[0]).map((columnName) => `\`${columnName}\``).join(", ");
      const valueRows = sanitizedRows
        .map((row) => `(${Object.values(row).map((value) => sqlValue(value)).join(", ")})`)
        .join(",\n");

      lines.push(`INSERT INTO \`${tableName}\` (${columns}) VALUES`);
      lines.push(`${valueRows};`);
      lines.push("");
    }

    lines.push("SET FOREIGN_KEY_CHECKS = 1;");
    lines.push("");

    fs.writeFileSync(sqlPath, lines.join("\n"), "utf8");
    fs.writeFileSync(
      summaryPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          counts,
          excludedTables
        },
        null,
        2
      ),
      "utf8"
    );

    return counts;
  } finally {
    await pool.end();
  }
}

async function main() {
  resetDir(deploymentDir);
  fs.mkdirSync(databaseDir, { recursive: true });

  run("npm run build:deploy", {
    DEPLOY_API_URL: productionConfig.apiUrl,
    DEPLOY_WEB_PUBLIC_PATH: productionConfig.webPublicPath,
    DEPLOY_ADMIN_PUBLIC_PATH: productionConfig.adminPublicPath
  });

  copyDir(path.resolve(rootDir, "apps", "web", "dist"), webDir);
  copyDir(path.resolve(rootDir, "apps", "admin", "dist"), adminDir);
  copyDir(path.resolve(rootDir, "apps", "api", "uploads"), uploadsDir);

  const counts = await exportDatabase();

  fs.writeFileSync(readmePath, buildDeploymentReadme(counts), "utf8");
  fs.writeFileSync(envExamplePath, buildApiEnvExample(), "utf8");

  console.log("Prepared production deployment bundle:");
  console.log(`- ${deploymentDir}`);
  console.log(`- Web build copied to ${webDir}`);
  console.log(`- Admin build copied to ${adminDir}`);
  console.log(`- Uploads copied to ${uploadsDir}`);
  console.log(`- Database export written to ${sqlPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
