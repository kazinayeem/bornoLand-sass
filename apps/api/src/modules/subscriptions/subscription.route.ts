import { Router } from "express";
import type { Response } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { requireRole } from "../../common/middleware/role.middleware.js";
import { getStoreSubscription } from "./store-subscription.service.js";
import { getPlatformSettings } from "../settings/platform-settings.service.js";
import { runBillingCron } from "./billing-cron.service.js";
import { sendSuccess, sendFailure } from "../../common/utils/api-response.js";

export const subscriptionRouter: Router = Router();

subscriptionRouter.get("/billing-config", async (_request, response: Response) => {
  const settings = await getPlatformSettings();
  return response.json({
    data: {
      trialEnabled: settings.trialEnabled !== false,
      trialDays: settings.trialDays ?? 3,
      currencyCode: settings.currencyCode ?? "BDT",
      currencySymbol: settings.currencySymbol ?? "৳",
      enabledDurations: settings.enabledDurations ?? {
        monthly: true,
        quarterly: true,
        halfYearly: true,
        yearly: true,
        lifetime: false,
      },
    },
  });
});

subscriptionRouter.use(requireAuth);

subscriptionRouter.get("/stores/:storeId", async (request: AuthRequest, response: Response) => {
  const result = await getStoreSubscription(request.params.storeId as string);
  return sendSuccess(response, result.data);
});

subscriptionRouter.use(requireRole("super_admin"));

subscriptionRouter.post("/cron/run", async (_request, response: Response) => {
  const results = await runBillingCron();
  return sendSuccess(response, results, "Billing cron completed");
});
