"use client";

import { useMemo } from "react";
import { usePermissions } from "@/features/session/hooks";

type RequirePermissionProps = {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
};

export function RequirePermission({ children, permission, fallback = null }: RequirePermissionProps) {
  const permissions = usePermissions();
  const allowed = useMemo(() => permissions.has(permission), [permission, permissions]);

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
