import { Router } from "express";
import { query } from "../db/pool.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { syncReviews } from "../services/reviewService.js";

export const reviewRouter = Router();

reviewRouter.get("/", async (req, res, next) => {
  try {
    const rows = await query(
      `
        SELECT id, reviewer_name, reviewer_avatar_url, rating, review_text, reviewed_at
        FROM reviews
        WHERE is_visible = 1
        ORDER BY reviewed_at DESC, id DESC
        LIMIT 12
      `
    );

    res.json({ reviews: rows });
  } catch (error) {
    next(error);
  }
});

reviewRouter.post("/sync", requireAuth, requireRole("super_admin"), async (req, res, next) => {
  try {
    await syncReviews();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});
