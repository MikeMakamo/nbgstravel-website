import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { query, getPool } from "../apps/api/src/db/pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const deploymentRoot = path.resolve(projectRoot, "deployment/live-package-sync");
const uploadsSource = path.resolve(projectRoot, "apps/api/uploads/imported/live-packages");

function sqlValue(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "NULL";
  }

  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  return `'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
}

function buildInsert(tableName, columns, rows) {
  if (!rows.length) {
    return `-- ${tableName}: no rows\n`;
  }

  const values = rows
    .map((row) => `(${columns.map((column) => sqlValue(row[column])).join(", ")})`)
    .join(",\n");

  return `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES\n${values};\n`;
}

async function copyDirectory(source, target) {
  await fs.rm(target, { recursive: true, force: true });
  await fs.mkdir(target, { recursive: true });
  await fs.cp(source, target, { recursive: true, force: true });
}

async function main() {
  await fs.rm(deploymentRoot, { recursive: true, force: true });
  await fs.mkdir(deploymentRoot, { recursive: true });

  const packages = await query(`
    SELECT
      id, title, slug, subtitle, short_description, full_description, continent, country, region_name, city_name,
      destination, package_category, trip_type, duration_label, base_price, currency_code, pricing_model,
      quoted_from_label, deposit_amount, has_fixed_travel_dates, fixed_travel_start_date, fixed_travel_end_date,
      booking_enabled, status, sort_order, meta_title, meta_description, admin_meta_json, created_at, updated_at
    FROM packages
    ORDER BY id ASC
  `);
  const inclusions = await query(`
    SELECT id, package_id, item_text, sort_order, created_at, updated_at
    FROM package_inclusions
    ORDER BY package_id ASC, sort_order ASC, id ASC
  `);
  const exclusions = await query(`
    SELECT id, package_id, item_text, sort_order, created_at, updated_at
    FROM package_exclusions
    ORDER BY package_id ASC, sort_order ASC, id ASC
  `);
  const routeStops = await query(`
    SELECT id, package_id, stop_order, continent, country, region_name, city_name, nights_at_stop, note, created_at, updated_at
    FROM package_route_stops
    ORDER BY package_id ASC, stop_order ASC, id ASC
  `);

  const sqlParts = [
    "-- Live package deployment export",
    `-- Generated at ${new Date().toISOString()}`,
    "START TRANSACTION;",
    "SET FOREIGN_KEY_CHECKS = 0;",
    "DELETE FROM package_route_stops;",
    "DELETE FROM package_inclusions;",
    "DELETE FROM package_exclusions;",
    "DELETE FROM package_media;",
    "DELETE FROM package_pricing_rules;",
    "DELETE FROM package_payment_plan_items;",
    "DELETE FROM packages;",
    buildInsert(
      "packages",
      [
        "id",
        "title",
        "slug",
        "subtitle",
        "short_description",
        "full_description",
        "continent",
        "country",
        "region_name",
        "city_name",
        "destination",
        "package_category",
        "trip_type",
        "duration_label",
        "base_price",
        "currency_code",
        "pricing_model",
        "quoted_from_label",
        "deposit_amount",
        "has_fixed_travel_dates",
        "fixed_travel_start_date",
        "fixed_travel_end_date",
        "booking_enabled",
        "status",
        "sort_order",
        "meta_title",
        "meta_description",
        "created_by_admin_id",
        "updated_by_admin_id",
        "admin_meta_json",
        "created_at",
        "updated_at"
      ],
      packages.map((row) => ({
        ...row,
        created_by_admin_id: null,
        updated_by_admin_id: null
      }))
    ),
    buildInsert("package_inclusions", ["id", "package_id", "item_text", "sort_order", "created_at", "updated_at"], inclusions),
    buildInsert("package_exclusions", ["id", "package_id", "item_text", "sort_order", "created_at", "updated_at"], exclusions),
    buildInsert(
      "package_route_stops",
      ["id", "package_id", "stop_order", "continent", "country", "region_name", "city_name", "nights_at_stop", "note", "created_at", "updated_at"],
      routeStops
    ),
    "SET FOREIGN_KEY_CHECKS = 1;",
    "COMMIT;"
  ];

  await fs.writeFile(path.join(deploymentRoot, "package-content.sql"), `${sqlParts.join("\n\n")}\n`);
  await copyDirectory(uploadsSource, path.join(deploymentRoot, "uploads/live-packages"));
  await fs.copyFile(
    path.join(projectRoot, "migration/live-packages/live-packages-import-report.json"),
    path.join(deploymentRoot, "live-packages-import-report.json")
  );

  const readme = `# Live Package Deployment\n\nGenerated: ${new Date().toISOString()}\n\n## Contents\n- \`package-content.sql\`: replaces package-related records with the migrated live NBGS package set.\n- \`uploads/live-packages/\`: imported package gallery and listing images.\n- \`live-packages-import-report.json\`: source verification report from the live WordPress site.\n\n## Deploy Steps\n1. Deploy the latest codebase updates for \`apps/api\`, \`apps/web\`, and \`apps/admin\`.\n2. On the server, run API migrations so route and widened list-item schema changes exist.\n3. Upload the contents of \`uploads/live-packages/\` into \`apps/api/uploads/imported/live-packages/\` on the server.\n4. Import \`package-content.sql\` into the live MySQL database.\n5. Upload the latest \`apps/web/dist\` and \`apps/admin/dist\` bundles.\n6. Verify package count, group trip count, and a few multi-stop routes on the live site.\n\n## Notes\n- This SQL export assumes the target site does not yet have booking records that depend on older package IDs.\n- Package admin ownership columns are set to \`NULL\` in the export to avoid environment-specific admin ID mismatches.\n`;

  await fs.writeFile(path.join(deploymentRoot, "README.md"), readme);

  console.log(`Prepared deployment bundle at ${deploymentRoot}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await getPool().end();
    } catch (error) {
      console.error(error);
    }
  });
