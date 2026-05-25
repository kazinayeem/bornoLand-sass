import { Router } from "express";
import { subdomainDetector } from "../middleware/subdomain.middleware.js";
import { resolveStoreFromSubdomain } from "../middleware/subdomain.middleware.js";
import { subscribeController } from "../controllers/newsletter.controller.js";

export const newsletterRouter = Router();

newsletterRouter.use(subdomainDetector);
newsletterRouter.use(resolveStoreFromSubdomain);

newsletterRouter.post("/subscribe", subscribeController);
