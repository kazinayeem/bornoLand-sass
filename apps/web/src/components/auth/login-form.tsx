"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/validators/auth";
import { GoogleButton } from "@/components/auth/google-button";
import { QuickLoginButton } from "@/components/auth/quick-login-button";
import { PasswordInput } from "@/components/auth/password-input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/redux/api/auth-api";
import { useAppDispatch } from "@/hooks/redux";
import { setAuthState } from "@/redux/slices/auth-slice";
import { setUserProfile } from "@/redux/slices/user-slice";
import { setTenantContext } from "@/redux/slices/tenant-slice";
import { consumeRedirectAfterLogin } from "@/lib/auth-redirect-client";

export function LoginForm({ loginType = "user" }: { loginType?: "user" | "admin" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [login] = useLoginMutation();
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: { email: "", password: "", rememberMe: false, loginType }
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    const response = await login({
      email: values.email,
      password: values.password,
      loginType: loginType ?? values.loginType,
      rememberMe: values.rememberMe
    });
    setLoading(false);

    if ("error" in response) {
      const message =
        (response.error && "data" in response.error && response.error.data && typeof response.error.data === "object" && "message" in response.error.data
          ? String((response.error.data as { message?: string }).message)
          : "Login failed") || "Login failed";
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

    const queryRedirect = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null;
    const destination = consumeRedirectAfterLogin(queryRedirect, loginType === "admin" ? "/admin/dashboard" : "/dashboard");
    router.replace(destination);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="you@example.com"
          className="h-11 rounded-sm border-apple-hairline bg-apple-canvas-parchment/50 px-4 dark:border-apple-hairline dark:bg-apple-surface-tile-1/50"
          {...register("email")}
        />
        {errors.email ? <p className="text-xs text-red-500">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <PasswordInput id="login-password" placeholder="••••••••" {...register("password")} />
        {errors.password ? <p className="text-xs text-red-500">{errors.password.message}</p> : null}
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-sm text-apple-ink-muted-80 dark:text-apple-ink-muted-48">
          <input type="checkbox" {...register("rememberMe")} className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
          Remember me
        </label>
        <a href="/forgot-password" className="text-sm font-medium text-apple-primary hover:text-apple-primary-focus">
          Forgot password?
        </a>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="h-11 w-full rounded-pill bg-apple-primary text-sm font-semibold text-apple-on-primary hover:bg-apple-primary-focus"
      >
        {loading ? "Signing in..." : loginType === "admin" ? "Admin Sign In" : "Sign in"}
      </Button>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-apple-hairline dark:border-apple-hairline" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-apple-canvas px-3 text-[11px] font-medium uppercase tracking-[0.28em] text-apple-ink-muted-48 dark:bg-apple-surface-black">or continue with</span>
        </div>
      </div>

      <GoogleButton label="Continue with Google" />

      <div className="rounded-lg border border-dashed border-apple-hairline bg-apple-canvas-parchment/80 p-4 dark:border-apple-hairline dark:bg-apple-surface-tile-1/40">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-apple-ink-muted-48">Quick demo access</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <QuickLoginButton
            label="Quick user login"
            email="demo@bornoland.com"
            password="Demo@123"
            loginType="user"
            callbackUrl="/dashboard"
          />
          <QuickLoginButton
            label="Quick admin login"
            email="admin@bornoland.com"
            password="Admin@123"
            loginType="admin"
            callbackUrl="/admin/dashboard"
          />
        </div>
      </div>

      <p className="text-center text-sm text-apple-ink-muted-80 dark:text-apple-ink-muted-48">
        New here?{" "}
        <a href="/register" className="font-semibold text-apple-primary hover:text-apple-primary-focus">
          Create an account
        </a>
      </p>
    </form>
  );
}
