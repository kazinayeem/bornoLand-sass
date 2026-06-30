import { Router } from "express";
import { subdomainDetector } from "../../common/middleware/subdomain.middleware.js";
import { resolveStoreFromSubdomain } from "../../common/middleware/subdomain.middleware.js";
import { contactController } from "./contact.controller.js";

export const contactRouter: Router = Router();

contactRouter.use(subdomainDetector);
contactRouter.use(resolveStoreFromSubdomain);

contactRouter.post("/submit", contactController);
