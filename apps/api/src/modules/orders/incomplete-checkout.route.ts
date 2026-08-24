import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import {
  getIncompleteCheckoutsController,
  getIncompleteCheckoutByIdController,
  generateRecoveryLinkController,
  trackCheckoutProgressController,
  recoverCheckoutByTokenController,
} from "./incomplete-checkout.controller.js";

export const incompleteCheckoutRouter: Router = Router({ mergeParams: true });

// Shop Owner authenticated routes
incompleteCheckoutRouter.get("/", requireAuth, getIncompleteCheckoutsController);
incompleteCheckoutRouter.get("/:checkoutId", requireAuth, getIncompleteCheckoutByIdController);
incompleteCheckoutRouter.post("/:checkoutId/recovery-link", requireAuth, generateRecoveryLinkController);

// Public / Storefront tracking route
incompleteCheckoutRouter.post("/track", trackCheckoutProgressController);
incompleteCheckoutRouter.get("/recover/:token", recoverCheckoutByTokenController);
