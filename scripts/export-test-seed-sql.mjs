import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const apiDir = path.resolve(rootDir, "apps/api");
const outputFile = path.resolve(rootDir, "deployment/client-test-run/database/test_seed.sql");

process.chdir(apiDir);

const { query, getPool } = await import(pathToFileURL(path.resolve(apiDir, "src/db/pool.js")).href);

const tableExports = [
  {
    name: "roles",
    selectSql: "SELECT * FROM roles ORDER BY id ASC"
  },
  {
    name: "admins",
    selectSql: "SELECT * FROM admins ORDER BY id ASC"
  },
  {
    name: "terms_documents",
    selectSql: "SELECT * FROM terms_documents ORDER BY id ASC"
  },
  {
    name: "packages",
    selectSql: "SELECT * FROM packages WHERE title NOT LIKE 'Sample Admin Link Check%' ORDER BY id ASC"
  },
  {
    name: "package_inclusions",
    selectSql: `
      SELECT package_inclusions.*
      FROM package_inclusions
      INNER JOIN packages ON packages.id = package_inclusions.package_id
      WHERE packages.title NOT LIKE 'Sample Admin Link Check%'
      ORDER BY package_inclusions.id ASC
    `
  },
  {
    name: "package_exclusions",
    selectSql: `
      SELECT package_exclusions.*
      FROM package_exclusions
      INNER JOIN packages ON packages.id = package_exclusions.package_id
      WHERE packages.title NOT LIKE 'Sample Admin Link Check%'
      ORDER BY package_exclusions.id ASC
    `
  },
  {
    name: "visa_offerings",
    selectSql: "SELECT * FROM visa_offerings ORDER BY id ASC"
  }
];

const clearOrder = [
  "package_exclusions",
  "package_inclusions",
  "packages",
  "visa_offerings",
  "terms_documents",
  "admins",
  "roles"
];

function escapeValue(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "NULL";
  }

  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  if (value instanceof Date) {
    return `'${formatDate(value)}'`;
  }

  if (typeof value === "object") {
    return `'${escapeString(JSON.stringify(value))}'`;
  }

  return `'${escapeString(String(value))}'`;
}

function escapeString(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const pad = (part) => String(part).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join("-") + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

try {
  const exportsData = [];

  for (const table of tableExports) {
    const rows = await query(table.selectSql);
    exportsData.push({ ...table, rows });
  }

  const lines = [
    "-- NBGSTRAVEL client test-run seed data",
    "-- Import this after the schema migrations have already been applied.",
    "SET FOREIGN_KEY_CHECKS=0;",
    ""
  ];

  for (const tableName of clearOrder) {
    lines.push(`DELETE FROM ${tableName};`);
  }

  lines.push("");

  for (const table of exportsData) {
    if (!table.rows.length) {
      continue;
    }

    const columns = Object.keys(table.rows[0]);
    const columnList = columns.map((column) => `\`${column}\``).join(", ");
    const valueRows = table.rows.map((row) => `(${columns.map((column) => escapeValue(row[column])).join(", ")})`);

    lines.push(`INSERT INTO ${table.name} (${columnList}) VALUES`);
    lines.push(`${valueRows.join(",\n")};`);
    lines.push("");
  }

  lines.push("SET FOREIGN_KEY_CHECKS=1;");
  lines.push("");

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, `${lines.join("\n")}\n`, "utf8");
  console.log(`Wrote ${outputFile}`);
} finally {
  await getPool().end();
}
