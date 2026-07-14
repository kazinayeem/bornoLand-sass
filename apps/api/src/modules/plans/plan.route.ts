import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { createPlanController, deletePlanController, duplicatePlanController, getPlanPriceController, listPlansController, updatePlanController } from "./plan.controller.js";
import { getStoreSubscriptionDashboardController, getStoreDashboardStatsController, initiateCheckoutController, checkoutCallbackController } from "./subscription.controller.js";

export const planRouter: Router = Router();

planRouter.use(requireAuth);

planRouter.post("/store/:storeId/checkout", initiateCheckoutController);
planRouter.post("/checkout/callback", checkoutCallbackController);

planRouter.get("/", listPlansController);
planRouter.get("/store/:storeId/subscription", getStoreSubscriptionDashboardController);
planRouter.get("/store/:storeId/stats", getStoreDashboardStatsController);
planRouter.get("/:id/price", getPlanPriceController);
planRouter.post("/", createPlanController);
planRouter.post("/:id/duplicate", duplicatePlanController);
planRouter.put("/:id", updatePlanController);
planRouter.delete("/:id", deletePlanController);