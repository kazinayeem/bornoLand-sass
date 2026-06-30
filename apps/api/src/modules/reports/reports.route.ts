import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import {
  couponReportController,
  customerReportController,
  inventoryReportController,
  refundReportController,
  reviewReportController,
  salesReportController,
  taxReportController,
} from "./reports.controller.js";

export const reportsRouter: Router = Router({ mergeParams: true });

reportsRouter.use(requireAuth);
reportsRouter.use(requireFeatureAccess("reports", { minTier: "basic", getStoreId: (req) => String(req.params.storeId) }));

reportsRouter.get("/sales", salesReportController);
reportsRouter.get("/inventory", inventoryReportController);
reportsRouter.get("/coupons", couponReportController);
reportsRouter.get("/customers", customerReportController);
reportsRouter.get("/tax", taxReportController);
reportsRouter.get("/refunds", refundReportController);
reportsRouter.get("/reviews", reviewReportController);
