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
] as const;

export type StoreModule = (typeof STORE_MODULES)[number];

// ── Action Keys ────────────────────────────────────────────────────────
export const STORE_ACTIONS = ["read", "create", "update", "delete", "export", "manage"] as const;
export type StoreAction = (typeof STORE_ACTIONS)[number];

// ── Permission String Type ─────────────────────────────────────────────
export type Permission =
  | "*"
  | `${StoreModule}:*`
  | `${StoreModule}:${StoreAction}`;

// ── Role Keys ─────────────────────────────────────────────────────────
export const STORE_MEMBER_ROLES = ["owner", "admin", "manager", "staff", "viewer"] as const;
export type StoreMemberRole = (typeof STORE_MEMBER_ROLES)[number];

// ── Default Permission Presets per Role ───────────────────────────────
export const ROLE_PERMISSION_PRESETS: Record<StoreMemberRole, Permission[]> = {
  owner: ["*"],
  admin: [
    "products:*",
    "categories:*",
    "inventory:*",
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
  ],
  manager: [
    "products:*",
    "categories:read",
    "categories:update",
    "inventory:read",
    "inventory:update",
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

// ── Permission Checking Utilities ──────────────────────────────────────

/**
 * Check if the user's permission array satisfies a required permission.
 * Supports wildcard: `*`, `module:*`, exact `module:action`.
 */
export function hasPermission(
  userPermissions: string[],
  required: string,
): boolean {
  // Super admin wildcard
  if (userPermissions.includes("*")) return true;

  // Exact match
  if (userPermissions.includes(required)) return true;

  // Module wildcard  e.g. "products:*" satisfies "products:read"
  const [module] = required.split(":");
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
 */
export function isValidPermission(perm: string): boolean {
  if (perm === "*") return true;
  const parts = perm.split(":");
  if (parts.length !== 2) return false;
  const [module, action] = parts;
  const validModule = STORE_MODULES.includes(module as StoreModule);
  const validAction = action === "*" || STORE_ACTIONS.includes(action as StoreAction);
  return validModule && validAction;
}
