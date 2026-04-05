import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { query } from "../db/pool.js";
import { slugify } from "@nbgstravel/shared";
import { sendTransactionalEmail, bookingEmailMarkup } from "../services/emailService.js";

const visaSchema = z.object({
  title: z.string().min(2),
  country: z.string().min(2),
  processingTimeLabel: z.string().optional().nullable(),
  applicationFee: z.coerce.number().nonnegative(),
  description: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft")
});

const visaApplicationSchema = z.object({
  visaOfferingId: z.coerce.number().int().positive(),
  fullName: z.string().min(3),
  phoneNumber: z.string().min(8),
  nationality: z.string().min(2),
  numberOfPersons: z.coerce.number().int().min(1),
  travelDate: z.string(),
  returnDate: z.string(),
  sourcePageUrl: z.string().optional().nullable()
});

export const visaRouter = Router();

visaRouter.get("/", async (req, res, next) => {
  try {
    const rows = await query(
      `
        SELECT id, title, slug, country, processing_time_label, application_fee, currency_code, description, status
        FROM visa_offerings
        WHERE status = 'published'
        ORDER BY sort_order ASC, created_at DESC
      `
    );

    res.json({ visas: rows });
  } catch (error) {
    next(error);
  }
});

visaRouter.get("/admin/list/all", requireAuth, async (req, res, next) => {
  try {
    const rows = await query(
      `
        SELECT id, title, slug, country, processing_time_label, application_fee, currency_code, description, status
        FROM visa_offerings
        ORDER BY updated_at DESC
      `
    );

    res.json({ visas: rows });
  } catch (error) {
    next(error);
  }
});

visaRouter.get("/applications", requireAuth, async (req, res, next) => {
  try {
    const rows = await query(
      `
        SELECT visa_applications.*, visa_offerings.title AS visa_title
        FROM visa_applications
        INNER JOIN visa_offerings ON visa_offerings.id = visa_applications.visa_offering_id
        ORDER BY visa_applications.submitted_at DESC
      `
    );

    res.json({ applications: rows });
  } catch (error) {
    next(error);
  }
});

visaRouter.post("/applications", async (req, res, next) => {
  try {
    const data = visaApplicationSchema.parse(req.body);

    const visas = await query(`SELECT * FROM visa_offerings WHERE id = :id AND status = 'published' LIMIT 1`, {
      id: data.visaOfferingId
    });

    const visa = visas[0];

    if (!visa) {
      return res.status(404).json({ message: "Selected visa is not available" });
    }

    const termsRows = await query(
      `SELECT version_label, content FROM terms_documents WHERE document_key = 'visa_terms' AND is_current = 1 LIMIT 1`
    );
    const currentTerms = termsRows[0];

    const result = await query(
      `
        INSERT INTO visa_applications (
          visa_offering_id, full_name, phone_number, nationality, number_of_persons,
          travel_date, return_date, terms_version, source_page_url, source_context_json, submitted_at
        )
        VALUES (
          :visaOfferingId, :fullName, :phoneNumber, :nationality, :numberOfPersons,
          :travelDate, :returnDate, :termsVersion, :sourcePageUrl, :sourceContextJson, NOW()
        )
      `,
      {
        ...data,
        termsVersion: currentTerms?.version_label || "v1",
        sourcePageUrl: data.sourcePageUrl || null,
        sourceContextJson: JSON.stringify({
          visaTitle: visa.title,
          visaSlug: visa.slug
        })
      }
    );

    const items = [
      { label: "Visa", value: visa.title },
      { label: "Nationality", value: data.nationality },
      { label: "Travelers", value: data.numberOfPersons },
      { label: "Travel date", value: data.travelDate },
      { label: "Return date", value: data.returnDate }
    ];

    await sendTransactionalEmail({
      emailType: "visa_application_admin",
      recipientEmail: "visas@nbgstravel.local",
      subject: `New visa request: ${visa.title}`,
      html: bookingEmailMarkup({
        heading: "New visa application submitted",
        intro: "A new visa application was submitted through the website.",
        items: [{ label: "Applicant", value: data.fullName }, { label: "Phone", value: data.phoneNumber }, ...items],
        terms: currentTerms?.content || null
      }),
      relatedTable: "visa_applications",
      relatedRecordId: result.insertId
    });

    res.status(201).json({
      visaApplicationId: result.insertId,
      amount: visa.application_fee,
      visaTitle: visa.title,
      message: "Visa application received"
    });
  } catch (error) {
    next(error);
  }
});

visaRouter.post("/", requireAuth, requireRole("super_admin", "admin"), async (req, res, next) => {
  try {
    const data = visaSchema.parse(req.body);
    const slug = slugify(data.title);

    const result = await query(
      `
        INSERT INTO visa_offerings (title, slug, country, processing_time_label, application_fee, description, status)
        VALUES (:title, :slug, :country, :processingTimeLabel, :applicationFee, :description, :status)
      `,
      {
        ...data,
        slug,
        processingTimeLabel: data.processingTimeLabel || null,
        description: data.description || null
      }
    );

    res.status(201).json({ id: result.insertId, slug });
  } catch (error) {
    next(error);
  }
});

visaRouter.put("/:id", requireAuth, requireRole("super_admin", "admin"), async (req, res, next) => {
  try {
    const data = visaSchema.parse(req.body);
    const slug = slugify(data.title);

    await query(
      `
        UPDATE visa_offerings
        SET title = :title,
            slug = :slug,
            country = :country,
            processing_time_label = :processingTimeLabel,
            application_fee = :applicationFee,
            description = :description,
            status = :status,
            updated_at = NOW()
        WHERE id = :id
      `,
      {
        ...data,
        id: req.params.id,
        slug,
        processingTimeLabel: data.processingTimeLabel || null,
        description: data.description || null
      }
    );

    res.json({ success: true, slug });
  } catch (error) {
    next(error);
  }
});
