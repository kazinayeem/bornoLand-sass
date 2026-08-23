import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import {
  listBrandsController, getBrandController, createBrandController,
  updateBrandController, deleteBrandController, reorderBrandsController
} from "./brand.controller.js";

export const brandRouter: Router = Router();

// Public brand querying by storeId (e.g. for storefronts)
brandRouter.get("/:storeId", listBrandsController);
brandRouter.get("/:storeId/:id", getBrandController);

// Authenticated management operations
brandRouter.post("/:storeId/create", requireAuth, createBrandController);
brandRouter.put("/:storeId/reorder", requireAuth, reorderBrandsController);
brandRouter.put("/:storeId/:id", requireAuth, updateBrandController);
brandRouter.delete("/:storeId/:id", requireAuth, deleteBrandController);
