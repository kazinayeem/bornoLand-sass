"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/validators/auth";
import { GoogleButton } from "@/components/auth/google-button";
import { QuickLoginButton } from "@/components/auth/quick-login-button";
import { PasswordInput } from "@/components/auth/password-input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { useLoginMutation } from "@/redux/api/auth-api";
import { useAppDispatch } from "@/hooks/redux";
import { setAuthState } from "@/redux/slices/auth-slice";
import { setUserProfile } from "@/redux/slices/user-slice";
import { setTenantContext } from "@/redux/slices/tenant-slice";
import { consumeRedirectAfterLogin } from "@/lib/auth-redirect-client";
import { useLanguage } from "@/providers/language-provider";

export function LoginForm({
  className,
  loginType = "user",
  ...props
}: React.ComponentProps<"div"> & { loginType?: "user" | "admin" }) {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [loading, setLoading] = useState(false);
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

  const onSubmit = handleSubmit(async (values) => {
    if (loading) return;
    setLoading(true);
    const response = await login({
      email: values.email,
      password: values.password,
      loginType: loginType ?? values.loginType,
      rememberMe: values.rememberMe,
    });
    setLoading(false);

    if ("error" in response) {
      const message =
        (response.error &&
        "data" in response.error &&
        response.error.data &&
        typeof response.error.data === "object" &&
        "message" in response.error.data
          ? String((response.error.data as { message?: string }).message)
          : isBn ? "লগইন ব্যর্থ হয়েছে" : "Login failed") || (isBn ? "লগইন ব্যর্থ হয়েছে" : "Login failed");
      toast.error(message);
      return;
    }

    const payload = response.data?.data;
    if (!payload?.user || !payload?.session) {
      toast.error(isBn ? "অকার্যকর লগইন রেসপন্স" : "Invalid login response");
      return;
    }

    dispatch(setAuthState({ session: payload.session, user: payload.user }));
    dispatch(setUserProfile(payload.user));
    dispatch(setTenantContext({ tenantId: payload.user.tenantId }));

    const queryRedirect =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("redirect")
        : null;
    const destination = consumeRedirectAfterLogin(
      queryRedirect,
      loginType === "admin" ? "/admin/dashboard" : "/dashboard",
    );
    window.location.replace(destination);
  });

  return (
    <div className={cn("flex w-full flex-col gap-6", className)} {...props}>
      <Card className="rounded-apple-xl border-border bg-card shadow-xl">
        <CardHeader className="space-y-1.5">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {loginType === "admin"
              ? isBn ? "এডমিন সাইন ইন" : "Admin Sign In"
              : isBn ? "আপনার অ্যাকাউন্টে লগইন করুন" : "Sign in to your account"}
          </CardTitle>
          <CardDescription>
            {isBn ? "লগইন করতে আপনার নিবন্ধিত ইমেইল ও পাসওয়ার্ড লিখুন" : "Enter your email and password to sign in"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
              <Field data-invalid={Boolean(errors.email) || undefined}>
                <FieldLabel htmlFor="login-email">{isBn ? "ইমেইল ঠিকানা" : "Email address"}</FieldLabel>
                <Input
                  id="login-email"
                  type="email"
                  placeholder={isBn ? "আপনার ইমেইল লিখুন" : "Enter your email"}
                  autoComplete="email"
                  required
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
                <FieldError>{errors.email?.message}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.password) || undefined}>
                <div className="flex items-center gap-2">
                  <FieldLabel htmlFor="login-password">{isBn ? "পাসওয়ার্ড" : "Password"}</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm font-medium !text-primary underline-offset-4 hover:underline"
                  >
                    {isBn ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?"}
                  </Link>
                </div>
                <PasswordInput
                  id="login-password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  aria-invalid={Boolean(errors.password)}
                  {...register("password")}
                />
                <FieldError>{errors.password?.message}</FieldError>
              </Field>

              <Field orientation="horizontal">
                <Checkbox
                  id="login-remember"
                  checked={Boolean(rememberMe)}
                  onCheckedChange={(checked) =>
                    setValue("rememberMe", checked === true, {
                      shouldDirty: true,
                    })
                  }
                />
                <FieldLabel
                  htmlFor="login-remember"
                  className="font-normal text-muted-foreground"
                >
                  {isBn ? "মনে রাখুন" : "Remember me"}
                </FieldLabel>
              </Field>

              <Field>
                <Button
                  type="submit"
                  loading={loading}
                  loadingKey="login"
                  className="w-full rounded-pill font-semibold"
                >
                  {loginType === "admin"
                    ? isBn ? "এডমিন লগইন" : "Admin Login"
                    : isBn ? "লগইন করুন" : "Sign In"}
                </Button>
                <GoogleButton label={isBn ? "Google দিয়ে লগইন করুন" : "Sign in with Google"} />
                <FieldDescription className="text-center">
                  {isBn ? "কোনো অ্যাকাউন্ট নেই? " : "Don't have an account? "}
                  <Link
                    href="/register"
                    className="font-semibold !text-primary underline-offset-4 hover:underline"
                  >
                    {isBn ? "রেজিস্ট্রেশন করুন" : "Sign up"}
                  </Link>
                </FieldDescription>
              </Field>

              <FieldSeparator>{isBn ? "অথবা ডেমো লগইন করুন" : "Or try demo login"}</FieldSeparator>

              <Field>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <QuickLoginButton
                    label={isBn ? "ডেমো মার্চেন্ট লগইন" : "Demo Merchant Login"}
                    email="demo@bornoland.com"
                    password="Demo@123"
                    loginType="user"
                    callbackUrl="/dashboard"
                  />
                  <QuickLoginButton
                    label={isBn ? "ডেমো এডমিন লগইন" : "Demo Admin Login"}
                    email="admin@bornoland.com"
                    password="Admin@123"
                    loginType="admin"
                    callbackUrl="/admin/dashboard"
                  />
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
