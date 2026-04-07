import { Router } from "express";
import { authRouter } from "./auth.js";
import { packageRouter } from "./packages.js";
import { visaRouter } from "./visas.js";
import { bookingRouter } from "./bookings.js";
import { inquiryRouter } from "./inquiries.js";
import { abandonedLeadRouter } from "./abandonedLeads.js";
import { reviewRouter } from "./reviews.js";
import { paymentRouter } from "./payments.js";
import { dashboardRouter } from "./dashboard.js";
import { mediaRouter } from "./media.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/packages", packageRouter);
apiRouter.use("/visas", visaRouter);
apiRouter.use("/bookings", bookingRouter);
apiRouter.use("/inquiries", inquiryRouter);
apiRouter.use("/abandoned-leads", abandonedLeadRouter);
apiRouter.use("/reviews", reviewRouter);
apiRouter.use("/payments", paymentRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/media", mediaRouter);
