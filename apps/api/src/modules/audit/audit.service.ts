import { randomUUID } from "node:crypto";
import type { FilterQuery } from "mongoose";
import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../stores/store.model.js";
import { UserModel } from "../users/user.model.js";
import { TenantModel } from "../workspaces/tenant.model.js";
import { AUDIT_RETENTION_DAYS } from "./audit.constants.js";
import { AuditLogModel, type AuditLogDocument } from "./audit-log.model.js";
import { buildDescription, computeChanges, optionalObjectId } from "./audit.utils.js";
import { buildAuditRequestContext, type AuditRequestContext } from "./audit-request.helper.js";
import type { Request } from "express";

export type RecordAuditInput = {
  action: string;
  module: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  tenantId?: string;
  workspaceName?: string;
  storeId?: string;
  storeName?: string;
  actorId?: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  oldValue?: unknown;
  newValue?: unknown;
  changes?: Array<{ field: string; oldValue: unknown; newValue: unknown }>;
  description?: string;
  status?: "success" | "failure";
  metadata?: Record<string, unknown>;
  requestContext?: AuditRequestContext;
};

export type AuditListFilters = {
  page?: number;
  limit?: number;
  search?: string;
  tenantId?: string;
  storeId?: string;
  actorId?: string;
  action?: string;
  module?: string;
  status?: string;
  ipAddress?: string;
  entityType?: string;
  entityId?: string;
  from?: string;
  to?: string;
};

async function resolveActor(actorId?: string) {
  if (!actorId) return null;
  const actor = await UserModel.findById(actorId).select("name email role tenantId").lean();
  return actor as { _id: unknown; name?: string; email?: string; role?: string; tenantId?: unknown } | null;
}

async function resolveStore(storeId?: string) {
  if (!storeId) return null;
  const store = await StoreModel.findById(storeId).select("name tenantId plan").lean();
  return store as { _id: unknown; name?: string; tenantId?: unknown; plan?: string } | null;
}

async function resolveTenant(tenantId?: string) {
  if (!tenantId) return null;
  const tenant = await TenantModel.findById(tenantId).select("name plan").lean();
  return tenant as { name?: string; plan?: string } | null;
}

function retentionCutoff(planSlug?: string) {
  const days = AUDIT_RETENTION_DAYS[planSlug ?? "free"] ?? AUDIT_RETENTION_DAYS.free;
  if (days === null) return null;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff;
}

export async function recordAudit(input: RecordAuditInput) {
  try {
    await connectDatabase();

    const actor = await resolveActor(input.actorId ?? input.requestContext?.actorId);
    const store = await resolveStore(input.storeId);
    const resolvedTenantId =
      optionalObjectId(input.tenantId) ??
      optionalObjectId(store?.tenantId) ??
      optionalObjectId(actor?.tenantId) ??
      optionalObjectId(input.requestContext?.tenantId);
    const tenant = await resolveTenant(resolvedTenantId);

    const changes =
      input.changes ??
      (input.oldValue || input.newValue
        ? computeChanges(
            input.oldValue as Record<string, unknown> | null,
            input.newValue as Record<string, unknown> | null,
          )
        : []);

    const ctx = input.requestContext;
    const description =
      input.description ?? buildDescription(input.action, input.entityName, changes);

    await AuditLogModel.create({
      auditId: randomUUID(),
      tenantId: resolvedTenantId,
      workspaceName: input.workspaceName ?? tenant?.name ?? "",
      storeId: optionalObjectId(input.storeId),
      storeName: input.storeName ?? store?.name ?? "",
      actorId: optionalObjectId(input.actorId ?? actor?._id ?? ctx?.actorId),
      actorName: input.actorName ?? actor?.name ?? "",
      actorEmail: input.actorEmail ?? actor?.email ?? "",
      actorRole: input.actorRole ?? actor?.role ?? ctx?.actorRole ?? "",
      action: input.action,
      module: input.module,
      entityType: input.entityType,
      entityId: optionalObjectId(input.entityId),
      entityName: input.entityName ?? "",
      oldValue: input.oldValue,
      newValue: input.newValue,
      changes,
      description,
      ipAddress: ctx?.ipAddress ?? "",
      country: ctx?.country ?? "",
      city: ctx?.city ?? "",
      device: ctx?.device ?? "",
      browser: ctx?.browser ?? "",
      operatingSystem: ctx?.operatingSystem ?? "",
      userAgent: ctx?.userAgent ?? "",
      sessionId: ctx?.sessionId ?? "",
      status: input.status ?? "success",
      metadata: input.metadata,
      immutable: true,
    });
  } catch (error) {
    console.error("[audit] failed to record:", error);
  }
}

export async function recordAuditFromRequest(request: Request, input: Omit<RecordAuditInput, "requestContext">) {
  return recordAudit({ ...input, requestContext: buildAuditRequestContext(request) });
}

