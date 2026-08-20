"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/validators/auth";
import { PasswordInput } from "@/components/auth/password-input";
import { GoogleButton } from "@/components/auth/google-button";
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
} from "@/components/ui/field";
import { useRegisterMutation } from "@/redux/api/auth-api";
import { useLoading } from "@/hooks/use-loading";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [registerRequest] = useRegisterMutation();
  const { startNavigation } = useLoading();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      tenantName: "",
      rememberMe: true,
    },
  });

  const rememberMe = watch("rememberMe");

  const onSubmit = handleSubmit(async (values) => {
    if (loading) return;
    setLoading(true);
    const { confirmPassword: _confirmPassword, ...payload } = values;
    const response = await registerRequest(payload as any);
    setLoading(false);

    if ("error" in response) {
      const message =
        (response.error &&
        "data" in response.error &&
        response.error.data &&
        typeof response.error.data === "object" &&
        "message" in response.error.data
          ? String((response.error.data as { message?: string }).message)
          : "Registration failed") || "Registration failed";
      toast.error(message);
      return;
    }

    toast.success("Account created. Check your email for verification.");
    startNavigation();
    router.push("/login");
  });


  return (
    <Card
      className={cn("rounded-apple-xl border-border bg-card shadow-xl", className)}
      {...props}
    >
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Create an account
        </CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.name) || undefined}>
              <FieldLabel htmlFor="register-name">Full Name</FieldLabel>
              <Input
                id="register-name"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                required
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="register-tenant-name">Workspace name</FieldLabel>
              <Input
                id="register-tenant-name"
                type="text"
                placeholder="My Store Workspace"
                autoComplete="organization"
                {...register("tenantName")}
              />
              <FieldDescription>
                Optional — you can rename your workspace later.
              </FieldDescription>
            </Field>

            <Field data-invalid={Boolean(errors.email) || undefined}>
              <FieldLabel htmlFor="register-email">Email</FieldLabel>
              <Input
                id="register-email"
                type="email"
                placeholder="m@example.com"
                autoComplete="email"
                required
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
              <FieldError>{errors.email?.message}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.password) || undefined}>
              <FieldLabel htmlFor="register-password">Password</FieldLabel>
              <PasswordInput
                id="register-password"
                autoComplete="new-password"
                required
                aria-invalid={Boolean(errors.password)}
                {...register("password")}
              />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
              <FieldError>{errors.password?.message}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.confirmPassword) || undefined}>
              <FieldLabel htmlFor="register-confirm-password">
                Confirm Password
              </FieldLabel>
              <PasswordInput
                id="register-confirm-password"
                autoComplete="new-password"
                required
                aria-invalid={Boolean(errors.confirmPassword)}
                {...register("confirmPassword")}
              />
              <FieldDescription>Please confirm your password.</FieldDescription>
              <FieldError>{errors.confirmPassword?.message}</FieldError>
            </Field>

            <Field orientation="horizontal">
              <Checkbox
                id="register-remember"
                checked={Boolean(rememberMe)}
                onCheckedChange={(checked) =>
                  setValue("rememberMe", checked === true, { shouldDirty: true })
                }
              />
              <FieldLabel
                htmlFor="register-remember"
                className="font-normal text-muted-foreground"
              >
                Keep me signed in
              </FieldLabel>
            </Field>

            <FieldGroup>
              <Field>
                <Button
                  type="submit"
                  loading={loading}
                  loadingKey="register"
                  className="w-full rounded-pill font-semibold"
                >
                  Create Account
                </Button>
                <GoogleButton label="Sign up with Google" />
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold !text-primary underline-offset-4 hover:underline"
                  >
                    Sign in
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
