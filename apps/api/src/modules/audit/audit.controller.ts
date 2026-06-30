import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import {
  assertStoreAuditAccess,
  assertWorkspaceAuditAccess,
  exportAuditLogs,
  listAuditLogs,
  purgeExpiredAuditLogs,
} from "./audit.service.js";

function parseFilters(request: AuthRequest) {
  const q = request.query;
  return {
    page: q.page ? Number(q.page) : 1,
    limit: q.limit ? Number(q.limit) : 25,
    search: typeof q.search === "string" ? q.search : undefined,
    tenantId: typeof q.tenantId === "string" ? q.tenantId : undefined,
    storeId: typeof q.storeId === "string" ? q.storeId : undefined,
    actorId: typeof q.actorId === "string" ? q.actorId : undefined,
    action: typeof q.action === "string" ? q.action : undefined,
    module: typeof q.module === "string" ? q.module : undefined,
    status: typeof q.status === "string" ? q.status : undefined,
    ipAddress: typeof q.ipAddress === "string" ? q.ipAddress : undefined,
    entityType: typeof q.entityType === "string" ? q.entityType : undefined,
    entityId: typeof q.entityId === "string" ? q.entityId : undefined,
    from: typeof q.from === "string" ? q.from : undefined,
    to: typeof q.to === "string" ? q.to : undefined,
  };
}

function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return "";
  const headers = [
    "auditId", "timestamp", "actorName", "actorEmail", "actorRole", "action", "module",
    "entityType", "entityName", "workspaceName", "storeName", "description", "status", "ipAddress",
  ];
  const escape = (value: unknown) => {
    const str = value == null ? "" : String(value);
    return `"${str.replace(/"/g, '""')}"`;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.auditId,
        row.createdAt,
        row.actorName,
        row.actorEmail,
        row.actorRole,
        row.action,
        row.module,
        row.entityType,
        row.entityName,
        row.workspaceName,
        row.storeName,
        row.description,
        row.status,
        row.ipAddress,
      ].map(escape).join(","),
    );
  }
  return lines.join("\n");
}

export async function adminListAuditLogsController(request: AuthRequest, response: Response) {
  const filters = parseFilters(request);
  const result = await listAuditLogs(filters, "enterprise");
  return sendSuccess(response, result.data);
}

export async function adminExportAuditLogsController(request: AuthRequest, response: Response) {
  const filters = parseFilters(request);
  const format = typeof request.query.format === "string" ? request.query.format : "json";
  const rows = await exportAuditLogs(filters, "enterprise");

  if (format === "csv") {
    response.setHeader("Content-Type", "text/csv");
    response.setHeader("Content-Disposition", 'attachment; filename="audit-logs.csv"');
    return response.send(toCsv(rows));
  }

  response.setHeader("Content-Type", "application/json");
  response.setHeader("Content-Disposition", 'attachment; filename="audit-logs.json"');
  return response.json(rows);
}

export async function adminPurgeAuditLogsController(_request: AuthRequest, response: Response) {
  const result = await purgeExpiredAuditLogs();
  return sendSuccess(response, result, `Purged ${result.deleted} expired audit logs`);
}

export async function storeListAuditLogsController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const role = request.user?.role ?? "";
  const storeId = request.params.storeId as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  const access = await assertStoreAuditAccess(userId, role, storeId);
  if (!access.ok) return sendFailure(response, access.message, 403);

  const filters = { ...parseFilters(request), storeId };
  const result = await listAuditLogs(filters, access.store.plan ?? "free");
  return sendSuccess(response, result.data);
}

export async function storeExportAuditLogsController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const role = request.user?.role ?? "";
  const storeId = request.params.storeId as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  const access = await assertStoreAuditAccess(userId, role, storeId);
  if (!access.ok) return sendFailure(response, access.message, 403);

  const filters = { ...parseFilters(request), storeId };
  const format = typeof request.query.format === "string" ? request.query.format : "json";
  const rows = await exportAuditLogs(filters, access.store.plan ?? "free");

  if (format === "csv") {
    response.setHeader("Content-Type", "text/csv");
    response.setHeader("Content-Disposition", 'attachment; filename="store-activity.csv"');
    return response.send(toCsv(rows));
  }

  response.setHeader("Content-Type", "application/json");
  response.setHeader("Content-Disposition", 'attachment; filename="store-activity.json"');
  return response.json(rows);
}

export async function workspaceListAuditLogsController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const role = request.user?.role ?? "";
  const tenantId = request.user?.tenantId;
  if (!userId || !tenantId) return sendFailure(response, "Unauthorized", 401);

  const access = await assertWorkspaceAuditAccess(userId, role, tenantId);
  if (!access.ok) return sendFailure(response, access.message, 403);

  const filters = { ...parseFilters(request), tenantId };
  const result = await listAuditLogs(filters, "business");
  return sendSuccess(response, result.data);
}

export async function workspaceExportAuditLogsController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const role = request.user?.role ?? "";
  const tenantId = request.user?.tenantId;
  if (!userId || !tenantId) return sendFailure(response, "Unauthorized", 401);

  const access = await assertWorkspaceAuditAccess(userId, role, tenantId);
  if (!access.ok) return sendFailure(response, access.message, 403);

  const filters = { ...parseFilters(request), tenantId };
  const format = typeof request.query.format === "string" ? request.query.format : "json";
  const rows = await exportAuditLogs(filters, "business");

  if (format === "csv") {
    response.setHeader("Content-Type", "text/csv");
    response.setHeader("Content-Disposition", 'attachment; filename="workspace-activity.csv"');
    return response.send(toCsv(rows));
  }

  response.setHeader("Content-Type", "application/json");
  response.setHeader("Content-Disposition", 'attachment; filename="workspace-activity.json"');
  return response.json(rows);
}
