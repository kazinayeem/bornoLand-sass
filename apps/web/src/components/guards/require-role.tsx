"use client";

import { useCurrentUser } from "@/features/session/hooks";

type RequireRoleProps = {
  children: React.ReactNode;
  roles: string[];
  fallback?: React.ReactNode;
};

export function RequireRole({ children, roles, fallback = null }: RequireRoleProps) {
  const user = useCurrentUser();
  const userRole = typeof user?.role === "string" ? user.role : "";

  if (!roles.length) return <>{children}</>;
  if (!userRole || !roles.includes(userRole)) return <>{fallback}</>;
  return <>{children}</>;
}
