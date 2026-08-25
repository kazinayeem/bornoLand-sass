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
          নতুন অ্যাকাউন্ট তৈরি করুন
        </CardTitle>
        <CardDescription>
          আপনার ই-কমার্স ব্যবসা শুরু করতে নিজের তথ্য লিখুন
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.name) || undefined}>
              <FieldLabel htmlFor="register-name">আপনার পূর্ণ নাম</FieldLabel>
              <Input
                id="register-name"
                type="text"
                placeholder="যেমন: মোঃ তামিম রহমান"
                autoComplete="name"
                required
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="register-tenant-name">ওয়ার্কস্পেসের নাম</FieldLabel>
              <Input
                id="register-tenant-name"
                type="text"
                placeholder="যেমন: ফ্যাশন হাউজ ওয়ার্কস্পেস"
                autoComplete="organization"
                {...register("tenantName")}
              />
              <FieldDescription>
                ঐচ্ছিক — আপনি পরবর্তীতে ওয়ার্কস্পেসের নাম পরিবর্তন করতে পারবেন।
              </FieldDescription>
            </Field>

            <Field data-invalid={Boolean(errors.email) || undefined}>
              <FieldLabel htmlFor="register-email">ইমেইল ঠিকানা</FieldLabel>
              <Input
                id="register-email"
                type="email"
                placeholder="যেমন: name@example.com"
                autoComplete="email"
                required
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              <FieldDescription>
                আপনার অ্যাকাউন্টের তথ্যাদি প্রেরণের জন্য ব্যবহার করা হবে।
              </FieldDescription>
              <FieldError>{errors.email?.message}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.password) || undefined}>
              <FieldLabel htmlFor="register-password">পাসওয়ার্ড</FieldLabel>
              <PasswordInput
                id="register-password"
                placeholder="পাসওয়ার্ড লিখুন"
                autoComplete="new-password"
                required
                aria-invalid={Boolean(errors.password)}
                {...register("password")}
              />
              <FieldDescription>
                কমপক্ষে ৮ অক্ষরের শক্তিশালী পাসওয়ার্ড দিন।
              </FieldDescription>
              <FieldError>{errors.password?.message}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.confirmPassword) || undefined}>
              <FieldLabel htmlFor="register-confirm-password">
                পাসওয়ার্ড নিশ্চিত করুন
              </FieldLabel>
              <PasswordInput
                id="register-confirm-password"
                placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                autoComplete="new-password"
                required
                aria-invalid={Boolean(errors.confirmPassword)}
                {...register("confirmPassword")}
              />
              <FieldDescription>একই পাসওয়ার্ড পুনরায় লিখুন।</FieldDescription>
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
                আমাকে সাইন ইন রাখুন
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
                  অ্যাকাউন্ট তৈরি করুন
                </Button>
                <GoogleButton label="Google দিয়ে রেজিস্ট্রেশন করুন" />
                <FieldDescription className="text-center">
                  ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
                  <Link
                    href="/login"
                    className="font-semibold !text-primary underline-offset-4 hover:underline"
                  >
                    লগইন করুন
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
