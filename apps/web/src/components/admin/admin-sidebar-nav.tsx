"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ADMIN_ACCOUNT_NAV,
  ADMIN_NAV_GROUPS,
  isAdminNavActive,
  type AdminNavGroup,
} from "@/lib/admin/admin-nav-config";

type AdminSidebarNavProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

function NavGroup({
  group,
  collapsed,
  onNavigate,
}: {
  group: AdminNavGroup;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const hasActiveChild = group.items.some((item) => isAdminNavActive(pathname, item.href, item.exact));
  const [open, setOpen] = useState(group.defaultOpen ?? hasActiveChild);

  if (collapsed) {
    return (
      <ul className="space-y-0.5">
        {group.items.map((item) => {
          const active = isAdminNavActive(pathname, item.href, item.exact);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                title={item.label}
                className={cn(
                  "group flex items-center justify-center rounded-xl p-2.5 transition-all",
                  active
                    ? "bg-apple-canvas-parchment text-apple-primary"
                    : "text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink",
                )}
              >
                <item.icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0",
                    active ? "text-apple-primary" : "text-apple-ink-muted-48 group-hover:text-apple-ink-muted-80",
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mb-1 flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48"
      >
        <span>{group.label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul className="space-y-0.5">
          {group.items.map((item) => {
            const active = isAdminNavActive(pathname, item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                    active
                      ? "bg-apple-canvas-parchment text-apple-primary"
                      : "text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0",
                      active ? "text-apple-primary" : "text-apple-ink-muted-48 group-hover:text-apple-ink-muted-80",
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function AdminSidebarNav({ collapsed, onNavigate }: AdminSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      {ADMIN_NAV_GROUPS.map((group) => (
        <NavGroup key={group.id} group={group} collapsed={collapsed} onNavigate={onNavigate} />
      ))}

      {!collapsed && (
        <div className="mt-2 border-t border-apple-divider-soft pt-4">
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">
            Account
          </p>
          <ul className="space-y-0.5">
            {ADMIN_ACCOUNT_NAV.map((item) => {
              const active = isAdminNavActive(pathname, item.href, item.exact);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                      active
                        ? "bg-apple-canvas-parchment text-apple-primary"
                        : "text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink",
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}
