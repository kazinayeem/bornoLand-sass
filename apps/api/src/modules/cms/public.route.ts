import { Router } from "express";
import { subdomainDetector, resolveStoreFromSubdomain } from "../../common/middleware/subdomain.middleware.js";
import {
  resolveTenantFromSubdomainController,
  resolveTenantBySlugController,
  resolveTenantByHostController,
  resolveProductByHostController,
  resolveProductBySlugController,
  paymentMethodsController,
  deliveryZonesController,
} from "./public.controller.js";
import { getPublicPageController, getPublicFaqsController, getPublicBlogPostsController } from "./cms.controller.js";
import { getPublicStoreContactController } from "../stores/store-contact.controller.js";
import { trackOrderController } from "../orders/order.controller.js";

export const publicRouter: Router = Router();

publicRouter.use(subdomainDetector);

publicRouter.get("/tenant", resolveTenantFromSubdomainController);
publicRouter.get("/tenant/:subdomain", resolveTenantBySlugController);
publicRouter.get("/tenant-by-host", resolveTenantByHostController);
publicRouter.get("/product/:slug", resolveProductByHostController);
publicRouter.get("/product/:storeSlug/:productSlug", resolveProductBySlugController);

publicRouter.use(resolveStoreFromSubdomain);
publicRouter.get("/page/:slug", getPublicPageController);
publicRouter.get("/faqs", getPublicFaqsController);
publicRouter.get("/blog/posts", getPublicBlogPostsController);
publicRouter.get("/contact", getPublicStoreContactController);
publicRouter.get("/payment-methods", paymentMethodsController);
publicRouter.get("/delivery-zones", deliveryZonesController);
publicRouter.get("/order-track", trackOrderController);
