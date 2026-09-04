/**
 * Canonical RBAC permission types for BornoLand multi-tenant store members.
 *
 * Permission strings follow the pattern:  `module:action`
 * Wildcards: `*` (all modules all actions),  `module:*` (all actions on module)
 *
 * Backend middleware and frontend hooks both reference this file.
 */

// ── Module Keys ────────────────────────────────────────────────────────
export const STORE_MODULES = [
  "products",
  "categories",
  "inventory",
  "warehouse",
  "procurement",
  "pos",
  "orders",
  "customers",
  "coupons",
  "reviews",
  "pages",
  "media",
  "analytics",
  "settings",
  "members",
  "billing",
  "marketing",
  "shipping",
  "payments",
  "reports",
  "hrm",
  "finance",
] as const;

export type StoreModule = (typeof STORE_MODULES)[number];

// ── Action Keys ────────────────────────────────────────────────────────
export const STORE_ACTIONS = ["read", "create", "update", "delete", "export", "manage", "refund"] as const;
export type StoreAction = (typeof STORE_ACTIONS)[number];

// ── Permission String Type ─────────────────────────────────────────────
export type Permission =
  | "*"
  | `${StoreModule}:*`
  | `${StoreModule}:${StoreAction}`
  | `${StoreModule}:self:${StoreAction}`;

// ── Role Keys ─────────────────────────────────────────────────────────
export const STORE_MEMBER_ROLES = [
  "owner",
  "admin",
  "store_manager",
  "manager",
  "hr_manager",
  "hr_staff",
  "accountant",
  "finance_manager",
  "sales_manager",
  "cashier",
  "inventory_manager",
  "inventory_staff",
  "warehouse_manager",
  "warehouse_staff",
  "purchasing_manager",
  "purchasing_staff",
  "crm_manager",
  "support_agent",
  "marketing_manager",
  "employee",
  "staff",
  "viewer",
] as const;
export type StoreMemberRole = (typeof STORE_MEMBER_ROLES)[number];

// ── Default Permission Presets per Role ───────────────────────────────
export const ROLE_PERMISSION_PRESETS: Record<StoreMemberRole, Permission[]> = {
  owner: ["*"],
  admin: [
    "products:*",
    "categories:*",
    "inventory:*",
    "warehouse:*",
    "procurement:*",
    "pos:*",
    "orders:*",
    "customers:*",
    "coupons:*",
    "reviews:*",
    "pages:*",
    "media:*",
    "analytics:read",
    "analytics:export",
    "settings:read",
    "settings:update",
    "members:read",
    "members:manage",
    "marketing:*",
    "shipping:*",
    "payments:read",
    "reports:read",
    "reports:export",
    "finance:read",
    "hrm:*",
  ],
  store_manager: [
    "products:*",
    "categories:*",
    "inventory:*",
    "warehouse:*",
    "procurement:*",
    "pos:*",
    "orders:*",
    "customers:*",
    "reviews:*",
    "media:*",
    "analytics:read",
    "marketing:*",
    "shipping:*",
    "reports:read",
    "hrm:read",
    "finance:read",
  ],
  manager: [
    "products:*",
    "categories:read",
    "categories:update",
    "inventory:read",
    "inventory:update",
    "warehouse:read",
    "warehouse:update",
    "procurement:read",
    "pos:*",
    "orders:*",
    "customers:read",
    "customers:update",
    "reviews:read",
    "reviews:update",
    "media:read",
    "media:create",
    "analytics:read",
    "marketing:read",
    "marketing:create",
    "marketing:update",
    "shipping:read",
    "reports:read",
  ],
  hr_manager: [
    "hrm:*",
    "members:read",
    "members:manage",
    "reports:read",
  ],
  hr_staff: [
    "hrm:read",
    "hrm:create",
    "hrm:update",
    "members:read",
  ],
  accountant: [
    "finance:*",
    "reports:read",
    "orders:read",
    "billing:read",
  ],
  finance_manager: [
    "finance:*",
    "reports:*",
    "billing:*",
    "orders:read",
    "hrm:read",
  ],
  sales_manager: [
    "orders:*",
    "customers:*",
    "pos:*",
    "coupons:*",
    "reviews:*",
    "products:read",
    "analytics:read",
  ],
  cashier: [
    "pos:*",
    "products:read",
    "orders:read",
    "orders:create",
    "customers:read",
    "customers:create",
  ],
  inventory_manager: [
    "inventory:*",
    "warehouse:*",
    "procurement:*",
    "products:*",
    "categories:*",
  ],
  inventory_staff: [
    "inventory:read",
    "inventory:update",
    "warehouse:read",
    "products:read",
  ],
  warehouse_manager: [
    "warehouse:*",
    "inventory:*",
    "shipping:*",
    "products:read",
  ],
  warehouse_staff: [
    "warehouse:read",
    "warehouse:update",
    "inventory:read",
    "shipping:read",
  ],
  purchasing_manager: [
    "procurement:*",
    "inventory:*",
    "warehouse:read",
    "products:read",
  ],
  purchasing_staff: [
    "procurement:read",
    "procurement:create",
    "inventory:read",
  ],
  crm_manager: [
    "customers:*",
    "reviews:*",
    "marketing:read",
  ],
  support_agent: [
    "customers:read",
    "orders:read",
    "reviews:read",
  ],
  marketing_manager: [
    "marketing:*",
    "coupons:*",
    "analytics:read",
    "pages:read",
    "media:*",
  ],
  employee: [
    "hrm:self:read",
    "hrm:self:create",
    "hrm:self:delete",
  ],
  staff: [
    "products:read",
    "products:create",
    "products:update",
    "categories:read",
    "inventory:read",
    "orders:read",
    "orders:update",
    "customers:read",
    "media:read",
    "media:create",
    "pos:read",
    "pos:create",
  ],
  viewer: [
    "products:read",
    "categories:read",
    "inventory:read",
    "orders:read",
    "customers:read",
    "analytics:read",
    "reports:read",
  ],
};

