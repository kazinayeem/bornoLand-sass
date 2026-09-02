"use client";

import { useHasPermission } from "@/features/session/hooks";

type RequireStorePermissionProps = {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
};

export function RequireStorePermission({
  children,
  permission,
  fallback = null,
}: RequireStorePermissionProps) {
  const allowed = useHasPermission(permission);

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
