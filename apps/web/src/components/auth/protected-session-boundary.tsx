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

  const isSuperAdmin = session?.role === "super_admin" || session?.role === "admin";
  const roleMatches = !requiredRole || (requiredRole === "super_admin" ? isSuperAdmin : session?.role === requiredRole);
  const allowed = !authExpired && Boolean(session && roleMatches);

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
    if (requiredRole && !roleMatches) {
      if (requiredRole === "super_admin") {
        const storeSlug =
          session.defaultStoreSlug ||
          (data?.data as any)?.defaultStoreSlug ||
          (data?.data?.user as any)?.defaultStoreSlug;
        if (storeSlug) {
          router.replace(`/store/${storeSlug}/dashboard`);
          return;
        }
      }
      router.replace("/unauthorized");
      return;
    }
    const pathname = window.location.pathname;
    if (
      !requiredRole &&
      isSuperAdmin &&
      pathname.startsWith("/store")
    ) {
      router.replace("/dashboard");
    }
  }, [checking, data, isSuperAdmin, loginPath, requiredRole, roleMatches, router, session]);

  if (checking || authExpired || !allowed) return <SessionRestoreScreen />;
  return <>{children}</>;
}
