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

export function LoginForm({
  className,
  loginType = "user",
  ...props
}: React.ComponentProps<"div"> & { loginType?: "user" | "admin" }) {
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
            {loginType === "admin" ? "Admin login" : "Login to your account"}
          </CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
              <Field data-invalid={Boolean(errors.email) || undefined}>
                <FieldLabel htmlFor="login-email">Email</FieldLabel>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  required
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
                <FieldError>{errors.email?.message}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.password) || undefined}>
                <div className="flex items-center gap-2">
                  <FieldLabel htmlFor="login-password">Password</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm font-medium !text-primary underline-offset-4 hover:underline"
                  >
                    Forgot your password?
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
                  Remember me
                </FieldLabel>
              </Field>

              <Field>
                <Button
                  type="submit"
                  loading={loading}
                  loadingKey="login"
                  className="w-full rounded-pill font-semibold"
                >
                  {loginType === "admin" ? "Admin Sign In" : "Login"}
                </Button>
                <GoogleButton label="Login with Google" />
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="font-semibold !text-primary underline-offset-4 hover:underline"
                  >
                    Sign up
                  </Link>
                </FieldDescription>
              </Field>

              <FieldSeparator>Or quick demo</FieldSeparator>

              <Field>
                <div className="grid gap-2.5 sm:grid-cols-2">
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
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
