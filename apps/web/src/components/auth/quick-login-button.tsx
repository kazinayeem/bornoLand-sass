"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLoginMutation } from "@/redux/api/auth-api";
import { useAppDispatch } from "@/hooks/redux";
import { setAuthState } from "@/redux/slices/auth-slice";
import { setUserProfile } from "@/redux/slices/user-slice";
import { setTenantContext } from "@/redux/slices/tenant-slice";
import { toast } from "sonner";
import { consumeRedirectAfterLogin } from "@/lib/auth-redirect-client";

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
      className="h-10 w-full gap-2 rounded-xl text-sm"
      loading={loading}
      loadingKey="login"
      onClick={async () => {
        setLoading(true);
        const response = await login({
          email,
          password,
          loginType,
          rememberMe: false,
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
        const queryRedirect = new URLSearchParams(window.location.search).get("redirect");
        window.location.replace(consumeRedirectAfterLogin(queryRedirect, callbackUrl));
      }}
    >
      {!loading && <Sparkles className="h-4 w-4" />}
      {label}
    </Button>
  );
}
