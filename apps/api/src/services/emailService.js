import nodemailer from "nodemailer";
import { config } from "../config/env.js";
import { query } from "../db/pool.js";

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = config.smtp.host
      ? nodemailer.createTransport({
          host: config.smtp.host,
          port: config.smtp.port,
          secure: config.smtp.port === 465,
          auth: config.smtp.user
            ? {
                user: config.smtp.user,
                pass: config.smtp.password
              }
            : undefined
        })
      : nodemailer.createTransport({
          jsonTransport: true
        });
  }

  return transporter;
}

export async function sendTransactionalEmail({
  emailType,
  recipientEmail,
  recipientName,
  subject,
  html,
  relatedTable,
  relatedRecordId
}) {
  try {
    const result = await getTransporter().sendMail({
      from: config.smtp.from,
      to: recipientName ? `${recipientName} <${recipientEmail}>` : recipientEmail,
      subject,
      html
    });

    await query(
      `
        INSERT INTO email_logs (
          email_type, related_table, related_record_id, recipient_email, recipient_name, subject, status, provider_message_id, sent_at
        )
        VALUES (
          :emailType, :relatedTable, :relatedRecordId, :recipientEmail, :recipientName, :subject, 'sent', :providerMessageId, NOW()
        )
      `,
      {
        emailType,
        relatedTable: relatedTable || null,
        relatedRecordId: relatedRecordId || null,
        recipientEmail,
        recipientName: recipientName || null,
        subject,
        providerMessageId: result.messageId || null
      }
    );

    return result;
  } catch (error) {
    await query(
      `
        INSERT INTO email_logs (
          email_type, related_table, related_record_id, recipient_email, recipient_name, subject, status, error_message
        )
        VALUES (
          :emailType, :relatedTable, :relatedRecordId, :recipientEmail, :recipientName, :subject, 'failed', :errorMessage
        )
      `,
      {
        emailType,
        relatedTable: relatedTable || null,
        relatedRecordId: relatedRecordId || null,
        recipientEmail,
        recipientName: recipientName || null,
        subject,
        errorMessage: error.message || "Email send failed"
      }
    );

    throw error;
  }
}

export function bookingEmailMarkup({ heading, intro, items, terms }) {
  const itemMarkup = items
    .map((item) => `<li><strong>${item.label}:</strong> ${item.value}</li>`)
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #13232f;">
      <h2>${heading}</h2>
      <p>${intro}</p>
      <ul>${itemMarkup}</ul>
      ${terms ? `<p><strong>Terms:</strong> ${terms}</p>` : ""}
    </div>
  `;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function newsletterEmailMarkup({
  preheader,
  heading,
  introText,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  footerNote,
  featureImageUrl,
  unsubscribeUrl
}) {
  const defaultFeatureImage = "https://nbgstravel.co.za/wp-content/uploads/2025/02/472998936_18052737236487047_7230927518770349952_n-1024x576.jpg";
  const logoUrl = `${config.appUrl.replace(/\/$/, "")}/assets/images/main%20logo.png`;
  const resolvedFeatureImage = featureImageUrl || defaultFeatureImage;
  const safeHeading = escapeHtml(heading);
  const safeIntroText = introText ? `<p style="margin:0 0 18px;color:#42515b;font-size:15px;line-height:1.7;">${escapeHtml(introText)}</p>` : "";
  const safeFooterNote = footerNote
    ? `<p style="margin:24px 0 0;color:#5f6d74;font-size:12px;line-height:1.7;">${escapeHtml(footerNote)}</p>`
    : "";
  const ctaMarkup =
    ctaLabel && ctaUrl
      ? `<div style="margin:24px 0 0;"><a href="${ctaUrl}" style="display:inline-block;padding:13px 22px;border-radius:999px;background:#b49a54;color:#ffffff;text-decoration:none;font-weight:700;">${escapeHtml(
          ctaLabel
        )}</a></div>`
      : "";
  const unsubscribeMarkup = unsubscribeUrl
    ? `<p style="margin:18px 0 0;color:#7c878c;font-size:12px;line-height:1.7;">If you no longer want to receive newsletter updates, you can <a href="${unsubscribeUrl}" style="color:#7c878c;">unsubscribe here</a>.</p>`
    : "";
  const featureMarkup = resolvedFeatureImage
    ? `<div style="margin:24px 0 0;"><img src="${escapeHtml(resolvedFeatureImage)}" alt="Travel highlight" style="display:block;width:100%;max-width:100%;height:auto;border-radius:22px;object-fit:cover;" /></div>`
    : "";

  return `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader || introText || "")}</div>
    <div style="margin:0;padding:32px 16px;background:#f4f1ea;font-family:Arial,sans-serif;color:#13232f;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:26px;overflow:hidden;box-shadow:0 20px 40px rgba(7,24,30,0.08);">
        <div style="padding:22px 28px;background:#062f37;color:#ffffff;">
          <div style="display:flex;align-items:center;gap:16px;">
            <div style="width:74px;height:74px;border-radius:22px;background:rgba(255,255,255,0.06);display:grid;place-items:center;flex-shrink:0;">
              <img src="${escapeHtml(logoUrl)}" alt="NBGS Travel" style="display:block;max-width:58px;max-height:58px;object-fit:contain;" />
            </div>
            <div>
              <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.68);">NBGS Travel Newsletter</div>
              <div style="margin-top:6px;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.82);">Curated trips, travel updates, and destination inspiration from the NBGS team.</div>
            </div>
          </div>
        </div>
        <div style="padding:34px 28px;">
          <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:34px;line-height:1.08;font-weight:600;color:#0c2f38;">${safeHeading}</h1>
          ${safeIntroText}
          ${featureMarkup}
          <div style="color:#2d3a40;font-size:15px;line-height:1.8;">${bodyHtml || ""}</div>
          ${ctaMarkup}
          ${safeFooterNote}
          ${unsubscribeMarkup}
        </div>
      </div>
    </div>
  `;
}
