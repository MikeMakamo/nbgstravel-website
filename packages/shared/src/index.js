const safeProcessEnv =
  typeof process !== "undefined" && process.env ? process.env : {};

export const API_BASE_URL = safeProcessEnv.VITE_API_URL || "http://localhost:4000/api";

export const PACKAGE_STATUSES = ["draft", "published", "archived"];

export const BOOKING_STATUSES = ["new", "contact_pending", "contacted", "converted", "closed"];

export const VISA_APPLICATION_STATUSES = ["submitted", "payment_pending", "paid", "failed", "cancelled"];

export const ABANDONED_LEAD_STATUSES = ["new", "contact_pending", "contacted", "closed"];

export const TERMS_KEYS = {
  package: "package_terms",
  visa: "visa_terms"
};

export function formatCurrency(amount, currency = "ZAR") {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency
  }).format(Number(amount || 0));
}

export function slugify(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
