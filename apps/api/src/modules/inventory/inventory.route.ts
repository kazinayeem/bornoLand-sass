import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import {
  getInventoryController,
  getInventoryStatsController,
  adjustStockController,
  getStockHistoryController,
  getInventoryAnalyticsController,
  bulkUpdateController,
  bulkArchiveController,
  bulkDeleteController,
} from "./inventory.controller.js";

export const inventoryRouter: Router = Router({ mergeParams: true });

const featureGuard = requireFeatureAccess("inventory", { getStoreId: (req) => String(req.params.storeId) });

inventoryRouter.use(requireAuth);

inventoryRouter.get("/", featureGuard, getInventoryController);
inventoryRouter.get("/stats", featureGuard, getInventoryStatsController);
inventoryRouter.get("/analytics", featureGuard, getInventoryAnalyticsController);
inventoryRouter.get("/history", featureGuard, getStockHistoryController);
inventoryRouter.post("/:productId/adjust", featureGuard, adjustStockController);
inventoryRouter.post("/bulk/update", featureGuard, bulkUpdateController);
inventoryRouter.post("/bulk/archive", featureGuard, bulkArchiveController);
inventoryRouter.post("/bulk/delete", featureGuard, bulkDeleteController);
