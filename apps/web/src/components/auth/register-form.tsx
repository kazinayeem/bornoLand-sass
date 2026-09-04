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
import { useLanguage } from "@/providers/language-provider";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  const { language } = useLanguage();
  const isBn = false;
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
          : isBn ? "রেজিস্ট্রেশন ব্যর্থ হয়েছে" : "Registration failed") || (isBn ? "রেজিস্ট্রেশন ব্যর্থ হয়েছে" : "Registration failed");
      toast.error(message);
      return;
    }

    toast.success(isBn ? "অ্যাকাউন্ট তৈরি হয়েছে। ভেরিফিকেশনের জন্য ইমেইল চেক করুন।" : "Account created. Check your email for verification.");
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
          {isBn ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "Create your account"}
        </CardTitle>
        <CardDescription>
          {isBn ? "আপনার ই-কমার্স ব্যবসা শুরু করতে নিজের তথ্য লিখুন" : "Enter your details to start your e-commerce store"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.name) || undefined}>
              <FieldLabel htmlFor="register-name">{isBn ? "আপনার পূর্ণ নাম" : "Full name"}</FieldLabel>
              <Input
                id="register-name"
                type="text"
                placeholder={isBn ? "যেমন: মোঃ তামিম রহমান" : "e.g. Tamim Rahman"}
                autoComplete="name"
                required
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="register-tenant-name">{isBn ? "ওয়ার্কস্পেসের নাম" : "Workspace name"}</FieldLabel>
              <Input
                id="register-tenant-name"
                type="text"
                placeholder={isBn ? "যেমন: ফ্যাশন হাউজ ওয়ার্কস্পেস" : "e.g. Fashion House Workspace"}
                autoComplete="organization"
                {...register("tenantName")}
              />
              <FieldDescription>
                {isBn ? "ঐচ্ছিক — আপনি পরবর্তীতে ওয়ার্কস্পেসের নাম পরিবর্তন করতে পারবেন।" : "Optional — you can change your workspace name anytime later."}
              </FieldDescription>
            </Field>

            <Field data-invalid={Boolean(errors.email) || undefined}>
              <FieldLabel htmlFor="register-email">{isBn ? "ইমেইল ঠিকানা" : "Email address"}</FieldLabel>
              <Input
                id="register-email"
                type="email"
                placeholder={isBn ? "যেমন: name@example.com" : "name@example.com"}
                autoComplete="email"
                required
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              <FieldDescription>
                {isBn ? "আপনার অ্যাকাউন্টের তথ্যাদি প্রেরণের জন্য ব্যবহার করা হবে।" : "Used for account security and notifications."}
              </FieldDescription>
              <FieldError>{errors.email?.message}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.password) || undefined}>
              <FieldLabel htmlFor="register-password">{isBn ? "পাসওয়ার্ড" : "Password"}</FieldLabel>
              <PasswordInput
                id="register-password"
                placeholder={isBn ? "পাসওয়ার্ড লিখুন" : "Enter password"}
                autoComplete="new-password"
                required
                aria-invalid={Boolean(errors.password)}
                {...register("password")}
              />
              <FieldDescription>
                {isBn ? "কমপক্ষে ৮ অক্ষরের শক্তিশালী পাসওয়ার্ড দিন।" : "At least 8 characters long."}
              </FieldDescription>
              <FieldError>{errors.password?.message}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.confirmPassword) || undefined}>
              <FieldLabel htmlFor="register-confirm-password">
                {isBn ? "পাসওয়ার্ড নিশ্চিত করুন" : "Confirm password"}
              </FieldLabel>
              <PasswordInput
                id="register-confirm-password"
                placeholder={isBn ? "পাসওয়ার্ড পুনরায় লিখুন" : "Re-enter password"}
                autoComplete="new-password"
                required
                aria-invalid={Boolean(errors.confirmPassword)}
                {...register("confirmPassword")}
              />
              <FieldDescription>{isBn ? "একই পাসওয়ার্ড পুনরায় লিখুন।" : "Re-enter the same password."}</FieldDescription>
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
                {isBn ? "আমাকে সাইন ইন রাখুন" : "Keep me signed in"}
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
                  {isBn ? "অ্যাকাউন্ট তৈরি করুন" : "Create Account"}
                </Button>
                <GoogleButton label={isBn ? "Google দিয়ে রেজিস্ট্রেশন করুন" : "Sign up with Google"} />
                <FieldDescription className="text-center">
                  {isBn ? "ইতিমধ্যে অ্যাকাউন্ট আছে? " : "Already have an account? "}
                  <Link
                    href="/login"
                    className="font-semibold !text-primary underline-offset-4 hover:underline"
                  >
                    {isBn ? "লগইন করুন" : "Sign in"}
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
