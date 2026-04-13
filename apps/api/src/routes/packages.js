import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { query } from "../db/pool.js";
import { createHttpError } from "../utils/errors.js";
import { slugify } from "../utils/string.js";

const packageAdminMetaSchema = z
  .object({
    travelDateLabel: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
    backgroundListingImage: z.string().optional().nullable(),
    describeTrip: z.string().optional().nullable(),
    tripPolicy: z.string().optional().nullable(),
    gallery: z.array(z.string()).optional(),
    youtubeUrl: z.string().optional().nullable(),
    nights: z.coerce.number().int().nonnegative().optional().nullable(),
    dateOfTrip: z.string().optional().nullable(),
    isLocalTrip: z.coerce.boolean().optional().default(false),
    mainTripType: z.string().optional().nullable(),
    includes: z.array(z.string()).optional(),
    excludes: z.array(z.string()).optional()
  })
  .optional()
  .nullable();

const packageRouteStopSchema = z.object({
  continent: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  regionName: z.string().optional().nullable(),
  cityName: z.string().optional().nullable(),
  nightsAtStop: z.coerce.number().int().nonnegative().optional().nullable(),
  note: z.string().optional().nullable()
});

const packageSchema = z.object({
  title: z.string().min(3),
  packageCategory: z.string().min(2),
  destination: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  continent: z.string().optional().nullable(),
  regionName: z.string().optional().nullable(),
  cityName: z.string().optional().nullable(),
  tripType: z.string().optional().nullable(),
  durationLabel: z.string().optional().nullable(),
  basePrice: z.coerce.number().nonnegative().default(0),
  pricingModel: z.enum(["per_person_sharing", "per_couple", "single_supplement", "child_rate", "custom"]),
  quotedFromLabel: z.string().optional().nullable(),
  depositAmount: z.coerce.number().nonnegative().optional().nullable(),
  hasFixedTravelDates: z.coerce.boolean().default(false),
  fixedTravelStartDate: z.string().optional().nullable(),
  fixedTravelEndDate: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  fullDescription: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  adminMeta: packageAdminMetaSchema,
  routeStops: z.array(packageRouteStopSchema).optional().default([])
});

export const packageRouter = Router();

packageRouter.get("/admin/list/all", requireAuth, async (req, res, next) => {
  try {
    const rows = await query(
      `
        SELECT id, title, slug, package_category, destination, country, continent, trip_type, duration_label,
               region_name, city_name, base_price, pricing_model, status, admin_meta_json, created_at, updated_at
        FROM packages
        ORDER BY updated_at DESC
      `
    );

    const packages = await attachRouteStops(rows);

    res.json({ packages });
  } catch (error) {
    next(error);
  }
});

packageRouter.get("/", async (req, res, next) => {
  try {
    const rows = await query(
      `
        SELECT id, title, slug, package_category, destination, country, continent, region_name, city_name, trip_type, duration_label, base_price, currency_code,
               pricing_model, quoted_from_label, deposit_amount, has_fixed_travel_dates, fixed_travel_start_date, fixed_travel_end_date,
               short_description, full_description, admin_meta_json, status, created_at, updated_at
        FROM packages
        WHERE status = 'published'
        ORDER BY sort_order ASC, created_at DESC
      `
    );

    const packages = await attachRouteStops(rows);

    res.json({ packages });
  } catch (error) {
    next(error);
  }
});

packageRouter.get("/:slug", async (req, res, next) => {
  try {
    const rows = await query(
      `
        SELECT *
        FROM packages
        WHERE slug = :slug
        LIMIT 1
      `,
      { slug: req.params.slug }
    );

    const pkg = rows[0];

    if (!pkg) {
      throw createHttpError(404, "Package not found");
    }

    const pricingRules = await query(
      `SELECT * FROM package_pricing_rules WHERE package_id = :packageId ORDER BY sort_order ASC, id ASC`,
      { packageId: pkg.id }
    );

    const inclusions = await query(
      `SELECT * FROM package_inclusions WHERE package_id = :packageId ORDER BY sort_order ASC, id ASC`,
      { packageId: pkg.id }
    );

    const exclusions = await query(
      `SELECT * FROM package_exclusions WHERE package_id = :packageId ORDER BY sort_order ASC, id ASC`,
      { packageId: pkg.id }
    );

    const media = await query(
      `
        SELECT package_media.id, package_media.usage_type, package_media.sort_order, media_assets.file_path, media_assets.file_url, media_assets.alt_text
        FROM package_media
        INNER JOIN media_assets ON media_assets.id = package_media.media_asset_id
        WHERE package_media.package_id = :packageId
        ORDER BY package_media.sort_order ASC, package_media.id ASC
      `,
      { packageId: pkg.id }
    );

    const routeStops = await query(
      `SELECT * FROM package_route_stops WHERE package_id = :packageId ORDER BY stop_order ASC, id ASC`,
      { packageId: pkg.id }
    );

    res.json({
      package: {
        ...pkg,
        pricingRules,
        inclusions,
        exclusions,
        media,
        routeStops
      }
    });
  } catch (error) {
    next(error);
  }
});

