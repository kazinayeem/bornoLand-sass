"use client";

import { Loader2, Store, Shield } from "lucide-react";
import { useState } from "react";
import { useLoginMutation } from "@/redux/api/auth-api";
import { baseApi } from "@/redux/api/base-api";
import { useAppDispatch } from "@/hooks/redux";
import { setAuthState } from "@/redux/slices/auth-slice";
import { setUserProfile } from "@/redux/slices/user-slice";
import { setTenantContext } from "@/redux/slices/tenant-slice";
import { toast } from "sonner";
import {
  consumeRedirectAfterLogin,
  resolvePostLoginDestination,
} from "@/lib/auth-redirect-client";
import { cn } from "@/lib/utils";

type QuickLoginButtonProps = {
  label: string;
  email: string;
  password: string;
  loginType: "user" | "admin";
  iconType?: "merchant" | "admin";
  className?: string;
};

export function QuickLoginButton({
  label,
  email,
  password,
  loginType,
  iconType = "merchant",
  className,
}: QuickLoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const [login] = useLoginMutation();
  const dispatch = useAppDispatch();

  const handleQuickLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await login({
        email,
        password,
        loginType,
        rememberMe: false,
      });

      if ("error" in response) {
        const message =
          response.error &&
          "data" in response.error &&
          response.error.data &&
          typeof response.error.data === "object" &&
          "message" in response.error.data
            ? String((response.error.data as { message?: string }).message)
            : "Demo login is currently unavailable";
        toast.error(message);
        setLoading(false);
        return;
      }

      const payload = response.data?.data;
      if (!payload?.user || !payload?.session) {
        toast.error("Invalid response received");
        setLoading(false);
        return;
      }

      // Ensure redux states are properly updated with authenticated session
      dispatch(baseApi.util.resetApiState());
      dispatch(setAuthState({ session: payload.session, user: payload.user }));
      dispatch(setUserProfile(payload.user));
      dispatch(setTenantContext({ tenantId: payload.user.tenantId }));

      // Explicit target routing based on role
      const isSuperAdmin = payload.user.role === "super_admin" || loginType === "admin";
      const targetDestination = isSuperAdmin ? "/dashboard" : "/workshops";

      consumeRedirectAfterLogin(null, targetDestination);
      window.location.replace(targetDestination);
    } catch {
      toast.error("Unable to complete demo sign in");
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleQuickLogin}
      disabled={loading}
      className={cn(
        "flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#dfe3e8] dark:border-zinc-800 bg-[#f8fafc] dark:bg-zinc-800/60 px-3 text-xs font-semibold text-[#181c20] dark:text-zinc-200 transition-all hover:bg-[#eef2f6] dark:hover:bg-zinc-800 hover:border-[#cbd5e1] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500" />
      ) : iconType === "admin" ? (
        <Shield className="h-3.5 w-3.5 text-[#1664d9]" />
      ) : (
        <Store className="h-3.5 w-3.5 text-[#006e2a]" />
      )}
      <span>{loading ? "Signing in..." : label}</span>
    </button>
  );
}

export function DemoAuthPanel() {
  return (
    <div className="pt-2 border-t border-[#f1f4fa] dark:border-zinc-800/70">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#727785] dark:text-zinc-400">
          Try BornoLand Demo
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <QuickLoginButton
          label="Demo Merchant"
          email="demo@bornoland.com"
          password="Demo@123"
          loginType="user"
          iconType="merchant"
        />
        <QuickLoginButton
          label="Demo Super Admin"
          email="admin@bornoland.com"
          password="Admin@123"
          loginType="admin"
          iconType="admin"
        />
      </div>
    </div>
  );
}
