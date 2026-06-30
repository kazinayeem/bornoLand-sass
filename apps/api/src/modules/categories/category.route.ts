import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import {
  listCategoriesController, getCategoryController, createCategoryController,
  updateCategoryController, deleteCategoryController, reorderCategoriesController
} from "./category.controller.js";

export const categoryRouter: Router = Router();

categoryRouter.use(requireAuth);

categoryRouter.get("/:storeId", listCategoriesController);
categoryRouter.get("/:storeId/:id", getCategoryController);
categoryRouter.post("/:storeId/create", requireFeatureAccess("categories", { checkLimit: true }), createCategoryController);
categoryRouter.put("/:storeId/reorder", reorderCategoriesController);
categoryRouter.put("/:storeId/:id", updateCategoryController);
categoryRouter.delete("/:storeId/:id", deleteCategoryController);
