import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { query } from "../db/pool.js";
import { createHttpError } from "../utils/errors.js";
import { slugify } from "@nbgstravel/shared";

const packageSchema = z.object({
  title: z.string().min(3),
  packageCategory: z.string().min(2),
  destination: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  continent: z.string().optional().nullable(),
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
  status: z.enum(["draft", "published", "archived"]).default("draft")
});

export const packageRouter = Router();

packageRouter.get("/admin/list/all", requireAuth, async (req, res, next) => {
  try {
    const rows = await query(
      `
        SELECT id, title, slug, package_category, destination, country, continent, trip_type, duration_label,
               base_price, pricing_model, status, created_at, updated_at
        FROM packages
        ORDER BY updated_at DESC
      `
    );

    res.json({ packages: rows });
  } catch (error) {
    next(error);
  }
});

packageRouter.get("/", async (req, res, next) => {
  try {
    const rows = await query(
      `
        SELECT id, title, slug, package_category, destination, country, continent, trip_type, duration_label, base_price, currency_code,
               pricing_model, quoted_from_label, deposit_amount, has_fixed_travel_dates, fixed_travel_start_date, fixed_travel_end_date,
               short_description, full_description, status, created_at, updated_at
        FROM packages
        WHERE status = 'published'
        ORDER BY sort_order ASC, created_at DESC
      `
    );

    res.json({ packages: rows });
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

    res.json({
      package: {
        ...pkg,
        pricingRules,
        inclusions,
        exclusions,
        media
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
          title, slug, package_category, destination, country, continent, trip_type, duration_label,
          base_price, pricing_model, quoted_from_label, deposit_amount, has_fixed_travel_dates,
          fixed_travel_start_date, fixed_travel_end_date, short_description, full_description, status,
          created_by_admin_id, updated_by_admin_id
        )
        VALUES (
          :title, :slug, :packageCategory, :destination, :country, :continent, :tripType, :durationLabel,
          :basePrice, :pricingModel, :quotedFromLabel, :depositAmount, :hasFixedTravelDates,
          :fixedTravelStartDate, :fixedTravelEndDate, :shortDescription, :fullDescription, :status,
          :adminId, :adminId
        )
      `,
      {
        ...data,
        slug,
        adminId: req.admin.id,
        fixedTravelStartDate: data.fixedTravelStartDate || null,
        fixedTravelEndDate: data.fixedTravelEndDate || null,
        destination: data.destination || null,
        country: data.country || null,
        continent: data.continent || null,
        tripType: data.tripType || null,
        durationLabel: data.durationLabel || null,
        quotedFromLabel: data.quotedFromLabel || null,
        depositAmount: data.depositAmount ?? null,
        shortDescription: data.shortDescription || null,
        fullDescription: data.fullDescription || null
      }
    );

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
        destination: data.destination || null,
        country: data.country || null,
        continent: data.continent || null,
        tripType: data.tripType || null,
        durationLabel: data.durationLabel || null,
        quotedFromLabel: data.quotedFromLabel || null,
        depositAmount: data.depositAmount ?? null,
        shortDescription: data.shortDescription || null,
        fullDescription: data.fullDescription || null
      }
    );

    res.json({ success: true, slug });
  } catch (error) {
    next(error);
  }
});
