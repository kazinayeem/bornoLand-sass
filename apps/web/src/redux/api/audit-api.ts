import { baseApi } from "@/redux/api/base-api";
import { getApiUrl } from "@/lib/urls";

export type AuditChange = {
  field: string;
  oldValue: unknown;
  newValue: unknown;
};

export type AuditLog = {
  id: string;
  auditId: string;
  tenantId: string | null;
  workspaceName: string;
  storeId: string | null;
  storeName: string;
  actorId: string | null;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  module: string;
  entityType: string;
  entityId: string | null;
  entityName: string;
  oldValue: unknown;
  newValue: unknown;
  changes: AuditChange[];
  description: string;
  ipAddress: string;
  country: string;
  city: string;
  device: string;
  browser: string;
  operatingSystem: string;
  sessionId: string;
  status: "success" | "failure";
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type AuditLogFilters = {
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
  from?: string;
  to?: string;
};

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

function buildQuery(filters: AuditLogFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminAuditLogs: builder.query<
      ApiEnvelope<{ items: AuditLog[]; pagination: { page: number; limit: number; total: number; pages: number } }>,
      AuditLogFilters | void
    >({
      query: (filters = {}) => ({ url: `/admin/audit-logs${buildQuery(filters ?? {})}` }),
      providesTags: ["AuditLogs"],
    }),
    getStoreAuditLogs: builder.query<
      ApiEnvelope<{ items: AuditLog[]; pagination: { page: number; limit: number; total: number; pages: number } }>,
      { storeId: string } & AuditLogFilters
    >({
      query: ({ storeId, ...filters }) => ({ url: `/stores/${storeId}/audit-logs${buildQuery(filters)}` }),
      providesTags: ["AuditLogs"],
    }),
    getWorkspaceAuditLogs: builder.query<
      ApiEnvelope<{ items: AuditLog[]; pagination: { page: number; limit: number; total: number; pages: number } }>,
      AuditLogFilters | void
    >({
      query: (filters = {}) => ({ url: `/audit/workspace${buildQuery(filters ?? {})}` }),
      providesTags: ["AuditLogs"],
    }),
  }),
});

export const {
  useGetAdminAuditLogsQuery,
  useGetStoreAuditLogsQuery,
  useGetWorkspaceAuditLogsQuery,
} = auditApi;

export function getAuditExportUrl(scope: "admin" | "store" | "workspace", filters: AuditLogFilters & { storeId?: string }, format: "csv" | "json") {
  const apiBase = getApiUrl();
  const params = new URLSearchParams({ ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)), format });
  if (scope === "admin") return `${apiBase}/admin/audit-logs/export?${params}`;
  if (scope === "store" && filters.storeId) return `${apiBase}/stores/${filters.storeId}/audit-logs/export?${params}`;
  return `${apiBase}/audit/workspace/export?${params}`;
}
