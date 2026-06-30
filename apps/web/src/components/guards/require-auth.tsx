"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useIsAuthenticated } from "@/features/session/hooks";

type RequireAuthProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

export function RequireAuth({ children, redirectTo = "/login" }: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`${redirectTo}?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, pathname, redirectTo, router]);

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
