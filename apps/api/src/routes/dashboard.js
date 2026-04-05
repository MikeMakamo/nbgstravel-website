import { Router } from "express";
import { query } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", requireAuth, async (req, res, next) => {
  try {
    const [bookingsCount] = await query(`SELECT COUNT(*) AS count FROM bookings WHERE status IN ('new', 'contact_pending')`);
    const [visaCount] = await query(
      `SELECT COUNT(*) AS count FROM visa_applications WHERE status IN ('submitted', 'payment_pending')`
    );
    const [abandonedCount] = await query(
      `SELECT COUNT(*) AS count FROM abandoned_leads WHERE status IN ('new', 'contact_pending')`
    );
    const [packagesCount] = await query(`SELECT COUNT(*) AS count FROM packages`);
    const [reviewsCount] = await query(`SELECT COUNT(*) AS count FROM reviews WHERE is_visible = 1`);

    res.json({
      summary: {
        activeBookings: bookingsCount.count,
        activeVisaApplications: visaCount.count,
        abandonedLeads: abandonedCount.count,
        packages: packagesCount.count,
        visibleReviews: reviewsCount.count
      }
    });
  } catch (error) {
    next(error);
  }
});
