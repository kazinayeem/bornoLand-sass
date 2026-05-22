import { Router } from "express";
import { subdomainDetector } from "../middleware/subdomain.middleware.js";
import {
  resolveTenantFromSubdomainController,
  resolveTenantBySlugController,
  resolveTenantByHostController,
} from "../controllers/public.controller.js";

export const publicRouter = Router();

// Apply subdomain detection to all public routes
publicRouter.use(subdomainDetector);

// GET /public/tenant — resolves from Host header subdomain
publicRouter.get("/tenant", resolveTenantFromSubdomainController);

// GET /public/tenant/:subdomain — resolves by explicit slug
publicRouter.get("/tenant/:subdomain", resolveTenantBySlugController);

// GET /public/tenant-by-host — resolves from query param ?subdomain=
publicRouter.get("/tenant-by-host", resolveTenantByHostController);
