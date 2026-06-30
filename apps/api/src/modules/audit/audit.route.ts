import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireRole } from "../../common/middleware/role.middleware.js";
import {
  adminExportAuditLogsController,
  adminListAuditLogsController,
  adminPurgeAuditLogsController,
  storeExportAuditLogsController,
  storeListAuditLogsController,
  workspaceExportAuditLogsController,
  workspaceListAuditLogsController,
} from "./audit.controller.js";

export const auditRouter: Router = Router();

auditRouter.get("/workspace", requireAuth, workspaceListAuditLogsController);
auditRouter.get("/workspace/export", requireAuth, workspaceExportAuditLogsController);

export const storeAuditRouter: Router = Router({ mergeParams: true });
storeAuditRouter.get("/", storeListAuditLogsController);
storeAuditRouter.get("/export", storeExportAuditLogsController);

export const adminAuditRouter: Router = Router();
adminAuditRouter.use(requireAuth);
adminAuditRouter.use(requireRole("super_admin"));
adminAuditRouter.get("/", adminListAuditLogsController);
adminAuditRouter.get("/export", adminExportAuditLogsController);
adminAuditRouter.post("/purge", adminPurgeAuditLogsController);
