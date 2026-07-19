"use client";

import { ProtectedSessionBoundary } from "@/components/auth/protected-session-boundary";

type RequireAuthProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

export function RequireAuth({ children, redirectTo = "/login" }: RequireAuthProps) {
  return <ProtectedSessionBoundary loginPath={redirectTo}>{children}</ProtectedSessionBoundary>;
}
