"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCustomerRegisterMutation } from "@/redux/api/customer-api";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { setCustomer } from "@/redux/slices/customer-slice";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";
import { CustomerAuthLoader } from "@/components/auth/customer-auth-loader";
import { CustomerAuthShell } from "@/components/storefront/auth/customer-auth-shell";
import { CustomerSocialButtons } from "@/components/storefront/auth/customer-social-buttons";
import { validateInternalRedirect } from "@/lib/auth-redirect";
import { resolveStoreHref } from "@/lib/store-href";
import { useIsClient } from "@/hooks/use-is-client";

const registerFormSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerFormSchema>;

function RegisterForm() {
  const router = useRouter();
  const pathname = usePathname() || "";
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { restored, isAuthenticated } = useSelector((s: RootState) => s.customer);
  const { theme } = useTenant();
  const mounted = useIsClient();
  const redirectTo = validateInternalRedirect(searchParams.get("redirect")) ?? "/";
  const [registerCustomer, { isLoading }] = useCustomerRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const redirectedRef = useRef(false);
  const primaryColor = theme?.primaryColor || "#18181b";

  const {
    register: reg,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!mounted || !restored || !isAuthenticated || redirectedRef.current) return;
    redirectedRef.current = true;
    router.replace(resolveStoreHref(redirectTo, pathname));
  }, [mounted, restored, isAuthenticated, redirectTo, router, pathname]);

  const onSubmit = async (data: RegisterFormData) => {
    setApiError("");
    try {
      const result = await registerCustomer({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
      }).unwrap();
      if (result.success && result.data) {
        localStorage.setItem("customer_token", result.data.token);
        dispatch(setCustomer({ customer: result.data.customer, token: result.data.token }));
        window.dispatchEvent(new Event("auth-change"));
        redirectedRef.current = true;
        router.replace(resolveStoreHref(redirectTo, pathname));
      } else {
        setApiError(result.message ?? "Registration failed. Please try again.");
      }
    } catch (err: any) {
      if (err?.status === "FETCH_ERROR" || err?.code === "ERR_NETWORK") {
        setApiError("Unable to reach the server. Please check your internet connection.");
      } else {
        setApiError(err?.data?.message ?? "Registration failed");
      }
    }
  };

  if (!mounted || !restored || isAuthenticated) {
    return <CustomerAuthLoader message={isAuthenticated ? "Taking you back…" : "Checking your account…"} />;
  }

  const loginHref = resolveStoreHref(
    `/account/login${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`,
    pathname,
  );

  return (
    <CustomerAuthShell
      title="Create an account"
      subtitle="Join to track orders, save addresses, and earn rewards"
      badgeText="New Customer"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Global API Error Banner */}
        {apiError ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50/90 px-3.5 py-2.5 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{apiError}</span>
          </div>
        ) : null}

        {/* Full Name */}
        <div>
          <label
            htmlFor="customer-register-name"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-700"
          >
            Full Name
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              <User className="h-4 w-4" />
            </div>
            <input
              id="customer-register-name"
              type="text"
              autoComplete="name"
              {...reg("name")}
              placeholder="e.g. Asif Rahman"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all hover:border-zinc-300 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
            />
          </div>
          {errors.name ? (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          ) : null}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="customer-register-email"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-700"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="customer-register-email"
              type="email"
              autoComplete="email"
              {...reg("email")}
              placeholder="you@example.com"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all hover:border-zinc-300 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
            />
          </div>
          {errors.email ? (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          ) : null}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="customer-register-password"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-700"
          >
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="customer-register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...reg("password")}
              placeholder="At least 8 characters"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-10 pr-11 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all hover:border-zinc-300 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 transition-colors hover:text-zinc-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password ? (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          ) : null}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="customer-register-confirm-password"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-700"
          >
            Confirm Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="customer-register-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              {...reg("confirmPassword")}
              placeholder="Repeat your password"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-10 pr-11 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all hover:border-zinc-300 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 transition-colors hover:text-zinc-700"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword ? (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          ) : null}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="group mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: primaryColor }}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Social Buttons */}
      <CustomerSocialButtons disabled={true} />

      {/* Switch to Login */}
      <p className="mt-6 text-center text-xs text-zinc-500 sm:text-sm">
        Already have an account?{" "}
        <Link
          href={loginHref}
          className="font-semibold underline underline-offset-4 transition-colors hover:text-zinc-700"
          style={{ color: primaryColor }}
        >
          Sign in
        </Link>
      </p>
    </CustomerAuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<CustomerAuthLoader />}>
      <RegisterForm />
    </Suspense>
  );
}
