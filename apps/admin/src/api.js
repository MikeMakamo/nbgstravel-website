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

export async function getNewsletterData(token) {
  return parseResponse(await fetch(`${API_URL}/newsletter/admin/bootstrap`, { headers: getHeaders(token) }));
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

export async function updatePackage(token, id, payload) {
  return parseResponse(
    await fetch(`${API_URL}/packages/${id}`, {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    })
  );
}

export async function deletePackage(token, id) {
  return parseResponse(
    await fetch(`${API_URL}/packages/${id}`, {
      method: "DELETE",
      headers: getHeaders(token)
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

export async function createNewsletterList(token, payload) {
  return parseResponse(
    await fetch(`${API_URL}/newsletter/lists`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    })
  );
}

export async function createNewsletterSubscriber(token, payload) {
  return parseResponse(
    await fetch(`${API_URL}/newsletter/subscribers`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    })
  );
}

export async function updateNewsletterSubscriber(token, id, payload) {
  return parseResponse(
    await fetch(`${API_URL}/newsletter/subscribers/${id}`, {
      method: "PATCH",
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    })
  );
}

export async function updateNewsletterTemplate(token, id, payload) {
  return parseResponse(
    await fetch(`${API_URL}/newsletter/templates/${id}`, {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    })
  );
}

export async function sendNewsletterCampaign(token, payload) {
  return parseResponse(
    await fetch(`${API_URL}/newsletter/campaigns/send`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    })
  );
}

export async function updateBookingStatus(token, id, status) {
  return parseResponse(
    await fetch(`${API_URL}/bookings/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(token),
      body: JSON.stringify({ status })
    })
  );
}

export async function uploadMedia(token, file, altText = "") {
  const dataUrl = await readFileAsDataUrl(file);

  return parseResponse(
    await fetch(`${API_URL}/media/upload`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        dataUrl,
        altText
      })
    })
  );
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read image file"));
    reader.readAsDataURL(file);
  });
}
