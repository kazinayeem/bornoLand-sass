import { Router } from "express";
import { subdomainDetector, resolveStoreFromSubdomain } from "../../common/middleware/subdomain.middleware.js";
import {
  getCartController,
  addToCartController,
  updateCartController,
  removeFromCartController,
  applyCouponController,
  removeCouponController,
  mergeCartController,
  syncCartController,
} from "./cart.controller.js";

export const cartRouter: Router = Router();

cartRouter.use(subdomainDetector);
cartRouter.use(resolveStoreFromSubdomain);

cartRouter.get("/", getCartController);
cartRouter.post("/add", addToCartController);
cartRouter.put("/update", updateCartController);
cartRouter.delete("/remove/:productId", removeFromCartController);
cartRouter.post("/merge", mergeCartController);
cartRouter.post("/sync", syncCartController);
cartRouter.post("/coupon/apply", applyCouponController);
cartRouter.delete("/coupon", removeCouponController);
