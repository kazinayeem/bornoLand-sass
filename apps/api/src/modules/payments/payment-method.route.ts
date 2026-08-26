import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import {
  createController,
  listController,
  updateController,
  deleteController,
} from "./payment-method.controller.js";
import { paymentMethodsController } from "../cms/public.controller.js";

export const paymentMethodRouter: Router = Router();

// Public storefront payment methods
paymentMethodRouter.get("/public", paymentMethodsController);
paymentMethodRouter.get("/store/:storeId/public", paymentMethodsController);
paymentMethodRouter.get("/public/store/:storeId", paymentMethodsController);

// Authenticated merchant management
paymentMethodRouter.use(requireAuth);

paymentMethodRouter.get("/store/:storeId", listController);
paymentMethodRouter.post("/store/:storeId", createController);
paymentMethodRouter.put("/store/:storeId/:id", updateController);
paymentMethodRouter.delete("/store/:storeId/:id", deleteController);
