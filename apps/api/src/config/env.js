import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "../..");
const envPath = process.env.ENV_FILE
  ? path.resolve(process.cwd(), process.env.ENV_FILE)
  : path.resolve(appRoot, ".env");

dotenv.config({ path: envPath });

function getEnv(name, fallback = "") {
  return typeof process.env[name] === "string" && process.env[name].trim()
    ? process.env[name].trim()
    : fallback;
}

function requireEnv(name) {
  const value = getEnv(name);

  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Expected it in process env or ${envPath}.`
    );
  }

  return value;
}

function getNumberEnv(name, fallback) {
  const value = getEnv(name, String(fallback));
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number.`);
  }

  return parsed;
}

const dbHost = getEnv("DB_HOST", "127.0.0.1");
const dbPort = getNumberEnv("DB_PORT", 3306);
const dbName = requireEnv("DB_NAME");
const dbUser = requireEnv("DB_USER");
const dbPassword = requireEnv("DB_PASSWORD");

export const config = {
  appRoot,
  envPath,
  envFileExists: fs.existsSync(envPath),
  port: getNumberEnv("PORT", 4000),
  appUrl: getEnv("APP_URL", "http://localhost:5173"),
  adminUrl: getEnv("ADMIN_URL", "http://localhost:5174"),
  apiPublicUrl:
    getEnv("API_PUBLIC_URL") || `${getEnv("APP_URL", "http://localhost:5173").replace(/\/$/, "")}/api`,
  diagnosticsToken: getEnv("DIAGNOSTICS_TOKEN"),
  jwtSecret: getEnv("JWT_SECRET", "change-me"),
  db: {
    host: dbHost,
    port: dbPort,
    database: dbName,
    user: dbUser,
    password: dbPassword
  },
  smtp: {
    host: getEnv("SMTP_HOST"),
    port: getNumberEnv("SMTP_PORT", 587),
    user: getEnv("SMTP_USER"),
    password: getEnv("SMTP_PASSWORD"),
    from: getEnv("SMTP_FROM", "NBGSTRAVEL <no-reply@nbgstravel.co.za>")
  },
  googleReviews: {
    apiKey: getEnv("GOOGLE_API_KEY"),
    syncUrl: getEnv("GOOGLE_REVIEWS_SYNC_URL"),
    accountId: getEnv("GOOGLE_REVIEWS_ACCOUNT_ID"),
    locationId: getEnv("GOOGLE_REVIEWS_LOCATION_ID")
  },
  payfast: {
    merchantId: getEnv("PAYFAST_MERCHANT_ID"),
    merchantKey: getEnv("PAYFAST_MERCHANT_KEY"),
    passphrase: getEnv("PAYFAST_PASSPHRASE"),
    returnUrl: getEnv("PAYFAST_RETURN_URL", "http://localhost:5173/visa/payment-complete"),
    cancelUrl: getEnv("PAYFAST_CANCEL_URL", "http://localhost:5173/visa/payment-cancelled"),
    notifyUrl: getEnv("PAYFAST_NOTIFY_URL", "http://localhost:4000/api/payments/payfast/notify")
  }
};
