import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Router } from "express";
import { config } from "../config/env.js";
import { query } from "../db/pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "../..");
const uploadsDir = path.resolve(appRoot, "uploads");
const defaultSampleFile = path.join(
  "imported",
  "live-packages",
  "afronation-portugal-2026",
  "05-praia-marinha-beach-lagoa-algarve-1024x683.jpg"
);

function isAuthorized(req) {
  const suppliedToken = req.get("x-diagnostics-token") || req.query.token;
  return Boolean(config.diagnosticsToken && suppliedToken && suppliedToken === config.diagnosticsToken);
}

function sanitizeRelativeFilePath(value) {
  const rawValue = typeof value === "string" && value.trim() ? value.trim() : defaultSampleFile;
  const normalized = path
    .normalize(rawValue)
    .replace(/^([/\\])+/, "")
    .replace(/\.\.(\/|\\)/g, "");

  return normalized;
}

export const diagnosticsRouter = Router();

diagnosticsRouter.get("/runtime", async (req, res, next) => {
  if (!isAuthorized(req)) {
    return res.status(403).json({ message: "Diagnostics access denied" });
  }

  try {
    const relativeSampleFile = sanitizeRelativeFilePath(req.query.file);
    const absoluteSampleFile = path.resolve(uploadsDir, relativeSampleFile);
    const insideUploadsDir = absoluteSampleFile.startsWith(uploadsDir);

    const diagnostics = {
      process: {
        cwd: process.cwd(),
        nodeVersion: process.version,
        appRoot,
        routesDir: __dirname
      },
      config: {
        port: config.port,
        appUrl: config.appUrl,
        adminUrl: config.adminUrl,
        apiPublicUrl: config.apiPublicUrl,
        db: {
          host: config.db.host,
          port: config.db.port,
          database: config.db.database,
          user: config.db.user
        }
      },
      environment: {
        DB_HOST: process.env.DB_HOST || null,
        DB_PORT: process.env.DB_PORT || null,
        DB_NAME: process.env.DB_NAME || null,
        DB_USER: process.env.DB_USER || null,
        PORT: process.env.PORT || null
      },
      uploads: {
        uploadsDir,
        uploadsDirExists: fs.existsSync(uploadsDir),
        sampleRelativePath: relativeSampleFile,
        sampleAbsolutePath: absoluteSampleFile,
        samplePathInsideUploadsDir: insideUploadsDir,
        sampleExists: insideUploadsDir ? fs.existsSync(absoluteSampleFile) : false
      }
    };

    try {
      const rows = await query(
        "SELECT CURRENT_USER() AS currentUser, DATABASE() AS databaseName, @@hostname AS dbHostName, @@port AS dbPort"
      );
      diagnostics.databaseRuntime = rows[0] || null;
    } catch (error) {
      diagnostics.databaseRuntimeError = error.message;
    }

    res.json(diagnostics);
  } catch (error) {
    next(error);
  }
});
