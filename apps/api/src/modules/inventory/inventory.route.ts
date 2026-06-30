import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import { adjustStockController, getInventoryController } from "./inventory.controller.js";

export const inventoryRouter: Router = Router({ mergeParams: true });

inventoryRouter.use(requireAuth);
inventoryRouter.get("/", requireFeatureAccess("inventory", { getStoreId: (req) => String(req.params.storeId) }), getInventoryController);
inventoryRouter.post("/:productId/adjust", requireFeatureAccess("inventory", { getStoreId: (req) => String(req.params.storeId) }), adjustStockController);
