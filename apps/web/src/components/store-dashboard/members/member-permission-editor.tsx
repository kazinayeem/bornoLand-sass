"use client";

import { useMemo } from "react";
import { Check, Shield, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type PermissionModuleGroup = {
  id: string;
  name: string;
  description: string;
  permissions: {
    key: string;
    label: string;
    description?: string;
  }[];
};

export const PERMISSION_GROUPS: PermissionModuleGroup[] = [
  {
    id: "orders",
    name: "Orders & Sales",
    description: "Manage store orders, status updates, notes, and refunds",
    permissions: [
      { key: "orders:read", label: "View Orders", description: "Browse order list and details" },
      { key: "orders:create", label: "Create Orders", description: "Create manual / POS orders" },
      { key: "orders:update", label: "Update Orders", description: "Update status, shipping, and notes" },
      { key: "orders:delete", label: "Refund / Cancel", description: "Process refunds and order cancellations" },
    ],
  },
  {
    id: "products",
    name: "Products & Catalog",
    description: "Manage product listings, variants, pricing, and categories",
    permissions: [
      { key: "products:read", label: "View Products", description: "Browse catalog and product list" },
      { key: "products:create", label: "Add Products", description: "Create new products" },
      { key: "products:update", label: "Edit Products", description: "Modify pricing, variants, descriptions" },
      { key: "products:delete", label: "Delete Products", description: "Archive or remove products" },
      { key: "categories:read", label: "View Categories", description: "Browse categories" },
      { key: "categories:update", label: "Manage Categories", description: "Create and organize categories" },
    ],
  },
  {
    id: "inventory",
    name: "Inventory & Stock",
    description: "Manage stock counts, adjustments, and warehouse logs",
    permissions: [
      { key: "inventory:read", label: "View Inventory", description: "View stock levels and logs" },
      { key: "inventory:update", label: "Adjust Stock", description: "Update stock counts and batch data" },
    ],
  },
  {
    id: "customers",
    name: "Customers",
    description: "Manage customer profiles, order history, and contact details",
    permissions: [
      { key: "customers:read", label: "View Customers", description: "Browse customer list and profiles" },
      { key: "customers:update", label: "Edit Customers", description: "Update customer tags, notes, and status" },
    ],
  },
  {
    id: "growth",
    name: "Marketing & Discounts",
    description: "Manage promotional coupons, campaigns, and tracking pixels",
    permissions: [
      { key: "coupons:read", label: "View Coupons", description: "View active discount codes" },
      { key: "coupons:update", label: "Manage Coupons", description: "Create and edit coupon codes" },
      { key: "marketing:read", label: "View Marketing", description: "View campaigns and pixel settings" },
      { key: "marketing:update", label: "Manage Marketing", description: "Configure tracking and campaigns" },
    ],
  },
  {
    id: "analytics",
    name: "Analytics & Reports",
    description: "Store traffic, sales metrics, revenue analytics, and data exports",
    permissions: [
      { key: "analytics:read", label: "View Analytics", description: "View visitor metrics and dashboards" },
      { key: "analytics:export", label: "Export Analytics", description: "Export analytics data" },
      { key: "reports:read", label: "View Reports", description: "Access detailed financial and sales reports" },
      { key: "reports:export", label: "Export Reports", description: "Download CSV / Excel report files" },
    ],
  },
  {
    id: "content",
    name: "Pages & Media",
    description: "Storefront pages, website builder, banners, and media library",
    permissions: [
      { key: "pages:read", label: "View Pages", description: "Browse store pages and templates" },
      { key: "pages:update", label: "Edit Pages & Design", description: "Edit layout, builder, and themes" },
      { key: "media:read", label: "View Media", description: "Browse uploaded photos and assets" },
      { key: "media:create", label: "Upload Media", description: "Upload new assets to media library" },
    ],
  },
  {
    id: "operations",
    name: "Operations & Shipping",
    description: "Shipping rates, courier integrations, and payment gateways",
    permissions: [
      { key: "shipping:read", label: "View Shipping", description: "View shipping zones and courier configs" },
      { key: "shipping:update", label: "Manage Shipping", description: "Configure shipping methods and couriers" },
      { key: "payments:read", label: "View Payments", description: "View payment gateway statuses" },
    ],
  },
  {
    id: "management",
    name: "Team & Settings",
    description: "Manage staff members and general store settings",
    permissions: [
      { key: "settings:read", label: "View Settings", description: "View store general settings" },
      { key: "settings:manage", label: "Manage Settings", description: "Update store preferences, domains, branding" },
      { key: "members:read", label: "View Team", description: "Browse staff list and role assignments" },
      { key: "members:manage", label: "Manage Team", description: "Invite, update, or remove team members" },
    ],
  },
];

type MemberPermissionEditorProps = {
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
  role?: string;
};

export function MemberPermissionEditor({
  selectedPermissions,
  onChange,
  disabled = false,
  role,
}: MemberPermissionEditorProps) {
  const isOwner = role === "owner";

  const isSelected = (key: string) => {
    if (isOwner) return true;
    if (selectedPermissions.includes("*")) return true;
    if (selectedPermissions.includes(key)) return true;
    const [mod] = key.split(":");
    return selectedPermissions.includes(`${mod}:*`);
  };

  const togglePermission = (key: string) => {
    if (disabled || isOwner) return;

    const exists = isSelected(key);
    let updated: string[];

    if (exists) {
      updated = selectedPermissions.filter((p) => p !== key && p !== "*");
    } else {
      updated = [...selectedPermissions.filter((p) => p !== "*"), key];
      // Auto-enable read when enabling write
      const [mod, act] = key.split(":");
      if (act !== "read") {
        const readKey = `${mod}:read`;
        if (!updated.includes(readKey)) {
          updated.push(readKey);
        }
      }
    }

    onChange(updated);
  };

  const selectAllInGroup = (group: PermissionModuleGroup) => {
    if (disabled || isOwner) return;
    const keys = group.permissions.map((p) => p.key);
    const allSelected = keys.every((k) => isSelected(k));

    if (allSelected) {
      onChange(selectedPermissions.filter((p) => !keys.includes(p)));
    } else {
      const merged = Array.from(new Set([...selectedPermissions, ...keys]));
      onChange(merged);
    }
  };

  return (
    <div className="space-y-6">
      {isOwner && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-700 dark:text-emerald-300">
          <Shield className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>The store owner has full unrestricted access (all permissions).</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {PERMISSION_GROUPS.map((group) => {
          const allSelected = group.permissions.every((p) => isSelected(p.key));
          const someSelected = group.permissions.some((p) => isSelected(p.key));

          return (
            <div
              key={group.id}
              className="rounded-xl border border-zinc-200/80 bg-white p-4 transition-all dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800/80">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{group.name}</h4>
                  <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{group.description}</p>
                </div>
                {!isOwner && !disabled && (
                  <button
                    type="button"
                    onClick={() => selectAllInGroup(group)}
                    className="text-[11px] font-medium text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                  >
                    {allSelected ? "Clear" : "All"}
                  </button>
                )}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {group.permissions.map((perm) => {
                  const checked = isSelected(perm.key);

                  return (
                    <button
                      key={perm.key}
                      type="button"
                      disabled={disabled || isOwner}
                      onClick={() => togglePermission(perm.key)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg border p-2 text-left text-xs transition-all",
                        checked
                          ? "border-zinc-900 bg-zinc-900/5 text-zinc-950 dark:border-white/30 dark:bg-white/5 dark:text-white font-medium"
                          : "border-zinc-200/60 bg-zinc-50/50 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800/60 dark:bg-zinc-900/30 dark:text-zinc-400 dark:hover:border-zinc-700",
                        disabled || isOwner ? "cursor-default" : "cursor-pointer"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                          checked
                            ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                            : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800"
                        )}
                      >
                        {checked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{perm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
