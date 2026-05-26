import { Router } from "express";
import { subdomainDetector, resolveStoreFromSubdomain } from "../middleware/subdomain.middleware.js";
import {
  resolveTenantFromSubdomainController,
  resolveTenantBySlugController,
  resolveTenantByHostController,
  resolveProductByHostController,
  resolveProductBySlugController,
  paymentMethodsController,
  deliveryZonesController,
} from "../controllers/public.controller.js";
import { getPublicPageController } from "../controllers/cms.controller.js";

export const publicRouter = Router();

publicRouter.use(subdomainDetector);

publicRouter.get("/tenant", resolveTenantFromSubdomainController);
publicRouter.get("/tenant/:subdomain", resolveTenantBySlugController);
publicRouter.get("/tenant-by-host", resolveTenantByHostController);
publicRouter.get("/product/:slug", resolveProductByHostController);
publicRouter.get("/product/:storeSlug/:productSlug", resolveProductBySlugController);

publicRouter.use(resolveStoreFromSubdomain);
publicRouter.get("/page/:slug", getPublicPageController);
publicRouter.get("/payment-methods", paymentMethodsController);
publicRouter.get("/delivery-zones", deliveryZonesController);
