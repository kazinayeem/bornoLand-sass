"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMeQuery } from "@/redux/api/auth-api";
import { getLoginUrlForCurrentPage } from "@/lib/auth-redirect-client";

export function SessionRestoreScreen() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#f8f9fb] px-4" role="status" aria-live="polite">
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-apple-ink-muted-80 shadow-sm ring-1 ring-zinc-200">
          <ShieldCheck className="h-6 w-6" />
          <Loader2 className="absolute -bottom-1 -right-1 h-5 w-5 animate-spin rounded-full bg-white p-0.5 text-blue-600" />
        </div>
        <p className="mt-4 text-sm font-semibold text-apple-ink">Restoring your session</p>
        <p className="mt-1 text-xs text-apple-ink-muted-48">Taking you back to where you left off…</p>
      </div>
    </div>
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
