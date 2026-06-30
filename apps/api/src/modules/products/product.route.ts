import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import {
  listProductsController, getProductController, createProductController,
  updateProductController, deleteProductController, duplicateProductController,
  createVariantController, updateVariantController, deleteVariantController
} from "./product.controller.js";
import {
  syncVariantsController,
  generateVariantsController,
  bulkVariantsController,
  searchVariantsController,
  listOptionTemplatesController,
  createOptionTemplateController,
} from "./variants/variant.controller.js";

export const productRouter: Router = Router();

productRouter.use(requireAuth);

productRouter.get("/item/:id", getProductController);
productRouter.get("/:storeId", listProductsController);
productRouter.post("/:storeId/create", requireFeatureAccess("products", { checkLimit: true }), createProductController);
productRouter.put("/:storeId/:id", updateProductController);
productRouter.delete("/:storeId/:id", deleteProductController);
productRouter.post("/:storeId/:id/duplicate", duplicateProductController);
productRouter.post("/:storeId/:id/variants/sync", requireFeatureAccess("product_variants"), syncVariantsController);
productRouter.post("/:storeId/:id/variants/generate", requireFeatureAccess("product_variants"), generateVariantsController);
productRouter.post("/:storeId/:id/variants/bulk", requireFeatureAccess("variant_bulk_tools"), bulkVariantsController);
productRouter.get("/:storeId/variants/search", searchVariantsController);
productRouter.get("/option-templates", listOptionTemplatesController);
productRouter.post("/option-templates", createOptionTemplateController);
productRouter.post("/:storeId/:id/variants", requireFeatureAccess("product_variants"), createVariantController);
productRouter.put("/:storeId/:id/variants/:variantId", requireFeatureAccess("product_variants"), updateVariantController);
productRouter.delete("/:storeId/:id/variants/:variantId", requireFeatureAccess("product_variants"), deleteVariantController);
