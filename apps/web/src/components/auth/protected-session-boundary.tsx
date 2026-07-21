"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMeQuery } from "@/redux/api/auth-api";
import { getLoginUrlForCurrentPage } from "@/lib/auth-redirect-client";
import { BuilderLoadingScreen } from "@/components/builder/builder-loading-screen";

function isBuilderPath(pathname: string | null) {
  if (!pathname) return false;
  return pathname.includes("/builder");
}

export function SessionRestoreScreen() {
  const pathname = usePathname();

  if (isBuilderPath(pathname)) {
    return <BuilderLoadingScreen message="Preparing your workspace…" />;
  }

  return (
    <BuilderLoadingScreen
      compact
      message="Preparing your workspace…"
      className="min-h-[60vh]"
    />
  );
}

export function ProtectedSessionBoundary({
  children,
  requiredRole,
  loginPath = "/login",
}: {
  children: React.ReactNode;
  requiredRole?: string;
  loginPath?: string;
}) {
  const router = useRouter();
  const [authExpired, setAuthExpired] = useState(false);
  const { data, isLoading, isFetching, isError } = useMeQuery();
  const session = data?.data?.session;
  const checking = isLoading || (!data && (isFetching || !isError));
  const allowed = !authExpired && Boolean(session && (!requiredRole || session.role === requiredRole));

  useEffect(() => {
    const handleExpired = () => {
      setAuthExpired(true);
      router.replace(getLoginUrlForCurrentPage(loginPath));
    };
    window.addEventListener("app:auth-expired", handleExpired);
    return () => window.removeEventListener("app:auth-expired", handleExpired);
  }, [loginPath, router]);

  useEffect(() => {
    if (checking) return;
    if (!session) {
      router.replace(getLoginUrlForCurrentPage(loginPath));
      return;
    }
    if (requiredRole && session.role !== requiredRole) router.replace("/unauthorized");
  }, [checking, loginPath, requiredRole, router, session]);

  if (checking || authExpired || !allowed) return <SessionRestoreScreen />;
  return <>{children}</>;
}
