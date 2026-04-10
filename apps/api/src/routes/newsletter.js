import crypto from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { config } from "../config/env.js";
import { query } from "../db/pool.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { sendTransactionalEmail, newsletterEmailMarkup } from "../services/emailService.js";
import { createHttpError } from "../utils/errors.js";
import { slugify } from "../utils/string.js";

const subscribeSchema = z.object({
  email: z.string().email(),
  firstName: z.string().trim().max(100).optional().nullable(),
  listSlug: z.string().trim().max(150).optional().nullable()
});

const createListSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(500).optional().nullable()
});

const createSubscriberSchema = z.object({
  email: z.string().email(),
  firstName: z.string().trim().max(100).optional().nullable(),
  listId: z.coerce.number().int().positive(),
  notes: z.string().trim().max(255).optional().nullable()
});

const updateSubscriberSchema = z.object({
  firstName: z.string().trim().max(100).optional().nullable(),
  notes: z.string().trim().max(255).optional().nullable(),
  status: z.enum(["subscribed", "unsubscribed", "bounced"]).optional(),
  listIds: z.array(z.coerce.number().int().positive()).optional()
});

const updateTemplateSchema = z.object({
  name: z.string().trim().min(2).max(150),
  subject: z.string().trim().min(3).max(255),
  preheader: z.string().trim().max(255).optional().nullable(),
  heading: z.string().trim().min(3).max(255),
  introText: z.string().trim().optional().nullable(),
  bodyHtml: z.string().trim().min(10),
  ctaLabel: z.string().trim().max(100).optional().nullable(),
  ctaUrl: z.string().trim().max(500).optional().nullable(),
  footerNote: z.string().trim().optional().nullable(),
  heroImageUrl: z.string().trim().max(500).optional().nullable(),
  featureImageUrl: z.string().trim().max(500).optional().nullable(),
  isActive: z.coerce.boolean().default(true)
});

const sendCampaignSchema = z.object({
  newsletterListId: z.coerce.number().int().positive(),
  newsletterTemplateId: z.coerce.number().int().positive(),
  campaignName: z.string().trim().min(2).max(150).optional().nullable()
});

export const newsletterRouter = Router();

newsletterRouter.post("/subscribe", async (req, res, next) => {
  try {
    const data = subscribeSchema.parse(req.body);
    const list = await getNewsletterListBySlug(data.listSlug);

    const subscriberId = await upsertSubscriber({
      email: data.email,
      firstName: data.firstName,
      source: "website"
    });

    await ensureListMembership(list.id, subscriberId);

    res.status(201).json({
      message: "Thanks for joining the NBGS Travel newsletter.",
      list: { id: list.id, name: list.name, slug: list.slug }
    });
  } catch (error) {
    next(error);
  }
});