function buildQuery(filters: AuditListFilters, retentionPlan?: string) {
  const query: FilterQuery<AuditLogDocument> = {};
  const cutoff = retentionCutoff(retentionPlan);
  if (cutoff) {
    query.createdAt = { ...(query.createdAt as object), $gte: cutoff };
  }

  if (filters.tenantId) query.tenantId = filters.tenantId;
  if (filters.storeId) query.storeId = filters.storeId;
  if (filters.actorId) query.actorId = filters.actorId;
  if (filters.action) query.action = filters.action;
  if (filters.module) query.module = filters.module;
  if (filters.status) query.status = filters.status;
  if (filters.ipAddress) query.ipAddress = { $regex: filters.ipAddress, $options: "i" };
  if (filters.entityType) query.entityType = filters.entityType;
  if (filters.entityId) query.entityId = filters.entityId;

  if (filters.from || filters.to) {
    query.createdAt = query.createdAt ?? {};
    if (filters.from) (query.createdAt as Record<string, Date>).$gte = new Date(filters.from);
    if (filters.to) (query.createdAt as Record<string, Date>).$lte = new Date(filters.to);
  }

  if (filters.search?.trim()) {
    query.$text = { $search: filters.search.trim() };
  }

  return query;
}

export async function listAuditLogs(filters: AuditListFilters, retentionPlan?: string) {
  await connectDatabase();
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 25));
  const skip = (page - 1) * limit;
  const query = buildQuery(filters, retentionPlan);

  const [items, total] = await Promise.all([
    AuditLogModel.find(query)
      .sort(filters.search ? { score: { $meta: "textScore" }, createdAt: -1 } : { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLogModel.countDocuments(query),
  ]);

  return {
    ok: true as const,
    data: {
      items: items.map(serializeAuditLog),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  };
}

function serializeAuditLog(doc: Record<string, unknown>) {
  return {
    id: String(doc._id),
    auditId: doc.auditId,
    tenantId: doc.tenantId ? String(doc.tenantId) : null,
    workspaceName: doc.workspaceName ?? "",
    storeId: doc.storeId ? String(doc.storeId) : null,
    storeName: doc.storeName ?? "",
    actorId: doc.actorId ? String(doc.actorId) : null,
    actorName: doc.actorName ?? "",
    actorEmail: doc.actorEmail ?? "",
    actorRole: doc.actorRole ?? "",
    action: doc.action,
    module: doc.module,
    entityType: doc.entityType,
    entityId: doc.entityId ? String(doc.entityId) : null,
    entityName: doc.entityName ?? "",
    oldValue: doc.oldValue ?? null,
    newValue: doc.newValue ?? null,
    changes: doc.changes ?? [],
    description: doc.description ?? "",
    ipAddress: doc.ipAddress ?? "",
    country: doc.country ?? "",
    city: doc.city ?? "",
    device: doc.device ?? "",
    browser: doc.browser ?? "",
    operatingSystem: doc.operatingSystem ?? "",
    sessionId: doc.sessionId ?? "",
    status: doc.status ?? "success",
    metadata: doc.metadata ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function exportAuditLogs(filters: AuditListFilters, retentionPlan?: string) {
  await connectDatabase();
  const query = buildQuery(filters, retentionPlan);
  const items = await AuditLogModel.find(query).sort({ createdAt: -1 }).limit(10000).lean();
  return items.map(serializeAuditLog);
}

export async function purgeExpiredAuditLogs(retentionOverrides?: Record<string, number | null>) {
  await connectDatabase();
  const plans = retentionOverrides ?? AUDIT_RETENTION_DAYS;
  let deleted = 0;

  for (const [plan, days] of Object.entries(plans)) {
    if (days === null) continue;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const stores = await StoreModel.find({ plan }).select("_id").lean();
    const storeIds = stores.map((s) => s._id);

    const result = await AuditLogModel.deleteMany({
      $or: [
        { storeId: { $in: storeIds }, createdAt: { $lt: cutoff } },
        { storeId: { $exists: false }, tenantId: { $exists: true }, createdAt: { $lt: cutoff } },
      ],
    });
    deleted += result.deletedCount ?? 0;
  }

  return { ok: true as const, deleted };
}

export async function assertStoreAuditAccess(userId: string, role: string, storeId: string) {
  const store = await StoreModel.findById(storeId).lean() as { userId?: unknown; tenantId?: unknown; plan?: string } | null;
  if (!store) return { ok: false as const, message: "Store not found" };

  if (role === "super_admin") return { ok: true as const, store };
  if (String(store.userId) === userId) return { ok: true as const, store };
  if (["owner", "admin", "analyst"].includes(role)) {
    const user = await UserModel.findById(userId).lean() as { tenantId?: unknown } | null;
    if (user && String(user.tenantId) === String(store.tenantId)) {
      return { ok: true as const, store };
    }
  }
  return { ok: false as const, message: "Forbidden" };
}

export async function assertWorkspaceAuditAccess(userId: string, role: string, tenantId: string) {
  if (role === "super_admin") return { ok: true as const };
  const user = await UserModel.findById(userId).lean() as { tenantId?: unknown; role?: string } | null;
  if (!user || String(user.tenantId) !== tenantId) {
    return { ok: false as const, message: "Forbidden" };
  }
  if (!["owner", "admin", "analyst"].includes(user.role ?? "")) {
    return { ok: false as const, message: "Insufficient permissions" };
  }
  return { ok: true as const };
}
