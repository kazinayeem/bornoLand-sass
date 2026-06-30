import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import {
  createTaxClassController,
  deleteTaxClassController,
  listTaxClassesController,
  updateTaxClassController,
} from "./tax.controller.js";

export const taxRouter: Router = Router({ mergeParams: true });

taxRouter.use(requireAuth);
taxRouter.get("/", listTaxClassesController);
taxRouter.post("/", createTaxClassController);
taxRouter.put("/:id", updateTaxClassController);
taxRouter.delete("/:id", deleteTaxClassController);
