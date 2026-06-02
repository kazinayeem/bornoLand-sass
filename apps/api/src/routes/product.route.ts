import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  listProductsController, getProductController, createProductController,
  updateProductController, deleteProductController, duplicateProductController,
  createVariantController, updateVariantController, deleteVariantController
} from "../controllers/product.controller.js";

export const productRouter = Router();

productRouter.use(requireAuth);

productRouter.get("/item/:id", getProductController);
productRouter.get("/:storeId", listProductsController);
productRouter.post("/:storeId/create", createProductController);
productRouter.put("/:storeId/:id", updateProductController);
productRouter.delete("/:storeId/:id", deleteProductController);
productRouter.post("/:storeId/:id/duplicate", duplicateProductController);
productRouter.post("/:storeId/:id/variants", createVariantController);
productRouter.put("/:storeId/:id/variants/:variantId", updateVariantController);
productRouter.delete("/:storeId/:id/variants/:variantId", deleteVariantController);