packageRouter.post("/", requireAuth, requireRole("super_admin", "admin"), async (req, res, next) => {
  try {
    const data = packageSchema.parse(req.body);
    const slug = slugify(data.title);

    const result = await query(
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
        ...data,
        slug,
        adminId: req.admin.id,
        fixedTravelStartDate: data.fixedTravelStartDate || null,
        fixedTravelEndDate: data.fixedTravelEndDate || null,
        destination: data.destination || data.cityName || null,
        country: data.country || null,
        continent: data.continent || null,
        regionName: data.regionName || null,
        cityName: data.cityName || data.destination || null,
        tripType: data.tripType || null,
        durationLabel: data.durationLabel || null,
        quotedFromLabel: data.quotedFromLabel || null,
        depositAmount: data.depositAmount ?? null,
        shortDescription: data.shortDescription || null,
        fullDescription: data.fullDescription || null,
        adminMetaJson: JSON.stringify(sanitizeAdminMeta(data.adminMeta))
      }
    );

    await syncPackageMetaLists(result.insertId, data.adminMeta);
    await syncPackageRouteStops(result.insertId, data.routeStops);

    res.status(201).json({ id: result.insertId, slug });
  } catch (error) {
    next(error);
  }
});

packageRouter.put("/:id", requireAuth, requireRole("super_admin", "admin"), async (req, res, next) => {
  try {
    const data = packageSchema.parse(req.body);
    const slug = slugify(data.title);

    await query(
      `
        UPDATE packages
        SET
          title = :title,
          slug = :slug,
          package_category = :packageCategory,
          destination = :destination,
          country = :country,
          continent = :continent,
          region_name = :regionName,
          city_name = :cityName,
          trip_type = :tripType,
          duration_label = :durationLabel,
          base_price = :basePrice,
          pricing_model = :pricingModel,
          quoted_from_label = :quotedFromLabel,
          deposit_amount = :depositAmount,
          has_fixed_travel_dates = :hasFixedTravelDates,
          fixed_travel_start_date = :fixedTravelStartDate,
          fixed_travel_end_date = :fixedTravelEndDate,
          short_description = :shortDescription,
          full_description = :fullDescription,
          status = :status,
          updated_by_admin_id = :adminId,
          admin_meta_json = :adminMetaJson,
          updated_at = NOW()
        WHERE id = :id
      `,
      {
        ...data,
        id: req.params.id,
        slug,
        adminId: req.admin.id,
        fixedTravelStartDate: data.fixedTravelStartDate || null,
        fixedTravelEndDate: data.fixedTravelEndDate || null,
        destination: data.destination || data.cityName || null,
        country: data.country || null,
        continent: data.continent || null,
        regionName: data.regionName || null,
        cityName: data.cityName || data.destination || null,
        tripType: data.tripType || null,
        durationLabel: data.durationLabel || null,
        quotedFromLabel: data.quotedFromLabel || null,
        depositAmount: data.depositAmount ?? null,
        shortDescription: data.shortDescription || null,
        fullDescription: data.fullDescription || null,
        adminMetaJson: JSON.stringify(sanitizeAdminMeta(data.adminMeta))
      }
    );

    await syncPackageMetaLists(req.params.id, data.adminMeta);
    await syncPackageRouteStops(req.params.id, data.routeStops);

    res.json({ success: true, slug });
  } catch (error) {
    next(error);
  }
});

