import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { query } from "../db/pool.js";

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const rows = await query(
      `
        SELECT admins.id, admins.email, admins.first_name, admins.last_name, admins.is_active, roles.name AS role
        FROM admins
        INNER JOIN roles ON roles.id = admins.role_id
        WHERE admins.id = :adminId
        LIMIT 1
      `,
      { adminId: decoded.adminId }
    );

    const admin = rows[0];

    if (!admin || !admin.is_active) {
      return res.status(401).json({ message: "Account not available" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
}
