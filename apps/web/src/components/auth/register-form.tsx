"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/validators/auth";
import { PasswordInput } from "@/components/auth/password-input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterMutation } from "@/redux/api/auth-api";

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [registerRequest] = useRegisterMutation();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: { name: "", email: "", password: "", tenantName: "", rememberMe: true }
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    const response = await registerRequest(values as any);
    setLoading(false);

    if ("error" in response) {
      const message =
        (response.error && "data" in response.error && response.error.data && typeof response.error.data === "object" && "message" in response.error.data
          ? String((response.error.data as { message?: string }).message)
          : "Registration failed") || "Registration failed";
      toast.error(message);
      return;
    }

    toast.success("Account created. Check your email for verification.");
    window.location.href = "/login";
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="register-name">Full name</Label>
        <Input
          id="register-name"
          placeholder="Mohammad Ali"
          className="h-11 rounded-xl border-zinc-200 bg-zinc-50/50 px-4 dark:border-zinc-800 dark:bg-zinc-900/50"
          {...register("name")}
        />
        {errors.name ? <p className="text-xs text-red-500">{errors.name.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-tenant-name">Workspace name</Label>
        <Input
          id="register-tenant-name"
          placeholder="My Store Workspace"
          className="h-11 rounded-xl border-zinc-200 bg-zinc-50/50 px-4 dark:border-zinc-800 dark:bg-zinc-900/50"
          {...register("tenantName")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="you@example.com"
          className="h-11 rounded-xl border-zinc-200 bg-zinc-50/50 px-4 dark:border-zinc-800 dark:bg-zinc-900/50"
          {...register("email")}
        />
        {errors.email ? <p className="text-xs text-red-500">{errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <PasswordInput {...register("password")} />
        {errors.password ? <p className="text-xs text-red-500">{errors.password.message}</p> : null}
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <input type="checkbox" {...register("rememberMe")} className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
        Keep me signed in
      </label>
      <Button
        type="submit"
        disabled={loading}
        className="h-11 w-full rounded-xl bg-zinc-900 text-sm font-semibold hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
      >
        {loading ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <a href="/login" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
          Sign in
        </a>
      </p>
    </form>
  );
}
