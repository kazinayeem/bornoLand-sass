import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireRole } from "../../common/middleware/role.middleware.js";
import {
  approvePaymentController,
  getAdminPaymentMethodsController,
  getPlatformPaymentMethodsController,
  getStorePaymentsController,
  listAdminPaymentsController,
  rejectPaymentController,
  submitStorePaymentController,
  updateAdminPaymentMethodController,
} from "./subscription-payment.controller.js";

export const subscriptionPaymentRouter: Router = Router();

subscriptionPaymentRouter.get("/platform-methods", getPlatformPaymentMethodsController);

subscriptionPaymentRouter.use(requireAuth);

subscriptionPaymentRouter.post("/stores/:storeId", submitStorePaymentController);
subscriptionPaymentRouter.get("/stores/:storeId", getStorePaymentsController);

subscriptionPaymentRouter.use(requireRole("super_admin"));

subscriptionPaymentRouter.get("/admin/methods", getAdminPaymentMethodsController);
subscriptionPaymentRouter.put("/admin/methods/:type", updateAdminPaymentMethodController);
subscriptionPaymentRouter.get("/", listAdminPaymentsController);
subscriptionPaymentRouter.post("/:id/approve", approvePaymentController);
subscriptionPaymentRouter.post("/:id/reject", rejectPaymentController);
