import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { query, getPool } from "../apps/api/src/db/pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const uploadRoot = path.resolve(projectRoot, "apps/api/uploads/imported/live-packages");
const REQUEST_TIMEOUT_MS = 30000;
const REQUEST_RETRIES = 2;

function sanitizeFileName(value = "", fallback = "package-image") {
  const extension = path.extname(value).toLowerCase() || ".jpg";
  const baseName =
    path
      .basename(value, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback;

  return `${baseName}${extension}`;
}

async function fetchWithRetry(url, options = {}, retries = REQUEST_RETRIES) {
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
      }

      clearTimeout(timeout);
      return response;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt === retries) {
        break;
      }
    }
  }

  throw lastError;
}

function extractPackageImageUrl(html) {
  const matches = [...html.matchAll(/https:\/\/nbgstravel\.co\.za\/wp-content\/uploads\/[^"'?\s>]+/g)].map((match) => match[0]);

  return (
    matches.find((url) => !/NBGSTRAVEL-NEW-LOGO|elementor\/|\/2025\/05\/NBGSTRAVEL/i.test(url)) ||
    matches.find((url) => !/elementor\/|NBGSTRAVEL-NEW-LOGO/i.test(url)) ||
    null
  );
}

async function downloadImage(slug, sourceUrl) {
  const packageDir = path.join(uploadRoot, slug);
  await fs.mkdir(packageDir, { recursive: true });

  const fileName = `00-${sanitizeFileName(new URL(sourceUrl).pathname, "package-image")}`;
  const targetPath = path.join(packageDir, fileName);
  const response = await fetchWithRetry(sourceUrl);
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(targetPath, buffer);

  return `/uploads/imported/live-packages/${slug}/${fileName}`;
}

async function main() {
  const rows = await query(`
    SELECT id, slug, admin_meta_json
    FROM packages
    WHERE JSON_UNQUOTE(JSON_EXTRACT(admin_meta_json, '$.backgroundListingImage')) IS NULL
       OR JSON_UNQUOTE(JSON_EXTRACT(admin_meta_json, '$.backgroundListingImage')) = ''
       OR JSON_UNQUOTE(JSON_EXTRACT(admin_meta_json, '$.backgroundListingImage')) = 'null'
  `);

  for (const row of rows) {
    const pageUrl = `https://nbgstravel.co.za/nbgs-trips-main/${row.slug}/`;
    const html = await (await fetchWithRetry(pageUrl)).text();
    const imageUrl = extractPackageImageUrl(html);

    if (!imageUrl) {
      console.warn(`No fallback image found for ${row.slug}`);
      continue;
    }

    const relativeUrl = await downloadImage(row.slug, imageUrl);
    const currentMeta = typeof row.admin_meta_json === "string" ? JSON.parse(row.admin_meta_json) : row.admin_meta_json || {};
    const gallery = Array.isArray(currentMeta.gallery) ? currentMeta.gallery.filter(Boolean) : [];
    const nextGallery = gallery.includes(relativeUrl) ? gallery : [relativeUrl, ...gallery];

    await query(
      `
        UPDATE packages
        SET admin_meta_json = :adminMetaJson,
            updated_at = NOW()
        WHERE id = :id
      `,
      {
        id: row.id,
        adminMetaJson: JSON.stringify({
          ...currentMeta,
          backgroundListingImage: relativeUrl,
          gallery: nextGallery
        })
      }
    );

    console.log(`Attached fallback image for ${row.slug}`);
  }
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
