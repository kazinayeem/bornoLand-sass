import { Router } from "express";
import { subdomainDetector, resolveStoreFromSubdomain } from "../middleware/subdomain.middleware.js";
import { registerController, loginController, meController } from "../controllers/customer.controller.js";

export const customerRouter = Router();

customerRouter.use(subdomainDetector);
customerRouter.use(resolveStoreFromSubdomain);

customerRouter.post("/register", registerController);
customerRouter.post("/login", loginController);
customerRouter.get("/me", meController);
