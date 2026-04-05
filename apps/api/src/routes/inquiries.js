import { Router } from "express";
import { z } from "zod";
import { query } from "../db/pool.js";
import { sendTransactionalEmail, bookingEmailMarkup } from "../services/emailService.js";
import { requireAuth } from "../middleware/auth.js";

const inquirySchema = z.object({
  inquiryType: z.enum(["homepage", "package", "service", "contact", "general"]),
  packageId: z.coerce.number().int().positive().optional().nullable(),
  visaOfferingId: z.coerce.number().int().positive().optional().nullable(),
  fullName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  message: z.string().optional().nullable(),
  sourcePageUrl: z.string().optional().nullable()
});

export const inquiryRouter = Router();

inquiryRouter.post("/", async (req, res, next) => {
  try {
    const data = inquirySchema.parse(req.body);

    const result = await query(
      `
        INSERT INTO inquiries (
          inquiry_type, package_id, visa_offering_id, full_name, phone_number, email, message, source_page_url, submitted_at
        )
        VALUES (
          :inquiryType, :packageId, :visaOfferingId, :fullName, :phoneNumber, :email, :message, :sourcePageUrl, NOW()
        )
      `,
      {
        ...data,
        packageId: data.packageId || null,
        visaOfferingId: data.visaOfferingId || null,
        fullName: data.fullName || null,
        phoneNumber: data.phoneNumber || null,
        email: data.email || null,
        message: data.message || null,
        sourcePageUrl: data.sourcePageUrl || null
      }
    );

    if (data.email) {
      await sendTransactionalEmail({
        emailType: "inquiry_user",
        recipientEmail: data.email,
        recipientName: data.fullName || undefined,
        subject: "We received your inquiry",
        html: bookingEmailMarkup({
          heading: "Your inquiry has been received",
          intro: "Thank you for reaching out to NBGS Travel. Our team will contact you shortly.",
          items: [{ label: "Inquiry type", value: data.inquiryType }],
          terms: null
        }),
        relatedTable: "inquiries",
        relatedRecordId: result.insertId
      });
    }

    res.status(201).json({ inquiryId: result.insertId });
  } catch (error) {
    next(error);
  }
});

inquiryRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const rows = await query(`SELECT * FROM inquiries ORDER BY submitted_at DESC`);
    res.json({ inquiries: rows });
  } catch (error) {
    next(error);
  }
});
