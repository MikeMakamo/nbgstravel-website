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
