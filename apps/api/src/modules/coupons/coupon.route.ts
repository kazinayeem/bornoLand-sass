import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import {
  createCouponController,
  deleteCouponController,
  getCouponController,
  listCouponsController,
  updateCouponController,
  validateCouponController,
} from "./coupon.controller.js";

export const couponRouter: Router = Router({ mergeParams: true });

// Public coupon validation endpoint under store params
couponRouter.post("/validate", validateCouponController);

couponRouter.use(requireAuth);

couponRouter.get("/", listCouponsController);
couponRouter.get("/:id", getCouponController);
couponRouter.post("/", requireFeatureAccess("coupons", { getStoreId: (req) => String(req.params.storeId) }), createCouponController);
couponRouter.put("/:id", requireFeatureAccess("coupons", { getStoreId: (req) => String(req.params.storeId) }), updateCouponController);
couponRouter.delete("/:id", requireFeatureAccess("coupons", { getStoreId: (req) => String(req.params.storeId) }), deleteCouponController);
