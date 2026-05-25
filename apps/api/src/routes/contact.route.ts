import { Router } from "express";
import { subdomainDetector } from "../middleware/subdomain.middleware.js";
import { resolveStoreFromSubdomain } from "../middleware/subdomain.middleware.js";
import { contactController } from "../controllers/contact.controller.js";

export const contactRouter = Router();

contactRouter.use(subdomainDetector);
contactRouter.use(resolveStoreFromSubdomain);

contactRouter.post("/submit", contactController);
