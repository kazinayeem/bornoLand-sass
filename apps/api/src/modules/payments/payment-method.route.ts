import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import {
  createController,
  listController,
  updateController,
  deleteController,
} from "./payment-method.controller.js";

export const paymentMethodRouter: Router = Router();

paymentMethodRouter.use(requireAuth);

paymentMethodRouter.get("/store/:storeId", listController);
paymentMethodRouter.post("/store/:storeId", createController);
paymentMethodRouter.put("/store/:storeId/:id", updateController);
paymentMethodRouter.delete("/store/:storeId/:id", deleteController);