newsletterRouter.get("/unsubscribe", async (req, res, next) => {
  try {
    const token = String(req.query.token || "").trim();

    if (!token) {
      throw createHttpError(400, "Missing unsubscribe token");
    }

    const subscribers = await query(
      `SELECT id, email FROM newsletter_subscribers WHERE unsubscribe_token = :token LIMIT 1`,
      { token }
    );
    const subscriber = subscribers[0];

    if (!subscriber) {
      throw createHttpError(404, "Subscriber not found");
    }

    await query(
      `
        UPDATE newsletter_subscribers
        SET status = 'unsubscribed', unsubscribed_at = NOW(), updated_at = NOW()
        WHERE id = :id
      `,
      { id: subscriber.id }
    );

    res
      .status(200)
      .type("html")
      .send(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed</title></head><body style="margin:0;padding:40px 18px;background:#f6f3ed;font-family:Arial,sans-serif;color:#15333b;"><div style="max-width:560px;margin:0 auto;padding:32px 28px;background:#ffffff;border-radius:24px;box-shadow:0 16px 34px rgba(8,21,25,0.08);"><p style="margin:0 0 12px;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#b49a54;">NBGS Travel</p><h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:34px;line-height:1.08;">You’ve been unsubscribed</h1><p style="margin:0;color:#58656d;line-height:1.8;">${escapeHtml(
        subscriber.email
      )} will no longer receive newsletter emails from NBGS Travel.</p></div></body></html>`);
  } catch (error) {
    next(error);
  }
});

newsletterRouter.get("/admin/bootstrap", requireAuth, async (req, res, next) => {
  try {
    const [lists, subscribers, templates, campaigns] = await Promise.all([
      query(
        `
          SELECT
            newsletter_lists.*,
            COUNT(newsletter_list_subscribers.id) AS subscriber_count,
            SUM(CASE WHEN newsletter_subscribers.status = 'subscribed' THEN 1 ELSE 0 END) AS active_subscriber_count
          FROM newsletter_lists
          LEFT JOIN newsletter_list_subscribers ON newsletter_list_subscribers.newsletter_list_id = newsletter_lists.id
          LEFT JOIN newsletter_subscribers ON newsletter_subscribers.id = newsletter_list_subscribers.newsletter_subscriber_id
          GROUP BY newsletter_lists.id
          ORDER BY newsletter_lists.is_default DESC, newsletter_lists.name ASC
        `
      ),
      query(
        `
          SELECT
            newsletter_subscribers.*,
            GROUP_CONCAT(newsletter_lists.id ORDER BY newsletter_lists.name ASC) AS list_ids_csv,
            GROUP_CONCAT(newsletter_lists.name ORDER BY newsletter_lists.name ASC SEPARATOR '||') AS list_names_csv
          FROM newsletter_subscribers
          LEFT JOIN newsletter_list_subscribers ON newsletter_list_subscribers.newsletter_subscriber_id = newsletter_subscribers.id
          LEFT JOIN newsletter_lists ON newsletter_lists.id = newsletter_list_subscribers.newsletter_list_id
          GROUP BY newsletter_subscribers.id
          ORDER BY newsletter_subscribers.subscribed_at DESC, newsletter_subscribers.created_at DESC
        `
      ),
      query(`SELECT * FROM newsletter_templates ORDER BY sort_order ASC, name ASC`),
      query(
        `
          SELECT
            newsletter_campaigns.*,
            newsletter_lists.name AS list_name,
            newsletter_templates.name AS template_name,
            CONCAT(admins.first_name, ' ', admins.last_name) AS sent_by_name
          FROM newsletter_campaigns
          INNER JOIN newsletter_lists ON newsletter_lists.id = newsletter_campaigns.newsletter_list_id
          INNER JOIN newsletter_templates ON newsletter_templates.id = newsletter_campaigns.newsletter_template_id
          INNER JOIN admins ON admins.id = newsletter_campaigns.sent_by_admin_id
          ORDER BY newsletter_campaigns.created_at DESC
          LIMIT 20
        `
      )
    ]);

    res.json({
      newsletter: {
        lists: lists.map(normalizeNewsletterList),
        subscribers: subscribers.map(normalizeSubscriber),
        templates,
        campaigns
      }
    });
  } catch (error) {
    next(error);
  }
});

newsletterRouter.post("/lists", requireAuth, requireRole("super_admin", "admin"), async (req, res, next) => {
  try {
    const data = createListSchema.parse(req.body);
    const slug = slugify(data.name);

    if (!slug) {
      throw createHttpError(400, "Unable to generate a list slug");
    }

    const result = await query(
      `
        INSERT INTO newsletter_lists (name, slug, description, is_default, is_active)
        VALUES (:name, :slug, :description, 0, 1)
      `,
      {
        ...data,
        slug,
        description: data.description || null
      }
    );

    const [list] = await query(`SELECT * FROM newsletter_lists WHERE id = :id LIMIT 1`, {
      id: result.insertId
    });

    res.status(201).json({ message: "Newsletter list created.", list });
  } catch (error) {
    next(error);
  }
});

newsletterRouter.post("/subscribers", requireAuth, requireRole("super_admin", "admin"), async (req, res, next) => {
  try {
    const data = createSubscriberSchema.parse(req.body);
    const list = await getNewsletterListById(data.listId);
    const subscriberId = await upsertSubscriber({
      email: data.email,
      firstName: data.firstName,
      source: "admin",
      notes: data.notes
    });

    await ensureListMembership(list.id, subscriberId);

    res.status(201).json({
      message: "Subscriber saved.",
      subscriberId,
      list: { id: list.id, name: list.name }
    });
  } catch (error) {
    next(error);
  }
});

newsletterRouter.patch("/subscribers/:id", requireAuth, requireRole("super_admin", "admin"), async (req, res, next) => {
  try {
    const subscriberId = Number(req.params.id);
    const data = updateSubscriberSchema.parse(req.body);
    const subscribers = await query(`SELECT * FROM newsletter_subscribers WHERE id = :id LIMIT 1`, { id: subscriberId });
    const subscriber = subscribers[0];

    if (!subscriber) {
      throw createHttpError(404, "Subscriber not found");
    }

    await query(
      `
        UPDATE newsletter_subscribers
        SET
          first_name = :firstName,
          notes = :notes,
          status = :status,
          unsubscribed_at = CASE
            WHEN :status = 'unsubscribed' THEN COALESCE(unsubscribed_at, NOW())
            WHEN :status = 'subscribed' THEN NULL
            ELSE unsubscribed_at
          END
        WHERE id = :id
      `,
      {
        id: subscriberId,
        firstName: data.firstName ?? subscriber.first_name ?? null,
        notes: data.notes ?? subscriber.notes ?? null,
        status: data.status || subscriber.status
      }
    );

    if (data.listIds) {
      await query(`DELETE FROM newsletter_list_subscribers WHERE newsletter_subscriber_id = :subscriberId`, {
        subscriberId
      });

      for (const listId of data.listIds) {
        await ensureListMembership(listId, subscriberId);
      }
    }

    const [updatedRow] = await query(
      `
        SELECT
          newsletter_subscribers.*,
          GROUP_CONCAT(newsletter_lists.id ORDER BY newsletter_lists.name ASC) AS list_ids_csv,
          GROUP_CONCAT(newsletter_lists.name ORDER BY newsletter_lists.name ASC SEPARATOR '||') AS list_names_csv
        FROM newsletter_subscribers
        LEFT JOIN newsletter_list_subscribers ON newsletter_list_subscribers.newsletter_subscriber_id = newsletter_subscribers.id
        LEFT JOIN newsletter_lists ON newsletter_lists.id = newsletter_list_subscribers.newsletter_list_id
        WHERE newsletter_subscribers.id = :subscriberId
        GROUP BY newsletter_subscribers.id
      `,
      { subscriberId }
    );

    res.json({ message: "Subscriber updated.", subscriber: normalizeSubscriber(updatedRow) });
  } catch (error) {
    next(error);
  }
});

newsletterRouter.put("/templates/:id", requireAuth, requireRole("super_admin", "admin"), async (req, res, next) => {
  try {
    const templateId = Number(req.params.id);
    const data = updateTemplateSchema.parse(req.body);

    const templates = await query(`SELECT id FROM newsletter_templates WHERE id = :id LIMIT 1`, { id: templateId });

    if (!templates[0]) {
      throw createHttpError(404, "Template not found");
    }

    await query(
      `
        UPDATE newsletter_templates
        SET
          name = :name,
          subject = :subject,
          preheader = :preheader,
          heading = :heading,
          intro_text = :introText,
          body_html = :bodyHtml,
          cta_label = :ctaLabel,
          cta_url = :ctaUrl,
          footer_note = :footerNote,
          hero_image_url = :heroImageUrl,
          feature_image_url = :featureImageUrl,
          is_active = :isActive
        WHERE id = :id
      `,
      {
        id: templateId,
        ...data,
        preheader: data.preheader || null,
        introText: data.introText || null,
        ctaLabel: data.ctaLabel || null,
        ctaUrl: data.ctaUrl || null,
        footerNote: data.footerNote || null,
        heroImageUrl: data.heroImageUrl || null,
        featureImageUrl: data.featureImageUrl || null,
        isActive: data.isActive ? 1 : 0
      }
    );

    const [template] = await query(`SELECT * FROM newsletter_templates WHERE id = :id LIMIT 1`, { id: templateId });
    res.json({ message: "Template updated.", template });
  } catch (error) {
    next(error);
  }
});

newsletterRouter.post("/campaigns/send", requireAuth, requireRole("super_admin", "admin"), async (req, res, next) => {
  try {
    const data = sendCampaignSchema.parse(req.body);
    const list = await getNewsletterListById(data.newsletterListId);
    const template = await getNewsletterTemplateById(data.newsletterTemplateId);
    const subscribers = await query(
      `
        SELECT newsletter_subscribers.*
        FROM newsletter_subscribers
        INNER JOIN newsletter_list_subscribers ON newsletter_list_subscribers.newsletter_subscriber_id = newsletter_subscribers.id
        WHERE newsletter_list_subscribers.newsletter_list_id = :listId
          AND newsletter_subscribers.status = 'subscribed'
        ORDER BY newsletter_subscribers.subscribed_at ASC
      `,
      { listId: list.id }
    );

    if (!subscribers.length) {
      throw createHttpError(400, "This list has no subscribed recipients yet.");
    }

    const campaignName = data.campaignName || `${template.name} - ${list.name}`;
    const campaignResult = await query(
      `
        INSERT INTO newsletter_campaigns (
          newsletter_list_id, newsletter_template_id, sent_by_admin_id, campaign_name,
          subject_snapshot, preheader_snapshot, heading_snapshot, intro_text_snapshot, body_html_snapshot,
          cta_label_snapshot, cta_url_snapshot, footer_note_snapshot, hero_image_url_snapshot, feature_image_url_snapshot,
          status, total_recipients, started_at
        )
        VALUES (
          :newsletterListId, :newsletterTemplateId, :sentByAdminId, :campaignName,
          :subjectSnapshot, :preheaderSnapshot, :headingSnapshot, :introTextSnapshot, :bodyHtmlSnapshot,
          :ctaLabelSnapshot, :ctaUrlSnapshot, :footerNoteSnapshot, :heroImageUrlSnapshot, :featureImageUrlSnapshot,
          'sending', :totalRecipients, NOW()
        )
      `,
      {
        newsletterListId: list.id,
        newsletterTemplateId: template.id,
        sentByAdminId: req.admin.id,
        campaignName,
        subjectSnapshot: template.subject,
        preheaderSnapshot: template.preheader || null,
        headingSnapshot: template.heading,
        introTextSnapshot: template.intro_text || null,
        bodyHtmlSnapshot: template.body_html,
        ctaLabelSnapshot: template.cta_label || null,
        ctaUrlSnapshot: template.cta_url || null,
        footerNoteSnapshot: template.footer_note || null,
        heroImageUrlSnapshot: template.hero_image_url || null,
        featureImageUrlSnapshot: template.feature_image_url || null,
        totalRecipients: subscribers.length
      }
    );

    const campaignId = campaignResult.insertId;
    let sentCount = 0;
    let failedCount = 0;

    for (const subscriber of subscribers) {
      await query(
        `
          INSERT INTO newsletter_campaign_recipients (newsletter_campaign_id, newsletter_subscriber_id, recipient_email, status)
          VALUES (:campaignId, :subscriberId, :recipientEmail, 'queued')
        `,
        {
          campaignId,
          subscriberId: subscriber.id,
          recipientEmail: subscriber.email
        }
      );

      try {
        const result = await sendTransactionalEmail({
          emailType: "newsletter_campaign",
          recipientEmail: subscriber.email,
          recipientName: subscriber.first_name || null,
          subject: template.subject,
          html: newsletterEmailMarkup({
            preheader: template.preheader,
            heading: template.heading,
            introText: template.intro_text,
            bodyHtml: template.body_html,
            ctaLabel: template.cta_label,
            ctaUrl: template.cta_url,
            footerNote: template.footer_note,
            heroImageUrl: template.hero_image_url,
            featureImageUrl: template.feature_image_url,
            unsubscribeUrl: `${config.apiPublicUrl.replace(/\/$/, "")}/newsletter/unsubscribe?token=${subscriber.unsubscribe_token}`
          }),
          relatedTable: "newsletter_campaigns",
          relatedRecordId: campaignId
        });

        await query(
          `
            UPDATE newsletter_campaign_recipients
            SET status = 'sent', provider_message_id = :providerMessageId, sent_at = NOW()
            WHERE newsletter_campaign_id = :campaignId AND newsletter_subscriber_id = :subscriberId
          `,
          {
            campaignId,
            subscriberId: subscriber.id,
            providerMessageId: result.messageId || null
          }
        );

        await query(
          `UPDATE newsletter_subscribers SET last_emailed_at = NOW() WHERE id = :subscriberId`,
          { subscriberId: subscriber.id }
        );
        sentCount += 1;
      } catch (error) {
        failedCount += 1;
        await query(
          `
            UPDATE newsletter_campaign_recipients
            SET status = 'failed', error_message = :errorMessage
            WHERE newsletter_campaign_id = :campaignId AND newsletter_subscriber_id = :subscriberId
          `,
          {
            campaignId,
            subscriberId: subscriber.id,
            errorMessage: error.message || "Newsletter send failed"
          }
        );
      }
    }

    const status =
      sentCount === subscribers.length ? "sent" : sentCount > 0 ? "partial" : "failed";

    await query(
      `
        UPDATE newsletter_campaigns
        SET status = :status, sent_count = :sentCount, failed_count = :failedCount, completed_at = NOW()
        WHERE id = :campaignId
      `,
      {
        campaignId,
        status,
        sentCount,
        failedCount
      }
    );

    res.status(201).json({
      message:
        status === "sent"
          ? `Newsletter sent to ${sentCount} subscriber(s).`
          : `Newsletter send finished with ${sentCount} sent and ${failedCount} failed.`,
      campaignId,
      sentCount,
      failedCount,
      totalRecipients: subscribers.length
    });
  } catch (error) {
    next(error);
  }
});

async function getNewsletterListBySlug(slug) {
  const rows = slug
    ? await query(`SELECT * FROM newsletter_lists WHERE slug = :slug AND is_active = 1 LIMIT 1`, { slug })
    : await query(`SELECT * FROM newsletter_lists WHERE is_default = 1 AND is_active = 1 LIMIT 1`);

  if (!rows[0]) {
    throw createHttpError(404, "Newsletter list not found");
  }

  return rows[0];
}

async function getNewsletterListById(listId) {
  const rows = await query(`SELECT * FROM newsletter_lists WHERE id = :id LIMIT 1`, { id: listId });

  if (!rows[0]) {
    throw createHttpError(404, "Newsletter list not found");
  }

  return rows[0];
}

async function getNewsletterTemplateById(templateId) {
  const rows = await query(`SELECT * FROM newsletter_templates WHERE id = :id LIMIT 1`, { id: templateId });

  if (!rows[0]) {
    throw createHttpError(404, "Newsletter template not found");
  }

  return rows[0];
}

async function upsertSubscriber({ email, firstName, source, notes }) {
  const normalizedEmail = email.trim().toLowerCase();
  const rows = await query(`SELECT * FROM newsletter_subscribers WHERE email = :email LIMIT 1`, {
    email: normalizedEmail
  });

  if (rows[0]) {
    await query(
      `
        UPDATE newsletter_subscribers
        SET
          first_name = COALESCE(:firstName, first_name),
          status = 'subscribed',
          source = :source,
          unsubscribed_at = NULL,
          notes = COALESCE(:notes, notes),
          updated_at = NOW()
        WHERE id = :id
      `,
      {
        id: rows[0].id,
        firstName: firstName || null,
        source,
        notes: notes || null
      }
    );

    return rows[0].id;
  }

  const result = await query(
    `
      INSERT INTO newsletter_subscribers (email, first_name, status, source, unsubscribe_token, notes)
      VALUES (:email, :firstName, 'subscribed', :source, :unsubscribeToken, :notes)
    `,
    {
      email: normalizedEmail,
      firstName: firstName || null,
      source,
      unsubscribeToken: crypto.randomBytes(24).toString("hex"),
      notes: notes || null
    }
  );

  return result.insertId;
}

async function ensureListMembership(listId, subscriberId) {
  await query(
    `
      INSERT INTO newsletter_list_subscribers (newsletter_list_id, newsletter_subscriber_id)
      VALUES (:listId, :subscriberId)
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
    `,
    { listId, subscriberId }
  );
}

function normalizeNewsletterList(row) {
  return {
    ...row,
    isDefault: Boolean(row.is_default),
    isActive: Boolean(row.is_active),
    subscriber_count: Number(row.subscriber_count || 0),
    active_subscriber_count: Number(row.active_subscriber_count || 0),
    subscriberCount: Number(row.subscriber_count || 0),
    activeSubscriberCount: Number(row.active_subscriber_count || 0)
  };
}

function normalizeSubscriber(row) {
  return {
    ...row,
    list_ids: String(row.list_ids_csv || "")
      .split(",")
      .filter(Boolean)
      .map((item) => Number(item)),
    list_names: String(row.list_names_csv || "")
      .split("||")
      .filter(Boolean)
  };
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
