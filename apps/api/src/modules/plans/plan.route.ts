import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { createPlanController, deletePlanController, duplicatePlanController, getPlanPriceController, listPlansController, updatePlanController } from "./plan.controller.js";

export const planRouter: Router = Router();

planRouter.use(requireAuth);

planRouter.get("/", listPlansController);
planRouter.get("/:id/price", getPlanPriceController);
planRouter.post("/", createPlanController);
planRouter.post("/:id/duplicate", duplicatePlanController);
planRouter.put("/:id", updatePlanController);
planRouter.delete("/:id", deletePlanController);