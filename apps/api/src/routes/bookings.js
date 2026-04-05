import { Router } from "express";
import { z } from "zod";
import { query } from "../db/pool.js";
import { calculatePackageQuote } from "../utils/pricing.js";
import { createHttpError } from "../utils/errors.js";
import { bookingEmailMarkup, sendTransactionalEmail } from "../services/emailService.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const bookingSchema = z.object({
  packageId: z.coerce.number().int().positive(),
  fullName: z.string().min(3),
  phoneNumber: z.string().min(8),
  email: z.string().email(),
  preferredTravelDate: z.string().optional().nullable(),
  numberOfPersons: z.coerce.number().int().min(1),
  sourcePageUrl: z.string().optional().nullable()
});

export const bookingRouter = Router();

bookingRouter.post("/", async (req, res, next) => {
  try {
    const data = bookingSchema.parse(req.body);
    const packages = await query(`SELECT * FROM packages WHERE id = :packageId AND status = 'published' LIMIT 1`, {
      packageId: data.packageId
    });
    const pkg = packages[0];

    if (!pkg) {
      throw createHttpError(404, "Selected package is not available");
    }

    const quotedTotalAmount = calculatePackageQuote(pkg, data.numberOfPersons);

    const result = await query(
      `
        INSERT INTO bookings (
          package_id, full_name, phone_number, email, preferred_travel_date, number_of_persons,
          pricing_model_snapshot, quoted_total_amount, currency_code, source_page_url, source_context_json, submitted_at
        )
        VALUES (
          :packageId, :fullName, :phoneNumber, :email, :preferredTravelDate, :numberOfPersons,
          :pricingModelSnapshot, :quotedTotalAmount, :currencyCode, :sourcePageUrl, :sourceContextJson, NOW()
        )
      `,
      {
        ...data,
        preferredTravelDate: data.preferredTravelDate || null,
        pricingModelSnapshot: pkg.pricing_model,
        quotedTotalAmount,
        currencyCode: pkg.currency_code || "ZAR",
        sourceContextJson: JSON.stringify({
          packageTitle: pkg.title,
          packageSlug: pkg.slug
        })
      }
    );

    const termsRows = await query(
      `SELECT content FROM terms_documents WHERE document_key = 'package_terms' AND is_current = 1 LIMIT 1`
    );
    const terms = termsRows[0]?.content || "";

    const userHtml = bookingEmailMarkup({
      heading: "Your package request has been received",
      intro: `Thank you for your interest in ${pkg.title}. Our team will contact you soon with the next steps.`,
      items: [
        { label: "Package", value: pkg.title },
        { label: "Travelers", value: data.numberOfPersons },
        { label: "Quoted total", value: `${pkg.currency_code || "ZAR"} ${quotedTotalAmount.toFixed(2)}` },
        { label: "Preferred travel date", value: data.preferredTravelDate || "To be confirmed" }
      ],
      terms
    });

    const adminHtml = bookingEmailMarkup({
      heading: "New package booking lead",
      intro: "A new package booking request has been submitted.",
      items: [
        { label: "Package", value: pkg.title },
        { label: "Customer", value: data.fullName },
        { label: "Phone", value: data.phoneNumber },
        { label: "Email", value: data.email },
        { label: "Travelers", value: data.numberOfPersons },
        { label: "Quoted total", value: `${pkg.currency_code || "ZAR"} ${quotedTotalAmount.toFixed(2)}` }
      ],
      terms
    });

    await sendTransactionalEmail({
      emailType: "package_booking_user",
      recipientEmail: data.email,
      recipientName: data.fullName,
      subject: `We received your ${pkg.title} request`,
      html: userHtml,
      relatedTable: "bookings",
      relatedRecordId: result.insertId
    });

    await sendTransactionalEmail({
      emailType: "package_booking_admin",
      recipientEmail: "bookings@nbgstravel.local",
      subject: `New package lead: ${pkg.title}`,
      html: adminHtml,
      relatedTable: "bookings",
      relatedRecordId: result.insertId
    });

    res.status(201).json({
      bookingId: result.insertId,
      quotedTotalAmount,
      message: "Booking lead received"
    });
  } catch (error) {
    next(error);
  }
});

bookingRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const rows = await query(
      `
        SELECT bookings.*, packages.title AS package_title
        FROM bookings
        INNER JOIN packages ON packages.id = bookings.package_id
        ORDER BY bookings.submitted_at DESC
      `
    );

    res.json({ bookings: rows });
  } catch (error) {
    next(error);
  }
});

bookingRouter.patch("/:id/status", requireAuth, requireRole("super_admin", "admin"), async (req, res, next) => {
  try {
    const schema = z.object({
      status: z.enum(["new", "contact_pending", "contacted", "converted", "closed"])
    });
    const { status } = schema.parse(req.body);

    await query(`UPDATE bookings SET status = :status, updated_at = NOW() WHERE id = :id`, {
      status,
      id: req.params.id
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});
