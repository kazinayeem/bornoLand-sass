import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

export const adminRouter = Router();

adminRouter.use(requireAuth);

adminRouter.get("/overview", async (_request, response) => {
  response.json({
    message: "Admin dashboard overview",
    widgets: ["tenants", "subscriptions", "system-health", "audit-trail"]
  });
});