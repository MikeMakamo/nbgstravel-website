import { Router } from "express";
import { z } from "zod";
import { query } from "../db/pool.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { sendTransactionalEmail, bookingEmailMarkup } from "../services/emailService.js";

const abandonedLeadSchema = z.object({
  leadType: z.enum(["package_booking", "visa_application", "homepage_inquiry"]),
  packageId: z.coerce.number().int().positive().optional().nullable(),
  visaOfferingId: z.coerce.number().int().positive().optional().nullable(),
  fullName: z.string().optional().nullable(),
  phoneNumber: z.string().min(8),
  email: z.string().email().optional().nullable(),
  nationality: z.string().optional().nullable(),
  preferredTravelDate: z.string().optional().nullable(),
  travelDate: z.string().optional().nullable(),
  returnDate: z.string().optional().nullable(),
  numberOfPersons: z.coerce.number().int().min(1).optional().nullable(),
  partialForm: z.record(z.any()),
  sourcePageUrl: z.string().optional().nullable(),
  abandonReason: z.string().optional().nullable()
});

export const abandonedLeadRouter = Router();

abandonedLeadRouter.post("/", async (req, res, next) => {
  try {
    const data = abandonedLeadSchema.parse(req.body);

    const result = await query(
      `
        INSERT INTO abandoned_leads (
          lead_type, package_id, visa_offering_id, full_name, phone_number, email, nationality,
          preferred_travel_date, travel_date, return_date, number_of_persons, partial_form_json,
          source_page_url, abandon_reason, captured_at
        )
        VALUES (
          :leadType, :packageId, :visaOfferingId, :fullName, :phoneNumber, :email, :nationality,
          :preferredTravelDate, :travelDate, :returnDate, :numberOfPersons, :partialFormJson,
          :sourcePageUrl, :abandonReason, NOW()
        )
      `,
      {
        ...data,
        packageId: data.packageId || null,
        visaOfferingId: data.visaOfferingId || null,
        fullName: data.fullName || null,
        email: data.email || null,
        nationality: data.nationality || null,
        preferredTravelDate: data.preferredTravelDate || null,
        travelDate: data.travelDate || null,
        returnDate: data.returnDate || null,
        numberOfPersons: data.numberOfPersons || null,
        partialFormJson: JSON.stringify(data.partialForm),
        sourcePageUrl: data.sourcePageUrl || null,
        abandonReason: data.abandonReason || null
      }
    );

    await sendTransactionalEmail({
      emailType: "abandoned_lead_admin",
      recipientEmail: "leads@nbgstravel.local",
      subject: `Abandoned ${data.leadType.replace("_", " ")} lead`,
      html: bookingEmailMarkup({
        heading: "New abandoned lead captured",
        intro: "A customer left before completing a modal form, but enough detail was captured for follow-up.",
        items: [
          { label: "Lead type", value: data.leadType },
          { label: "Phone", value: data.phoneNumber },
          { label: "Name", value: data.fullName || "Not provided" }
        ],
        terms: null
      }),
      relatedTable: "abandoned_leads",
      relatedRecordId: result.insertId
    });

    res.status(201).json({ abandonedLeadId: result.insertId });
  } catch (error) {
    next(error);
  }
});

abandonedLeadRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const rows = await query(`SELECT * FROM abandoned_leads ORDER BY captured_at DESC`);
    res.json({ abandonedLeads: rows });
  } catch (error) {
    next(error);
  }
});

abandonedLeadRouter.patch("/:id/status", requireAuth, requireRole("super_admin", "admin"), async (req, res, next) => {
  try {
    const schema = z.object({
      status: z.enum(["new", "contact_pending", "contacted", "closed"])
    });
    const { status } = schema.parse(req.body);

    await query(`UPDATE abandoned_leads SET status = :status, updated_at = NOW() WHERE id = :id`, {
      status,
      id: req.params.id
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});
