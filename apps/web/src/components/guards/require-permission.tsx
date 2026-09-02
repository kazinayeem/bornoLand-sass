"use client";

import { useHasPermission } from "@/features/session/hooks";

type RequirePermissionProps = {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
};

export function RequirePermission({ children, permission, fallback = null }: RequirePermissionProps) {
  const allowed = useHasPermission(permission);

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
