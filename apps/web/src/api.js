const API_URL = process.env.VITE_API_URL || "http://localhost:4000/api";

async function parseResponse(response) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Request failed");
  }

  return response.json();
}

export async function getPackages() {
  const data = await parseResponse(await fetch(`${API_URL}/packages`));
  return {
    ...data,
    packages: (data.packages || []).map(normalizePackage)
  };
}

export async function getPackage(slug) {
  const data = await parseResponse(await fetch(`${API_URL}/packages/${slug}`));
  return {
    ...data,
    package: normalizePackage(data.package)
  };
}

export async function getVisas() {
  return parseResponse(await fetch(`${API_URL}/visas`));
}

export async function getReviews() {
  return parseResponse(await fetch(`${API_URL}/reviews`));
}

export async function submitBooking(payload) {
  return parseResponse(
    await fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
  );
}

export async function submitVisaApplication(payload) {
  return parseResponse(
    await fetch(`${API_URL}/visas/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
  );
}

export async function createVisaPayfastIntent(visaApplicationId) {
  return parseResponse(
    await fetch(`${API_URL}/payments/visa/payfast-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visaApplicationId })
    })
  );
}

export async function submitInquiry(payload) {
  return parseResponse(
    await fetch(`${API_URL}/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
  );
}

export async function submitAbandonedLead(payload) {
  return parseResponse(
    await fetch(`${API_URL}/abandoned-leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
  );
}

export async function subscribeNewsletter(payload) {
  return parseResponse(
    await fetch(`${API_URL}/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
  );
}

function normalizePackage(pkg) {
  if (!pkg) {
    return pkg;
  }

  let adminMeta = pkg.adminMeta || {};

  if (pkg.admin_meta_json) {
    try {
      adminMeta = typeof pkg.admin_meta_json === "string" ? JSON.parse(pkg.admin_meta_json) : pkg.admin_meta_json;
    } catch (error) {
      adminMeta = {};
    }
  }

  return {
    ...pkg,
    adminMeta: adminMeta || {},
    routeStops: Array.isArray(pkg.routeStops) ? pkg.routeStops : []
  };
}
