const DEFAULT_FEATURE_IMAGE = "https://nbgstravel.co.za/wp-content/uploads/2025/02/472998936_18052737236487047_7230927518770349952_n-1024x576.jpg";
const DEFAULT_LOGO_URL = "/assets/images/main%20logo.png";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resolveImage(url, fallback) {
  return String(url || "").trim() || fallback;
}

export function createNewsletterEmailMarkup({
  preheader,
  heading,
  introText,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  footerNote,
  featureImageUrl,
  logoUrl,
  unsubscribeUrl
}) {
  const safeHeading = escapeHtml(heading || "NBGS Travel Newsletter");
  const safeIntroText = introText
    ? `<p style="margin:0 0 18px;color:#42515b;font-size:15px;line-height:1.78;">${escapeHtml(introText)}</p>`
    : "";
  const safeFooterNote = footerNote
    ? `<p style="margin:22px 0 0;color:#6b757b;font-size:12px;line-height:1.75;">${escapeHtml(footerNote)}</p>`
    : "";
  const safePreheader = escapeHtml(preheader || introText || "NBGS Travel newsletter");
  const resolvedFeatureImage = resolveImage(featureImageUrl, DEFAULT_FEATURE_IMAGE);
  const resolvedLogoUrl = resolveImage(logoUrl, DEFAULT_LOGO_URL);
  const ctaMarkup =
    ctaLabel && ctaUrl
      ? `<div style="margin:28px 0 0;"><a href="${escapeHtml(
          ctaUrl
        )}" style="display:inline-block;padding:14px 24px;border-radius:999px;background:#0e3139;color:#ffffff;text-decoration:none;font-weight:700;">${escapeHtml(
          ctaLabel
        )}</a></div>`
      : "";
  const unsubscribeMarkup = unsubscribeUrl
    ? `<p style="margin:18px 0 0;color:#7c878c;font-size:12px;line-height:1.7;">If you no longer want to receive newsletter updates, you can <a href="${escapeHtml(
        unsubscribeUrl
      )}" style="color:#7c878c;">unsubscribe here</a>.</p>`
    : "";

  return `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${safePreheader}</div>
    <div style="margin:0;padding:32px 16px;background:#f4f1ea;font-family:Arial,sans-serif;color:#13232f;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 40px rgba(7,24,30,0.08);">
        <div style="padding:22px 28px;background:#062f37;color:#ffffff;">
          <div style="display:flex;align-items:center;gap:16px;">
            <div style="width:74px;height:74px;border-radius:22px;background:rgba(255,255,255,0.06);display:grid;place-items:center;flex-shrink:0;">
              <img src="${escapeHtml(resolvedLogoUrl)}" alt="NBGS Travel" style="display:block;max-width:58px;max-height:58px;object-fit:contain;" />
            </div>
            <div>
              <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.68);">NBGS Travel Newsletter</div>
              <div style="margin-top:6px;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.82);">Curated trips, travel updates, and destination inspiration from the NBGS team.</div>
            </div>
          </div>
        </div>
        <div style="padding:34px 28px 28px;">
          <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#b49a54;font-weight:700;">Travel inspiration</div>
          <h1 style="margin:12px 0 16px;font-family:Georgia,serif;font-size:34px;line-height:1.08;font-weight:600;color:#0c2f38;">${safeHeading}</h1>
          ${safeIntroText}
          <div style="margin:24px 0 0;padding:0;border-radius:22px;overflow:hidden;background:#f8f3ea;border:1px solid rgba(180,154,84,0.22);">
            <img src="${escapeHtml(resolvedFeatureImage)}" alt="Travel highlight" style="display:block;width:100%;max-width:100%;height:auto;object-fit:cover;" />
          </div>
          <div style="margin-top:24px;color:#2d3a40;font-size:15px;line-height:1.85;">${bodyHtml || "<p>No body content yet.</p>"}</div>
          ${ctaMarkup}
          ${safeFooterNote}
          ${unsubscribeMarkup}
        </div>
      </div>
    </div>
  `;
}

export function createNewsletterPreviewDocument(template) {
  const html = createNewsletterEmailMarkup(template);
  const title = escapeHtml(template?.name || template?.heading || "Newsletter preview");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;background:#f4f1ea;">${html}</body>
</html>`;
}
