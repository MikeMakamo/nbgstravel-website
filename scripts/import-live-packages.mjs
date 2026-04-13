import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import { query, getPool } from "../apps/api/src/db/pool.js";
import { packageLocationOverrides, packageRouteOverrides } from "./live-package-overrides.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const uploadRoot = path.resolve(projectRoot, "apps/api/uploads/imported/live-packages");
const reportRoot = path.resolve(projectRoot, "migration/live-packages");
const progressLogPath = path.resolve(projectRoot, "runtime-logs/live-package-import.progress.log");

const LIVE_API = "https://nbgstravel.co.za/wp-json/wp/v2";
const LIVE_SITE = "https://nbgstravel.co.za";
const REQUEST_TIMEOUT_MS = 30000;
const REQUEST_RETRIES = 2;

const verifiedGroupTripSlugs = new Set([
  "afronation-portugal-2026",
  "afronation-portugal-premium-2026-copy",
  "discover-phuket-2026",
  "discover-thailand-2026"
]);

const monthMap = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12
};

function cleanText(value = "") {
  return String(value).replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeLine(value = "") {
  return cleanText(value)
    .replace(/^[✓✔❌*-]+\s*/u, "")
    .replace(/^•\s*/u, "")
    .trim();
}

function htmlToLines(html = "") {
  const $ = cheerio.load(`<div class="root">${html}</div>`);
  $(".root img").each((_, element) => {
    $(element).replaceWith("\n");
  });
  $(".root br").replaceWith("\n");
  $(".root p").each((_, element) => {
    $(element).append("\n");
  });

  return $(".root")
    .text()
    .split(/\n+/)
    .map((line) => normalizeLine(line))
    .filter(Boolean);
}

function parseMoney(value = "") {
  const digits = String(value).replace(/[^0-9.]/g, "");
  return digits ? Number(digits) : 0;
}

function decodeHtml(value = "") {
  const $ = cheerio.load(`<div>${value}</div>`);
  return cleanText($("div").text());
}

function detectPricingModel(value = "") {
  const normalized = value.toLowerCase();

  if (normalized.includes("person") && normalized.includes("sharing")) {
    return "per_person_sharing";
  }
  if (normalized.includes("couple")) {
    return "per_couple";
  }
  if (normalized.includes("single")) {
    return "single_supplement";
  }
  if (normalized.includes("child")) {
    return "child_rate";
  }

  return "custom";
}

function isOwnDatePackage(dateLine = "", travelDateLabel = "") {
  const combined = `${dateLine} ${travelDateLabel}`.toLowerCase();
  return /own date|own dates|choose own|valid till|from\s+\d{1,2}\s+[a-z]{3,}/i.test(combined);
}

function toIsoDate(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function parseExplicitDate(value = "") {
  if (!value || /own dates?/i.test(value)) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return toIsoDate(parsed);
}

function parseMonthToken(token) {
  return monthMap[String(token || "").toLowerCase()] || null;
}

function parseTravelRange(travelDateLabel = "") {
  const label = cleanText(travelDateLabel)
    .replace(/^Travel Dates:\s*/i, "")
    .replace(/\u2013/g, "-")
    .trim();

  if (!label || isOwnDatePackage("", label) || /^from\s+/i.test(label)) {
    return null;
  }

  let match = label.match(/^(\d{1,2})\s+([A-Za-z]+)\s*-\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/i);
  if (match) {
    const [, startDay, startMonthText, endDay, endMonthText, yearText] = match;
    const startMonth = parseMonthToken(startMonthText);
    const endMonth = parseMonthToken(endMonthText);
    const year = Number(yearText);

    if (startMonth && endMonth && year) {
      return {
        start: `${year}-${String(startMonth).padStart(2, "0")}-${String(Number(startDay)).padStart(2, "0")}`,
        end: `${year}-${String(endMonth).padStart(2, "0")}-${String(Number(endDay)).padStart(2, "0")}`
      };
    }
  }

  match = label.match(/^(\d{1,2})\s+([A-Za-z]+)\s*-\s*(\d{1,2})\s+(\d{4})$/i);
  if (match) {
    const [, startDay, monthText, endDay, yearText] = match;
    const month = parseMonthToken(monthText);
    const year = Number(yearText);

    if (month && year) {
      return {
        start: `${year}-${String(month).padStart(2, "0")}-${String(Number(startDay)).padStart(2, "0")}`,
        end: `${year}-${String(month).padStart(2, "0")}-${String(Number(endDay)).padStart(2, "0")}`
      };
    }
  }

  return null;
}

function deriveNightCount(includes, startDate, endDate) {
  const totalFromIncludes = includes.reduce((total, item) => {
    const match = item.match(/(\d+)\s*[- ]?\s*nights?/i);
    return total + (match ? Number(match[1]) : 0);
  }, 0);

  if (totalFromIncludes > 0) {
    return totalFromIncludes;
  }

  if (startDate && endDate) {
    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T00:00:00Z`);
    const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000);
    return diffDays > 0 ? diffDays : null;
  }

  return null;
}

function buildDurationLabel(nights) {
  if (!nights) {
    return "";
  }

  return `${nights} Nights / ${nights + 1} Days`;
}

function buildSummaryCopy(title, location, packageCategory, travelDateLabel, includes) {
  const place = [location.cityName, location.country].filter(Boolean).join(", ") || title;
  const packageLabel = packageCategory === "group_trip" ? "group departure" : "travel package";
  const highlightSnippet = includes.slice(0, 3).join(", ");
  const highlightText = highlightSnippet ? `Highlights include ${highlightSnippet}.` : "";
  const travelText = travelDateLabel ? `Travel window: ${travelDateLabel}.` : "";

  return cleanText(`${title} is a curated NBGS Travel ${packageLabel} centered around ${place}. ${highlightText} ${travelText}`);
}

function buildFullDescription(title, location, pricingLabel, travelDateLabel, includes, policyLines) {
  const locationText = [location.cityName, location.country].filter(Boolean).join(", ") || title;
  const includesText = includes.length ? `Package highlights include ${includes.slice(0, 5).join(", ")}.` : "";
  const policyText = policyLines.slice(0, 4).join(" ");

  return cleanText(
    `${title} is a curated NBGS Travel package for ${locationText}. Pricing is ${pricingLabel.toLowerCase()}. ${travelDateLabel ? `Travel details: ${travelDateLabel}.` : ""} ${includesText} ${policyText}`
  );
}

function inferMainTripType(packageCategory, pricingModel) {
  if (packageCategory === "group_trip") {
    return "Group Trip";
  }

  if (pricingModel === "per_couple") {
    return "Couples";
  }

  return "Package";
}

function inferTripType(packageCategory, pricingModel) {
  if (packageCategory === "group_trip") {
    return "Group Trip";
  }

  if (pricingModel === "per_couple") {
    return "Couples Package";
  }

  return "Travel Package";
}

function buildRouteStops(slug, location, nights) {
  const overrideStops = packageRouteOverrides[slug];

  if (Array.isArray(overrideStops) && overrideStops.length) {
    return overrideStops.map((stop) => ({
      ...stop,
      nightsAtStop: null,
      note: null
    }));
  }

  return [];
}

async function fetchJson(url) {
  const response = await fetchWithRetry(url);
  return response.json();
}

async function fetchText(url) {
  const response = await fetchWithRetry(url);
  return response.text();
}

async function getListingLinkSet(url) {
  const html = await fetchText(url);
  const matches = [...html.matchAll(/https:\/\/nbgstravel\.co\.za\/nbgs-trips-main\/([^/"'\s<>]+)\//g)];
  return new Set(matches.map((match) => match[1]));
}

async function getOptionalListingLinkSet(url, label) {
  try {
    return await getListingLinkSet(url);
  } catch (error) {
    console.warn(`Skipping ${label} listing scrape: ${error.message}`);
    return new Set();
  }
}

async function fetchWithRetry(url, options = {}, retries = REQUEST_RETRIES) {
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

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

function getContinentFallback(slug, continentLinkSets) {
  for (const [continent, slugSet] of Object.entries(continentLinkSets)) {
    if (slugSet.has(slug)) {
      return continent;
    }
  }
  return "";
}

function pickAttachmentUrl(attachment) {
  const sizes = attachment?.media_details?.sizes || {};
  return (
    sizes.large?.source_url ||
    sizes.medium_large?.source_url ||
    sizes.woocommerce_single?.source_url ||
    attachment?.source_url ||
    null
  );
}

function sanitizeFileName(value = "", fallback = "image") {
  const extension = path.extname(value).toLowerCase() || ".jpg";
  const baseName =
    path
      .basename(value, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback;
  return `${baseName}${extension}`;
}

async function downloadPackageImages(slug, attachments) {
  const imageAttachments = attachments.filter((attachment) => attachment.media_type === "image");
  const picked = imageAttachments.slice(0, 6);
  const packageDir = path.join(uploadRoot, slug);
  await fs.mkdir(packageDir, { recursive: true });

  const results = [];

  for (const [index, attachment] of picked.entries()) {
    const sourceUrl = pickAttachmentUrl(attachment);
    if (!sourceUrl) {
      continue;
    }

    const fileName = `${String(index + 1).padStart(2, "0")}-${sanitizeFileName(new URL(sourceUrl).pathname, "package-image")}`;
    const targetPath = path.join(packageDir, fileName);
    const response = await fetchWithRetry(sourceUrl);

    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(targetPath, buffer);

    results.push({
      sourceUrl,
      relativeUrl: `/uploads/imported/live-packages/${slug}/${fileName}`
    });
  }

  return results;
}

async function buildPackageDataset(post, categorySets, continentLinkSets) {
  const html = await fetchText(post.link);
  const attachments = await fetchJson(`${LIVE_API}/media?parent=${post.id}&per_page=100`);
  const $ = cheerio.load(html);
  const root = $("div.elementor-location-single");
  const blocks = root.children("div.elementor-element");

  if (!blocks.length) {
    throw new Error(`Unable to locate package content blocks for ${post.slug}`);
  }

  const summaryValues = blocks
    .eq(1)
    .find(".jet-listing-dynamic-field__content")
    .map((_, element) => cleanText($(element).text()))
    .get()
    .filter(Boolean);

  const title = decodeHtml(post.title.rendered);
  const dateLine = summaryValues.find((value) => /^Date:/i.test(value))?.replace(/^Date:\s*/i, "") || "";
  const feeLine = summaryValues.find((value) => /^Fee:/i.test(value)) || "";
  const pricingLine = summaryValues.find((value) => /person|couple|single|child/i.test(value) && !/:/i.test(value)) || "Custom quote";
  const travelDateLabel = summaryValues.find((value) => /^Travel Dates:/i.test(value))?.replace(/^Travel Dates:\s*/i, "") || dateLine;
  const depositLine = summaryValues.find((value) => /deposit/i.test(value)) || "";

  const contentFields = blocks.eq(3).find(".jet-listing-dynamic-field__content");
  const includes = htmlToLines(contentFields.first().html() || "");
  const exclusions = htmlToLines(contentFields.eq(1).html() || "");
  const tripPolicyLines = htmlToLines(blocks.eq(4).find(".jet-listing-dynamic-field__content").first().html() || "");

  const location = packageLocationOverrides[post.slug];
  if (!location) {
    throw new Error(`Missing location override for ${post.slug}`);
  }

  if (!location.continent) {
    location.continent = getContinentFallback(post.slug, continentLinkSets);
  }

  const packageCategory = categorySets.groupTrips.has(post.slug) ? "group_trip" : "package";
  const pricingModel = detectPricingModel(pricingLine);
  const ownDatePackage = isOwnDatePackage(dateLine, travelDateLabel);
  const fixedRange = ownDatePackage ? null : parseTravelRange(travelDateLabel);
  const fixedStartDate = fixedRange?.start || null;
  const fixedEndDate = fixedRange?.end || null;
  const hasFixedTravelDates = Boolean(categorySets.groupTrips.has(post.slug) && fixedStartDate && fixedEndDate);
  const dateOfTrip = hasFixedTravelDates ? fixedStartDate : parseExplicitDate(dateLine);
  const nights = deriveNightCount(includes, fixedStartDate, fixedEndDate);
  const durationLabel = buildDurationLabel(nights);
  const media = await downloadPackageImages(post.slug, attachments);
  const backgroundListingImage = media[0]?.relativeUrl || "";
  const gallery = media.map((item) => item.relativeUrl);
  const summaryCopy = buildSummaryCopy(title, location, packageCategory, travelDateLabel, includes);
  const fullDescription = buildFullDescription(title, location, pricingLine, travelDateLabel, includes, tripPolicyLines);
  const routeStops = buildRouteStops(post.slug, location, nights);

  return {
    slug: post.slug,
    title,
    packageCategory,
    destination: location.cityName,
    country: location.country,
    continent: location.continent || getContinentFallback(post.slug, continentLinkSets),
    regionName: location.regionName,
    cityName: location.cityName,
    tripType: inferTripType(packageCategory, pricingModel),
    durationLabel,
    basePrice: parseMoney(feeLine),
    pricingModel,
    quotedFromLabel: "From",
    depositAmount: parseMoney(depositLine) || null,
    hasFixedTravelDates,
    fixedTravelStartDate: hasFixedTravelDates ? fixedStartDate : null,
    fixedTravelEndDate: hasFixedTravelDates ? fixedEndDate : null,
    shortDescription: summaryCopy,
    fullDescription,
    status: "published",
    routeStops,
    adminMeta: {
      travelDateLabel: travelDateLabel || null,
      bio: summaryCopy,
      backgroundListingImage: backgroundListingImage || null,
      describeTrip: fullDescription,
      tripPolicy: tripPolicyLines.join("\n"),
      gallery,
      youtubeUrl: null,
      nights: nights || null,
      dateOfTrip: dateOfTrip || null,
      isLocalTrip: location.country === "South Africa",
      mainTripType: inferMainTripType(packageCategory, pricingModel),
      includes,
      excludes: exclusions
    },
    report: {
      sourceUrl: post.link,
      mediaCount: media.length,
      travelDateLabel,
      category: packageCategory,
      location: [location.continent, location.country, location.regionName, location.cityName].filter(Boolean).join(" > "),
      route: routeStops.map((stop) => [stop.continent, stop.country, stop.regionName, stop.cityName].filter(Boolean).join(" > "))
    }
  };
}

async function clearExistingPackages() {
  const [bookingCountRow] = await query("SELECT COUNT(*) AS count FROM bookings");
  if (Number(bookingCountRow?.count || 0) > 0) {
    throw new Error("Bookings exist in the local database. Aborting package replacement to avoid orphaned records.");
  }

  await query("DELETE FROM package_inclusions");
  await query("DELETE FROM package_exclusions");
  await query("DELETE FROM package_media");
  await query("DELETE FROM package_pricing_rules");
  await query("DELETE FROM package_payment_plan_items");
  await query("DELETE FROM package_route_stops");
  await query("DELETE FROM packages");
}

async function insertPackages(datasets) {
  const [admin] = await query("SELECT id FROM admins ORDER BY id ASC LIMIT 1");
  if (!admin?.id) {
    throw new Error("No admin account found to assign imported packages.");
  }

  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    for (const item of datasets) {
      const result = await connection.execute(
        `
          INSERT INTO packages (
            title, slug, package_category, destination, country, continent, region_name, city_name, trip_type, duration_label,
            base_price, pricing_model, quoted_from_label, deposit_amount, has_fixed_travel_dates,
            fixed_travel_start_date, fixed_travel_end_date, short_description, full_description, status,
            created_by_admin_id, updated_by_admin_id, admin_meta_json
          )
          VALUES (
            :title, :slug, :packageCategory, :destination, :country, :continent, :regionName, :cityName, :tripType, :durationLabel,
            :basePrice, :pricingModel, :quotedFromLabel, :depositAmount, :hasFixedTravelDates,
            :fixedTravelStartDate, :fixedTravelEndDate, :shortDescription, :fullDescription, :status,
            :adminId, :adminId, :adminMetaJson
          )
        `,
        {
          ...item,
          adminId: admin.id,
          adminMetaJson: JSON.stringify(item.adminMeta),
          hasFixedTravelDates: item.hasFixedTravelDates ? 1 : 0
        }
      );

      const packageId = result[0].insertId;

      for (const [index, includeText] of item.adminMeta.includes.entries()) {
        await connection.execute(
          `INSERT INTO package_inclusions (package_id, item_text, sort_order) VALUES (:packageId, :itemText, :sortOrder)`,
          {
            packageId,
            itemText: includeText,
            sortOrder: index
          }
        );
      }

      for (const [index, excludeText] of item.adminMeta.excludes.entries()) {
        await connection.execute(
          `INSERT INTO package_exclusions (package_id, item_text, sort_order) VALUES (:packageId, :itemText, :sortOrder)`,
          {
            packageId,
            itemText: excludeText,
            sortOrder: index
          }
        );
      }

      for (const [index, stop] of item.routeStops.entries()) {
        await connection.execute(
          `
            INSERT INTO package_route_stops (
              package_id, stop_order, continent, country, region_name, city_name, nights_at_stop, note
            )
            VALUES (
              :packageId, :stopOrder, :continent, :country, :regionName, :cityName, :nightsAtStop, :note
            )
          `,
          {
            packageId,
            stopOrder: index,
            continent: stop.continent || null,
            country: stop.country || null,
            regionName: stop.regionName || null,
            cityName: stop.cityName || null,
            nightsAtStop: stop.nightsAtStop ?? null,
            note: stop.note || null
          }
        );
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function main() {
  await fs.rm(uploadRoot, { recursive: true, force: true });
  await fs.mkdir(uploadRoot, { recursive: true });
  await fs.mkdir(reportRoot, { recursive: true });
  await fs.mkdir(path.dirname(progressLogPath), { recursive: true });
  await fs.writeFile(progressLogPath, "");

  const posts = await fetchJson(`${LIVE_API}/nbgs-trips-main?per_page=100`);

  const categorySets = {
    groupTrips: verifiedGroupTripSlugs
  };

  const continentLinkSets = {};

  const datasets = [];
  for (const [index, post] of posts.entries()) {
    const progressLine = `Processing ${index + 1}/${posts.length}: ${post.slug}`;
    console.log(progressLine);
    await fs.appendFile(progressLogPath, `${progressLine}\n`);
    datasets.push(await buildPackageDataset(post, categorySets, continentLinkSets));
  }

  console.log("Writing imported package data into the local database...");
  await fs.appendFile(progressLogPath, "Writing imported package data into the local database...\n");
  await clearExistingPackages();
  await insertPackages(datasets);

  const report = {
    generatedAt: new Date().toISOString(),
    packageCount: datasets.length,
    packages: datasets.map((item) => ({
      slug: item.slug,
      title: item.title,
      ...item.report
    }))
  };

  await fs.writeFile(path.join(reportRoot, "live-packages-import-report.json"), JSON.stringify(report, null, 2));
  await fs.appendFile(progressLogPath, `Imported ${datasets.length} live packages into the local build.\n`);

  console.log(`Imported ${datasets.length} live packages into the local build.`);
  console.log(`Report written to ${path.join(reportRoot, "live-packages-import-report.json")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  try {
    await getPool().end();
  } catch (error) {
    console.error(error);
  }
});
