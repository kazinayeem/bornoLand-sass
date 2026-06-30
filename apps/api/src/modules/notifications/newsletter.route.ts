import { Router } from "express";
import { subdomainDetector } from "../../common/middleware/subdomain.middleware.js";
import { resolveStoreFromSubdomain } from "../../common/middleware/subdomain.middleware.js";
import { subscribeController } from "./newsletter.controller.js";

export const newsletterRouter: Router = Router();

newsletterRouter.use(subdomainDetector);
newsletterRouter.use(resolveStoreFromSubdomain);

newsletterRouter.post("/subscribe", subscribeController);
