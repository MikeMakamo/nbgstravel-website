import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config/env.js";
import { query } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { createHttpError } from "../utils/errors.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const rows = await query(
      `
        SELECT admins.id, admins.email, admins.password_hash, admins.first_name, admins.last_name, admins.is_active, roles.name AS role
        FROM admins
        INNER JOIN roles ON roles.id = admins.role_id
        WHERE admins.email = :email
        LIMIT 1
      `,
      { email }
    );

    const admin = rows[0];

    if (!admin || !admin.is_active) {
      throw createHttpError(401, "Invalid credentials");
    }

    const passwordMatches = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatches) {
      throw createHttpError(401, "Invalid credentials");
    }

    await query("UPDATE admins SET last_login_at = NOW() WHERE id = :adminId", { adminId: admin.id });

    const token = jwt.sign({ adminId: admin.id, role: admin.role }, config.jwtSecret, {
      expiresIn: "12h"
    });

    res.json({
      token,
      admin: {
        id: admin.id,
        firstName: admin.first_name,
        lastName: admin.last_name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuth, async (req, res) => {
  res.json({ admin: req.admin });
});
