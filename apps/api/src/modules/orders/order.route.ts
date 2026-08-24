import { Router } from "express";
import { subdomainDetector, resolveStoreFromSubdomain } from "../../common/middleware/subdomain.middleware.js";
import { createOrderController, listOrdersController, getOrderController, downloadOrderInvoiceController } from "./order.controller.js";
import { trackCheckoutProgressController, recoverCheckoutByTokenController } from "./incomplete-checkout.controller.js";

export const orderRouter: Router = Router();

orderRouter.use(subdomainDetector);
orderRouter.use(resolveStoreFromSubdomain);

orderRouter.post("/create", createOrderController);
orderRouter.post("/incomplete/track", trackCheckoutProgressController);
orderRouter.get("/recover/:token", recoverCheckoutByTokenController);
orderRouter.get("/", listOrdersController);
orderRouter.get("/:id/invoice.pdf", downloadOrderInvoiceController);
orderRouter.get("/:id", getOrderController);
