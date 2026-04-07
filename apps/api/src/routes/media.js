import { Router } from "express";
import path from "path";
import crypto from "node:crypto";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { z } from "zod";
import { query } from "../db/pool.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createHttpError } from "../utils/errors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../../uploads/media");

const uploadSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(3),
  dataUrl: z.string().min(20),
  altText: z.string().optional().nullable()
});

const allowedMimeTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"]
]);

export const mediaRouter = Router();

mediaRouter.post("/upload", requireAuth, requireRole("super_admin", "admin"), async (req, res, next) => {
  try {
    const data = uploadSchema.parse(req.body);
    const extension = allowedMimeTypes.get(data.mimeType);

    if (!extension) {
      throw createHttpError(400, "Only JPG, PNG, WEBP, and GIF uploads are supported");
    }

    const matches = data.dataUrl.match(/^data:(.+);base64,(.+)$/);

    if (!matches) {
      throw createHttpError(400, "Invalid image payload");
    }

    const fileBuffer = Buffer.from(matches[2], "base64");

    if (fileBuffer.length > 10 * 1024 * 1024) {
      throw createHttpError(400, "Image must be 10MB or smaller");
    }

    await fs.mkdir(uploadsDir, { recursive: true });

    const baseName = path
      .basename(data.fileName, path.extname(data.fileName))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "image";
    const storedFileName = `${Date.now()}-${crypto.randomUUID()}-${baseName}${extension}`;
    const absolutePath = path.join(uploadsDir, storedFileName);
    const publicPath = `/uploads/media/${storedFileName}`;

    await fs.writeFile(absolutePath, fileBuffer);

    const result = await query(
      `
        INSERT INTO media_assets (
          file_name, original_name, mime_type, file_extension, file_path, file_url, file_size_bytes, alt_text, uploaded_by_admin_id
        )
        VALUES (
          :fileName, :originalName, :mimeType, :fileExtension, :filePath, :fileUrl, :fileSizeBytes, :altText, :uploadedByAdminId
        )
      `,
      {
        fileName: storedFileName,
        originalName: data.fileName,
        mimeType: data.mimeType,
        fileExtension: extension,
        filePath: absolutePath,
        fileUrl: `${req.protocol}://${req.get("host")}${publicPath}`,
        fileSizeBytes: fileBuffer.length,
        altText: data.altText || null,
        uploadedByAdminId: req.admin.id
      }
    );

    res.status(201).json({
      mediaAsset: {
        id: result.insertId,
        fileName: storedFileName,
        fileUrl: `${req.protocol}://${req.get("host")}${publicPath}`,
        altText: data.altText || null
      }
    });
  } catch (error) {
    next(error);
  }
});
