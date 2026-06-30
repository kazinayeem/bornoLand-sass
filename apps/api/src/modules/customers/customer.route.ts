import { Router } from "express";
import { subdomainDetector, resolveStoreFromSubdomain } from "../../common/middleware/subdomain.middleware.js";
import { registerController, loginController, meController } from "./customer.controller.js";

export const customerRouter: Router = Router();

customerRouter.use(subdomainDetector);
customerRouter.use(resolveStoreFromSubdomain);

customerRouter.post("/register", registerController);
customerRouter.post("/login", loginController);
customerRouter.get("/me", meController);
