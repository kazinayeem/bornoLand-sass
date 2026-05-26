import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  listCategoriesController, getCategoryController, createCategoryController,
  updateCategoryController, deleteCategoryController, reorderCategoriesController
} from "../controllers/category.controller.js";

export const categoryRouter = Router();

categoryRouter.use(requireAuth);

categoryRouter.get("/:storeId", listCategoriesController);
categoryRouter.get("/:storeId/:id", getCategoryController);
categoryRouter.post("/:storeId/create", createCategoryController);
categoryRouter.put("/:storeId/reorder", reorderCategoriesController);
categoryRouter.put("/:storeId/:id", updateCategoryController);
categoryRouter.delete("/:storeId/:id", deleteCategoryController);
