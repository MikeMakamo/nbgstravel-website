import { Router } from "express";
import { z } from "zod";
import { query } from "../db/pool.js";
import { createHttpError } from "../utils/errors.js";
import { buildPayfastRedirectUrl } from "../services/payfastService.js";

const payfastIntentSchema = z.object({
  visaApplicationId: z.coerce.number().int().positive()
});

export const paymentRouter = Router();

paymentRouter.post("/visa/payfast-intent", async (req, res, next) => {
  try {
    const { visaApplicationId } = payfastIntentSchema.parse(req.body);

    const rows = await query(
      `
        SELECT visa_applications.id, visa_applications.full_name, visa_offerings.title, visa_offerings.application_fee, visa_offerings.currency_code
        FROM visa_applications
        INNER JOIN visa_offerings ON visa_offerings.id = visa_applications.visa_offering_id
        WHERE visa_applications.id = :visaApplicationId
        LIMIT 1
      `,
      { visaApplicationId }
    );

    const application = rows[0];

    if (!application) {
      throw createHttpError(404, "Visa application not found");
    }

    const result = await query(
      `
        INSERT INTO payments (
          payment_type, visa_application_id, provider, provider_reference, amount, currency_code, status, request_payload_json
        )
        VALUES (
          'visa_application', :visaApplicationId, 'payfast', :providerReference, :amount, :currencyCode, 'pending', :requestPayloadJson
        )
      `,
      {
        visaApplicationId,
        providerReference: `VISA-${visaApplicationId}-${Date.now()}`,
        amount: application.application_fee,
        currencyCode: application.currency_code || "ZAR",
        requestPayloadJson: JSON.stringify(application)
      }
    );

    await query(
      `UPDATE visa_applications SET status = 'payment_pending', updated_at = NOW() WHERE id = :id`,
      { id: visaApplicationId }
    );

    const redirectUrl = buildPayfastRedirectUrl({
      itemName: application.title,
      amount: application.application_fee,
      customStr1: String(result.insertId)
    });

    res.status(201).json({
      paymentId: result.insertId,
      redirectUrl
    });
  } catch (error) {
    next(error);
  }
});

paymentRouter.post("/payfast/notify", async (req, res, next) => {
  try {
    const paymentId = Number(req.body.custom_str1 || req.body.payment_id || 0);
    const paymentStatus = String(req.body.payment_status || "").toUpperCase();

    if (paymentId) {
      const normalizedStatus = paymentStatus === "COMPLETE" ? "paid" : paymentStatus === "FAILED" ? "failed" : "pending";

      await query(
        `
          UPDATE payments
          SET status = :status,
              provider_payment_id = :providerPaymentId,
              response_payload_json = :payload,
              paid_at = CASE WHEN :status = 'paid' THEN NOW() ELSE paid_at END,
              updated_at = NOW()
          WHERE id = :paymentId
        `,
        {
          status: normalizedStatus,
          providerPaymentId: req.body.pf_payment_id || null,
          payload: JSON.stringify(req.body),
          paymentId
        }
      );

      const payments = await query(`SELECT visa_application_id FROM payments WHERE id = :paymentId LIMIT 1`, {
        paymentId
      });
      const visaApplicationId = payments[0]?.visa_application_id;

      if (visaApplicationId) {
        await query(
          `UPDATE visa_applications SET status = :status, updated_at = NOW() WHERE id = :visaApplicationId`,
          {
            status: normalizedStatus === "paid" ? "paid" : normalizedStatus === "failed" ? "failed" : "payment_pending",
            visaApplicationId
          }
        );
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    next(error);
  }
});
