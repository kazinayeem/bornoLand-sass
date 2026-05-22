"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLoginMutation } from "@/redux/api/auth-api";
import { useAppDispatch } from "@/hooks/redux";
import { setAuthState } from "@/redux/slices/auth-slice";
import { setUserProfile } from "@/redux/slices/user-slice";
import { setTenantContext } from "@/redux/slices/tenant-slice";
import { toast } from "sonner";

type QuickLoginButtonProps = {
  label: string;
  email: string;
  password: string;
  loginType: "user" | "admin";
  callbackUrl: string;
};

export function QuickLoginButton({ label, email, password, loginType, callbackUrl }: QuickLoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const [login] = useLoginMutation();
  const dispatch = useAppDispatch();

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full gap-2"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const response = await login({
          email,
          password,
          loginType,
          rememberMe: true
        });
        setLoading(false);

        if ("error" in response) {
          const message =
            (response.error && "data" in response.error && response.error.data && typeof response.error.data === "object" && "message" in response.error.data
              ? String((response.error.data as { message?: string }).message)
              : "Quick login failed") || "Quick login failed";
          toast.error(message);
          return;
        }

        const payload = response.data?.data;
        if (!payload?.user || !payload?.session) {
          toast.error("Invalid login response");
          return;
        }

        dispatch(setAuthState({ session: payload.session, user: payload.user }));
        dispatch(setUserProfile(payload.user));
        dispatch(setTenantContext({ tenantId: payload.user.tenantId }));
        window.location.href = callbackUrl;
      }}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      {label}
    </Button>
  );
}