packageRouter.delete("/:id", requireAuth, requireRole("super_admin", "admin"), async (req, res, next) => {
  try {
    const bookingRows = await query(`SELECT COUNT(*) AS count FROM bookings WHERE package_id = :id`, {
      id: req.params.id
    });

    if (Number(bookingRows[0]?.count || 0) > 0) {
      throw createHttpError(400, "This package already has bookings and cannot be deleted. Archive it instead.");
    }

    await query(`DELETE FROM package_pricing_rules WHERE package_id = :id`, { id: req.params.id });
    await query(`DELETE FROM package_inclusions WHERE package_id = :id`, { id: req.params.id });
    await query(`DELETE FROM package_exclusions WHERE package_id = :id`, { id: req.params.id });
    await query(`DELETE FROM package_payment_plan_items WHERE package_id = :id`, { id: req.params.id });
    await query(`DELETE FROM package_route_stops WHERE package_id = :id`, { id: req.params.id });
    await query(`DELETE FROM package_media WHERE package_id = :id`, { id: req.params.id });
    await query(`DELETE FROM packages WHERE id = :id`, { id: req.params.id });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

function sanitizeAdminMeta(adminMeta) {
  const safeMeta = adminMeta || {};

  return {
    travelDateLabel: safeMeta.travelDateLabel || null,
    bio: safeMeta.bio || null,
    backgroundListingImage: safeMeta.backgroundListingImage || null,
    describeTrip: safeMeta.describeTrip || null,
    tripPolicy: safeMeta.tripPolicy || null,
    gallery: Array.isArray(safeMeta.gallery) ? safeMeta.gallery.filter(Boolean) : [],
    youtubeUrl: safeMeta.youtubeUrl || null,
    nights: safeMeta.nights ?? null,
    dateOfTrip: safeMeta.dateOfTrip || null,
    isLocalTrip: Boolean(safeMeta.isLocalTrip),
    mainTripType: safeMeta.mainTripType || null,
    includes: Array.isArray(safeMeta.includes) ? safeMeta.includes.filter(Boolean) : [],
    excludes: Array.isArray(safeMeta.excludes) ? safeMeta.excludes.filter(Boolean) : []
  };
}

async function syncPackageMetaLists(packageId, adminMeta) {
  const safeMeta = sanitizeAdminMeta(adminMeta);

  await query(`DELETE FROM package_inclusions WHERE package_id = :packageId`, { packageId });
  await query(`DELETE FROM package_exclusions WHERE package_id = :packageId`, { packageId });

  for (const [index, itemText] of safeMeta.includes.entries()) {
    await query(
      `INSERT INTO package_inclusions (package_id, item_text, sort_order) VALUES (:packageId, :itemText, :sortOrder)`,
      {
        packageId,
        itemText,
        sortOrder: index
      }
    );
  }

  for (const [index, itemText] of safeMeta.excludes.entries()) {
    await query(
      `INSERT INTO package_exclusions (package_id, item_text, sort_order) VALUES (:packageId, :itemText, :sortOrder)`,
      {
        packageId,
        itemText,
        sortOrder: index
      }
    );
  }
}

function sanitizeRouteStops(routeStops) {
  return (Array.isArray(routeStops) ? routeStops : [])
    .map((stop) => ({
      continent: stop?.continent || null,
      country: stop?.country || null,
      regionName: stop?.regionName || null,
      cityName: stop?.cityName || null,
      nightsAtStop: stop?.nightsAtStop ?? null,
      note: stop?.note || null
    }))
    .filter((stop) => stop.continent || stop.country || stop.regionName || stop.cityName || stop.note || stop.nightsAtStop !== null);
}

async function syncPackageRouteStops(packageId, routeStops) {
  const safeStops = sanitizeRouteStops(routeStops);

  await query(`DELETE FROM package_route_stops WHERE package_id = :packageId`, { packageId });

  for (const [index, stop] of safeStops.entries()) {
    await query(
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
        continent: stop.continent,
        country: stop.country,
        regionName: stop.regionName,
        cityName: stop.cityName,
        nightsAtStop: stop.nightsAtStop,
        note: stop.note
      }
    );
  }
}

async function attachRouteStops(packages) {
  const safePackages = Array.isArray(packages) ? packages : [];

  if (!safePackages.length) {
    return safePackages;
  }

  const params = {};
  const placeholders = safePackages.map((pkg, index) => {
    params[`packageId${index}`] = pkg.id;
    return `:packageId${index}`;
  });

  const routeStops = await query(
    `
      SELECT *
      FROM package_route_stops
      WHERE package_id IN (${placeholders.join(", ")})
      ORDER BY package_id ASC, stop_order ASC, id ASC
    `,
    params
  );

  const routeStopMap = new Map();

  for (const stop of routeStops) {
    if (!routeStopMap.has(stop.package_id)) {
      routeStopMap.set(stop.package_id, []);
    }

    routeStopMap.get(stop.package_id).push(stop);
  }

  return safePackages.map((pkg) => ({
    ...pkg,
    routeStops: routeStopMap.get(pkg.id) || []
  }));
}
