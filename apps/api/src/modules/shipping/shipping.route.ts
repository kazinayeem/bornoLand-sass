import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import {
  createShippingZoneController,
  deleteShippingZoneController,
  listShippingZonesController,
  updateShippingZoneController,
} from "./shipping.controller.js";

export const shippingRouter: Router = Router({ mergeParams: true });

shippingRouter.use(requireAuth);
shippingRouter.use(requireFeatureAccess("shipping", { getStoreId: (req) => String(req.params.storeId) }));
shippingRouter.get("/", listShippingZonesController);
shippingRouter.post("/", createShippingZoneController);
shippingRouter.put("/:id", updateShippingZoneController);
shippingRouter.delete("/:id", deleteShippingZoneController);
