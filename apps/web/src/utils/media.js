const API_URL = process.env.VITE_API_URL || "http://localhost:4000/api";
const API_BASE_URL = API_URL.replace(/\/api\/?$/, "");

export function resolveApiAssetUrl(value) {
  if (!value) {
    return value;
  }

  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_BASE_URL}${value}`;
  }

  return value;
}
