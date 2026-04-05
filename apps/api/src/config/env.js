import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  appUrl: process.env.APP_URL || "http://localhost:5173",
  adminUrl: process.env.ADMIN_URL || "http://localhost:5174",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME || "nbgstravel",
    user: process.env.DB_USER || "nbgstravel",
    password: process.env.DB_PASSWORD || "nbgstravel"
  },
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || "",
    password: process.env.SMTP_PASSWORD || "",
    from: process.env.SMTP_FROM || "NBGSTRAVEL <no-reply@nbgstravel.co.za>"
  },
  googleReviews: {
    apiKey: process.env.GOOGLE_API_KEY || "",
    syncUrl: process.env.GOOGLE_REVIEWS_SYNC_URL || "",
    accountId: process.env.GOOGLE_REVIEWS_ACCOUNT_ID || "",
    locationId: process.env.GOOGLE_REVIEWS_LOCATION_ID || ""
  },
  payfast: {
    merchantId: process.env.PAYFAST_MERCHANT_ID || "",
    merchantKey: process.env.PAYFAST_MERCHANT_KEY || "",
    passphrase: process.env.PAYFAST_PASSPHRASE || "",
    returnUrl: process.env.PAYFAST_RETURN_URL || "http://localhost:5173/visa/payment-complete",
    cancelUrl: process.env.PAYFAST_CANCEL_URL || "http://localhost:5173/visa/payment-cancelled",
    notifyUrl: process.env.PAYFAST_NOTIFY_URL || "http://localhost:4000/api/payments/payfast/notify"
  }
};
