import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { createPlanController, deletePlanController, listPlansController, updatePlanController } from "../controllers/plan.controller.js";

export const planRouter = Router();

planRouter.use(requireAuth);

planRouter.get("/", listPlansController);
planRouter.post("/", createPlanController);
planRouter.put("/:id", updatePlanController);
planRouter.delete("/:id", deletePlanController);