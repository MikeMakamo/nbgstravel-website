import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputDir = path.resolve(rootDir, "deployment", "full-local-sync");
const outputFile = path.resolve(outputDir, "full-local-database.sql");
const summaryFile = path.resolve(outputDir, "database-summary.json");

const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "nbgstravel",
  password: process.env.DB_PASSWORD || "nbgstravel",
  database: process.env.DB_NAME || "nbgstravel"
};

const tableOrder = [
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
  "bookings",
  "inquiries",
  "abandoned_leads",
  "reviews",
  "review_sync_logs",
  "media_assets",
  "email_logs",
  "audit_logs",
  "schema_migrations"
];

const deleteOrder = [...tableOrder].reverse();

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

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const pool = mysql.createPool(dbConfig);

  try {
    const counts = {};
    const lines = [
      "-- Full local database state export for NBGSTRAVEL",
      `-- Generated at ${new Date().toISOString()}`,
      "",
      "SET FOREIGN_KEY_CHECKS = 0;",
      ""
    ];

    for (const tableName of deleteOrder) {
      lines.push(`DELETE FROM \`${tableName}\`;`);
    }

    lines.push("");

    for (const tableName of tableOrder) {
      const [rows] = await pool.query(`SELECT * FROM \`${tableName}\``);
      counts[tableName] = rows.length;

      if (!rows.length) {
        continue;
      }

      const columns = Object.keys(rows[0]).map((columnName) => `\`${columnName}\``).join(", ");
      const valueRows = rows
        .map((row) => `(${Object.values(row).map((value) => sqlValue(value)).join(", ")})`)
        .join(",\n");

      lines.push(`INSERT INTO \`${tableName}\` (${columns}) VALUES`);
      lines.push(`${valueRows};`);
      lines.push("");
    }

    lines.push("SET FOREIGN_KEY_CHECKS = 1;");
    lines.push("");

    fs.writeFileSync(outputFile, lines.join("\n"), "utf8");
    fs.writeFileSync(summaryFile, JSON.stringify({ generatedAt: new Date().toISOString(), counts }, null, 2), "utf8");

    console.log(`Wrote full database export to ${outputFile}`);
    console.log(`Wrote summary to ${summaryFile}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
