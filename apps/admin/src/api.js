const API_URL = process.env.VITE_API_URL || "http://localhost:4000/api";

function getHeaders(token) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function parseResponse(response) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Request failed");
  }

  return response.json();
}

export async function login(payload) {
  return parseResponse(
    await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    })
  );
}

export async function getMe(token) {
  return parseResponse(await fetch(`${API_URL}/auth/me`, { headers: getHeaders(token) }));
}

export async function getSummary(token) {
  return parseResponse(await fetch(`${API_URL}/dashboard/summary`, { headers: getHeaders(token) }));
}

export async function getPackages(token) {
  return parseResponse(await fetch(`${API_URL}/packages/admin/list/all`, { headers: getHeaders(token) }));
}

export async function getVisas(token) {
  return parseResponse(await fetch(`${API_URL}/visas/admin/list/all`, { headers: getHeaders(token) }));
}

export async function getBookings(token) {
  return parseResponse(await fetch(`${API_URL}/bookings`, { headers: getHeaders(token) }));
}

export async function getVisaApplications(token) {
  return parseResponse(await fetch(`${API_URL}/visas/applications`, { headers: getHeaders(token) }));
}

export async function getAbandonedLeads(token) {
  return parseResponse(await fetch(`${API_URL}/abandoned-leads`, { headers: getHeaders(token) }));
}

export async function createPackage(token, payload) {
  return parseResponse(
    await fetch(`${API_URL}/packages`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    })
  );
}

export async function createVisa(token, payload) {
  return parseResponse(
    await fetch(`${API_URL}/visas`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    })
  );
}
