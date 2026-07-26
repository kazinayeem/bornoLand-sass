import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireRole } from "../../common/middleware/role.middleware.js";
import {
  getStoreCourierAccessController,
  getStoreCourierController,
  listStoreCouriersController,
  testStoreCourierController,
  updateStoreCourierAccessController,
  updateStoreCourierController,
} from "./courier.controller.js";

/**
 * Mounted at /stores/:storeId/couriers
 * Permission checks happen inside the service layer (plan ∩ store providers).
 */
export const courierRouter: Router = Router({ mergeParams: true });

courierRouter.use(requireAuth);

courierRouter.get("/access", getStoreCourierAccessController);
courierRouter.put("/access", requireRole("super_admin"), updateStoreCourierAccessController);
courierRouter.get("/", listStoreCouriersController);
courierRouter.get("/:provider", getStoreCourierController);
courierRouter.put("/:provider", updateStoreCourierController);
courierRouter.post("/:provider/test", testStoreCourierController);