// ── Role Default Landing Path Helper ──────────────────────────────────
export function getRoleDefaultLandingPath(role: string, storeSlug: string): string {
  const r = (role || "").toLowerCase().trim();
  if (r === "cashier") return `/store/${storeSlug}/pos`;
  if (r === "employee") return `/store/${storeSlug}/hrm/self-service`;
  if (
    r === "warehouse_manager" ||
    r === "warehouse_staff" ||
    r === "inventory_manager" ||
    r === "inventory_staff"
  ) {
    return `/store/${storeSlug}/inventory`;
  }
  if (r === "accountant" || r === "finance_manager") {
    return `/store/${storeSlug}/finance/reports`;
  }
  if (r === "hr_manager" || r === "hr_staff") {
    return `/store/${storeSlug}/hrm/employees`;
  }
  return `/store/${storeSlug}/dashboard`;
}

// ── Permission Checking Utilities ──────────────────────────────────────

/**
 * Check if the user's permission array satisfies a required permission.
 * Supports wildcard: `*`, `module:*`, exact `module:action`.
 * Self-service permissions (e.g. `hrm:self:read`) require explicit assignment;
 * they are NOT automatically satisfied by broader module permissions.
 */
export function hasPermission(
  userPermissions: string[],
  required: string,
): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  if (userPermissions.includes("*")) return true;
  if (userPermissions.includes(required)) return true;

  // Module wildcard e.g. "products:*" satisfies "products:read"
  const [module] = required.split(/[:.]/);
  if (module && userPermissions.includes(`${module}:*`)) return true;

  return false;
}

/**
 * Check if the user has ALL of the required permissions.
 */
export function hasAllPermissions(
  userPermissions: string[],
  required: string[],
): boolean {
  return required.every((perm) => hasPermission(userPermissions, perm));
}

/**
 * Check if the user has ANY of the required permissions.
 */
export function hasAnyPermission(
  userPermissions: string[],
  required: string[],
): boolean {
  return required.some((perm) => hasPermission(userPermissions, perm));
}

/**
 * Expand a role to its default permission set.
 */
export function roleToPermissions(role: StoreMemberRole): Permission[] {
  return ROLE_PERMISSION_PRESETS[role] ?? ROLE_PERMISSION_PRESETS.viewer;
}

/**
 * Validate a permission string against the canonical format.
 * Supports: `*`, `module:*`, `module:action`, `module:self:action`
 */
export function isValidPermission(perm: string): boolean {
  if (perm === "*") return true;
  const parts = perm.split(":");
  if (parts.length === 2) {
    const [module, action] = parts;
    const validModule = STORE_MODULES.includes(module as StoreModule);
    const validAction = action === "*" || STORE_ACTIONS.includes(action as StoreAction);
    return validModule && validAction;
  }
  if (parts.length === 3) {
    const [module, self, action] = parts;
    if (self !== "self") return false;
    const validModule = STORE_MODULES.includes(module as StoreModule);
    const validAction = STORE_ACTIONS.includes(action as StoreAction);
    return validModule && validAction;
  }
  return false;
}
