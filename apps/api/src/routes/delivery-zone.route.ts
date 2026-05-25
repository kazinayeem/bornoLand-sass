import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  createController,
  listController,
  updateController,
  deleteController,
} from "../controllers/delivery-zone.controller.js";

export const deliveryZoneRouter = Router();

deliveryZoneRouter.use(requireAuth);

deliveryZoneRouter.get("/store/:storeId", listController);
deliveryZoneRouter.post("/store/:storeId", createController);
deliveryZoneRouter.put("/store/:storeId/:id", updateController);
deliveryZoneRouter.delete("/store/:storeId/:id", deleteController);
