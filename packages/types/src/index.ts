export type Role = "owner" | "admin" | "editor" | "analyst" | "viewer";

export type TenantContext = {
  tenantId: string;
  tenantSlug?: string;
  subdomain?: string;
};

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  tenantId: string;
};