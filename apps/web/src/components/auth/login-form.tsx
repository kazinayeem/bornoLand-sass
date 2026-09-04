"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/validators/auth";
import { GoogleButton } from "@/components/auth/google-button";
import { DemoAuthPanel } from "@/components/auth/quick-login-button";
import { PasswordInput } from "@/components/auth/password-input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle } from "lucide-react";
import { useLoginMutation } from "@/redux/api/auth-api";
import { baseApi } from "@/redux/api/base-api";
import { useAppDispatch } from "@/hooks/redux";
import { setAuthState } from "@/redux/slices/auth-slice";
import { setUserProfile } from "@/redux/slices/user-slice";
import { setTenantContext } from "@/redux/slices/tenant-slice";
import {
  consumeRedirectAfterLogin,
  resolvePostLoginDestination,
} from "@/lib/auth-redirect-client";
import { FirstLoginPasswordForm } from "@/components/auth/first-login-password-form";

export function LoginForm({
  className,
  loginType = "user",
}: {
  className?: string;
  loginType?: "user" | "admin";
}) {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pendingFirstLogin, setPendingFirstLogin] = useState<{
    currentPassword: string;
    destination: string;
  } | null>(null);
  const [login] = useLoginMutation();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: { email: "", password: "", rememberMe: false, loginType },
  });

  const rememberMe = watch("rememberMe");

  if (pendingFirstLogin) {
    return (
      <FirstLoginPasswordForm
        currentPassword={pendingFirstLogin.currentPassword}
        onComplete={() => {
          consumeRedirectAfterLogin(null, pendingFirstLogin.destination);
          window.location.replace(pendingFirstLogin.destination);
        }}
      />
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    if (loading) return;
    setAuthError(null);
    setLoading(true);

    try {
      const response = await login({
        email: values.email.trim(),
        password: values.password,
        loginType: loginType ?? values.loginType,
        rememberMe: values.rememberMe,
      });

      if ("error" in response) {
        setLoading(false);
        const errorData = response.error as {
          status?: number | string;
          data?: { message?: string; error?: string };
        };

        if (errorData.status === 429) {
          const rateLimitMsg = "Too many sign-in attempts. Please wait a moment and try again.";
          setAuthError(rateLimitMsg);
          toast.error(rateLimitMsg);
          return;
        }

        const serverMessage =
          errorData.data?.message ||
          (typeof errorData.data === "string" ? errorData.data : undefined);

        const genericMsg = serverMessage || "Incorrect email or password.";
        setAuthError(genericMsg);
        toast.error(genericMsg);
        return;
      }

      const payload = response.data?.data;
      if (!payload?.user || !payload?.session) {
        setLoading(false);
        const invalidMsg = "Invalid authentication response received. Please try again.";
        setAuthError(invalidMsg);
        toast.error(invalidMsg);
        return;
      }

      // Commit Redux session and tenant state
      dispatch(baseApi.util.resetApiState());
      dispatch(setAuthState({ session: payload.session, user: payload.user }));
      dispatch(setUserProfile(payload.user));
      dispatch(setTenantContext({ tenantId: payload.user.tenantId }));

      const queryRedirect =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect")
          : null;

      const finalDestination = resolvePostLoginDestination(payload, queryRedirect);

      if (payload.mustChangePassword || payload.session?.mustChangePassword || payload.user?.mustChangePassword) {
        setPendingFirstLogin({
          currentPassword: values.password,
          destination: finalDestination,
        });
        setLoading(false);
        return;
      }

      consumeRedirectAfterLogin(null, finalDestination);
      window.location.replace(finalDestination);
    } catch {
      setLoading(false);
      const networkErrorMsg = "Unable to connect to the authentication service. Please check your network.";
      setAuthError(networkErrorMsg);
      toast.error(networkErrorMsg);
    }
  });

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#181c20] dark:text-white">
          {loginType === "admin" ? "Super Admin Portal" : "Welcome back"}
        </h1>
        <p className="text-xs sm:text-sm text-[#727785] dark:text-zinc-400">
          {loginType === "admin"
            ? "Sign in to BornoLand platform administration."
            : "Sign in to manage your business."}
        </p>
      </div>

      {/* Auth Error Notification Banner */}
      {authError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 animate-in fade-in-50 duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{authError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {/* Email or Employee ID */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold text-[#181c20] dark:text-zinc-200"
          >
            Email or Employee ID
          </label>
          <input
            id="login-email"
            type="text"
            placeholder="name@company.com or EMP-0001"
            autoComplete="username"
            disabled={loading}
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
            className={cn(
              "flex h-11 w-full rounded-xl border border-[#dfe3e8] dark:border-zinc-800 bg-white dark:bg-zinc-900/90 px-3.5 text-sm text-[#181c20] dark:text-zinc-100 placeholder:text-[#727785] transition-all focus:border-[#1664d9] focus:outline-none focus:ring-2 focus:ring-[#1664d9]/15 disabled:cursor-not-allowed disabled:bg-zinc-50 dark:disabled:bg-zinc-900/50 disabled:text-zinc-400",
              errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500/15"
            )}
          />
          {errors.email?.message && (
            <p className="text-[11px] font-medium text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-[#181c20] dark:text-zinc-200"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[#1664d9] hover:text-[#004caf] dark:text-[#60a5fa] transition-colors underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="login-password"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={loading}
            error={Boolean(errors.password)}
            {...register("password")}
          />
          {errors.password?.message && (
            <p className="text-[11px] font-medium text-red-600 dark:text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2 pt-0.5">
          <input
            id="login-remember"
            type="checkbox"
            checked={Boolean(rememberMe)}
            onChange={(e) => setValue("rememberMe", e.target.checked, { shouldDirty: true })}
            disabled={loading}
            className="h-4 w-4 rounded border-[#dfe3e8] text-[#1664d9] focus:ring-[#1664d9] cursor-pointer"
          />
          <label
            htmlFor="login-remember"
            className="text-xs text-[#424754] dark:text-zinc-400 cursor-pointer select-none"
          >
            Remember me on this device
          </label>
        </div>

        {/* Primary Action */}
        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1664d9] hover:bg-[#004caf] active:bg-[#003e91] text-white text-sm font-bold shadow-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign in</span>
          )}
        </button>

        {/* Social Authentication */}
        {loginType !== "admin" && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#dfe3e8] dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-white dark:bg-zinc-900 px-3 text-[#727785] font-medium">
                  OR
                </span>
              </div>
            </div>

            <GoogleButton label="Continue with Google" />

            {/* Quick Demo Login */}
            <DemoAuthPanel />
          </>
        )}
      </form>

      {/* Account Navigation */}
      {loginType !== "admin" ? (
        <div className="text-center pt-2 border-t border-[#f1f4fa] dark:border-zinc-800/70">
          <p className="text-xs text-[#727785] dark:text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-[#1664d9] hover:text-[#004caf] dark:text-[#60a5fa] transition-colors underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      ) : (
        <div className="text-center pt-2 border-t border-[#f1f4fa] dark:border-zinc-800/70">
          <Link
            href="/login"
            className="text-xs font-semibold text-[#727785] hover:text-[#181c20] dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            ← Back to Merchant Sign in
          </Link>
        </div>
      )}
    </div>
  );
}
