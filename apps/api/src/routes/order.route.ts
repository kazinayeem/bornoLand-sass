import { Router } from "express";
import { subdomainDetector, resolveStoreFromSubdomain } from "../middleware/subdomain.middleware.js";
import { createOrderController, listOrdersController, getOrderController } from "../controllers/order.controller.js";

export const orderRouter = Router();

orderRouter.use(subdomainDetector);
orderRouter.use(resolveStoreFromSubdomain);

orderRouter.post("/create", createOrderController);
orderRouter.get("/", listOrdersController);
orderRouter.get("/:id", getOrderController);
