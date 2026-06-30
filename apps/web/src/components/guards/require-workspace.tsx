"use client";

import { useCurrentWorkspace } from "@/features/session/hooks";

type RequireWorkspaceProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function RequireWorkspace({ children, fallback = null }: RequireWorkspaceProps) {
  const workspace = useCurrentWorkspace();
  if (!workspace.id) return <>{fallback}</>;
  return <>{children}</>;
}
