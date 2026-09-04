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
import {
  Check,
  ChevronRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Building2,
  Store,
  UserCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRegisterMutation } from "@/redux/api/auth-api";

const STEPS = [
  { id: 1, label: "Account" },
  { id: 2, label: "Business" },
  { id: 3, label: "Store" },
  { id: 4, label: "Finish" },
];

const BUSINESS_CATEGORIES = [
  "Retail & Storefront",
  "Wholesale & Distribution",
  "Fashion & Apparel",
  "Electronics & Gadgets",
  "Grocery & Supermarket",
  "Cosmetics & Personal Care",
  "Furniture & Home Decor",
  "General Multi-Category Business",
];

export function RegisterForm({ className }: { className?: string }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registerRequest] = useRegisterMutation();

  const [businessCategory, setBusinessCategory] = useState("Retail & Storefront");
  const [storeName, setStoreName] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) as any,
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      tenantName: "",
      rememberMe: true,
    },
  });

  const formValues = watch();

  // Handle step transitions with focused validation
  const handleNextFromAccount = async (e: React.MouseEvent) => {
    e.preventDefault();
    setRegisterError(null);
    const valid = await trigger(["name", "email", "password", "confirmPassword"]);
    if (valid) {
      // Auto-suggest workspace and store name if empty
      if (!formValues.tenantName && formValues.name) {
        // e.g. "Tamim's Workspace"
      }
      setCurrentStep(2);
    }
  };

  const handleNextFromBusiness = (e: React.MouseEvent) => {
    e.preventDefault();
    const suggestedStore = storeName || formValues.tenantName || (formValues.name ? `${formValues.name.split(" ")[0]}'s Shop` : "My Store");
    if (!storeName) setStoreName(suggestedStore);
    setCurrentStep(3);
  };

  const handleNextFromStore = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentStep(4);
  };

  const onSubmit = handleSubmit(async (values) => {
    if (loading) return;
    setRegisterError(null);
    setLoading(true);

    const effectiveTenant = values.tenantName?.trim() || `${values.name.split(" ")[0]}'s Enterprise`;

    try {
      const response = await registerRequest({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        tenantName: effectiveTenant,
        rememberMe: true,
      });

      if ("error" in response) {
        setLoading(false);
        const errObj = response.error as {
          data?: { message?: string; error?: string };
        };
        const msg = errObj?.data?.message || "Registration could not be completed. Please try again.";
        setRegisterError(msg);
        toast.error(msg);
        return;
      }

      setLoading(false);
      setIsSuccess(true);
      toast.success("Account created successfully! Check your email for verification.");
    } catch {
      setLoading(false);
      const networkErr = "Network error while creating account. Please try again.";
      setRegisterError(networkErr);
      toast.error(networkErr);
    }
  });

  // Calculate clean subdomain preview handle
  const subdomainHandle = (storeName || formValues.tenantName || "store")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20) || "mystore";

  if (isSuccess) {
    return (
      <div className="w-full text-center space-y-6 py-4 animate-in fade-in-50 duration-300">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006e2a] border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
          <Check className="h-6 w-6 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-[#181c20] dark:text-white">
            Welcome to BornoLand!
          </h2>
          <p className="text-xs sm:text-sm text-[#424754] dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Your workspace has been provisioned. We sent an email verification link to{" "}
            <span className="font-bold text-[#181c20] dark:text-white">{formValues.email}</span>.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <Link
            href="/login"
            className="flex h-11 w-full items-center justify-center rounded-xl bg-[#1664d9] text-white text-sm font-bold hover:bg-[#004caf] transition-all shadow-xs"
          >
            Continue to Sign in
          </Link>
          <p className="text-xs text-[#727785]">
            Didn&apos;t get the email? You can resend verification from the sign-in screen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#181c20] dark:text-white">
          Create your account
        </h1>
        <p className="text-xs sm:text-sm text-[#727785] dark:text-zinc-400">
          Start running your business with BornoLand.
        </p>
      </div>

      {/* Subtle Progress Indicator */}
      <div className="w-full bg-[#f1f4fa] dark:bg-zinc-800/60 p-1 rounded-xl flex items-center justify-between border border-[#dfe3e8]/70">
        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                // Only allow jumping back to completed steps
                if (isCompleted) setCurrentStep(step.id);
              }}
              className={cn(
                "flex-1 py-1.5 px-2 text-center rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5",
                isActive
                  ? "bg-white dark:bg-zinc-900 text-[#1664d9] dark:text-[#60a5fa] shadow-2xs"
                  : isCompleted
                  ? "text-[#181c20] dark:text-zinc-300 hover:text-[#1664d9] cursor-pointer"
                  : "text-[#727785] dark:text-zinc-500 cursor-default"
              )}
            >
              {isCompleted ? (
                <Check className="h-3 w-3 text-[#006e2a]" />
              ) : (
                <span className="text-[10px] opacity-75">{step.id}.</span>
              )}
              <span className="truncate">{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error Banner */}
      {registerError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 animate-in fade-in-50 duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{registerError}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {/* STEP 1: ACCOUNT DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-name"
                className="block text-xs font-semibold text-[#181c20] dark:text-zinc-200"
              >
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                placeholder="e.g. Tamim Rahman"
                autoComplete="name"
                disabled={loading}
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
                className={cn(
                  "flex h-11 w-full rounded-xl border border-[#dfe3e8] dark:border-zinc-800 bg-white dark:bg-zinc-900/90 px-3.5 text-sm text-[#181c20] dark:text-zinc-100 placeholder:text-[#727785] transition-all focus:border-[#1664d9] focus:outline-none focus:ring-2 focus:ring-[#1664d9]/15",
                  errors.name && "border-red-500 focus:border-red-500"
                )}
              />
              {errors.name?.message && (
                <p className="text-[11px] font-medium text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-email"
                className="block text-xs font-semibold text-[#181c20] dark:text-zinc-200"
              >
                Work Email
              </label>
              <input
                id="register-email"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                disabled={loading}
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
                className={cn(
                  "flex h-11 w-full rounded-xl border border-[#dfe3e8] dark:border-zinc-800 bg-white dark:bg-zinc-900/90 px-3.5 text-sm text-[#181c20] dark:text-zinc-100 placeholder:text-[#727785] transition-all focus:border-[#1664d9] focus:outline-none focus:ring-2 focus:ring-[#1664d9]/15",
                  errors.email && "border-red-500 focus:border-red-500"
                )}
              />
              {errors.email?.message && (
                <p className="text-[11px] font-medium text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-password"
                className="block text-xs font-semibold text-[#181c20] dark:text-zinc-200"
              >
                Password
              </label>
              <PasswordInput
                id="register-password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                disabled={loading}
                error={Boolean(errors.password)}
                {...register("password")}
              />
              {errors.password?.message && (
                <p className="text-[11px] font-medium text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-confirm-password"
                className="block text-xs font-semibold text-[#181c20] dark:text-zinc-200"
              >
                Confirm Password
              </label>
              <PasswordInput
                id="register-confirm-password"
                placeholder="Re-enter password"
                autoComplete="new-password"
                disabled={loading}
                error={Boolean(errors.confirmPassword)}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword?.message && (
                <p className="text-[11px] font-medium text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNextFromAccount}
              className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-[#1664d9] hover:bg-[#004caf] text-white text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              <span>Continue to Business</span>
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Google Signup Divider */}
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

            <GoogleButton label="Sign up with Google" />
          </div>
        )}

        {/* STEP 2: BUSINESS DETAILS */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            {/* Workspace / Business Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-tenant"
                className="block text-xs font-semibold text-[#181c20] dark:text-zinc-200"
              >
                Workspace / Organization Name
              </label>
              <div className="relative">
                <input
                  id="register-tenant"
                  type="text"
                  placeholder="e.g. Apex Retail Group"
                  autoComplete="organization"
                  disabled={loading}
                  {...register("tenantName")}
                  className="flex h-11 w-full rounded-xl border border-[#dfe3e8] dark:border-zinc-800 bg-white dark:bg-zinc-900/90 px-3.5 text-sm text-[#181c20] dark:text-zinc-100 placeholder:text-[#727785] transition-all focus:border-[#1664d9] focus:outline-none focus:ring-2 focus:ring-[#1664d9]/15"
                />
              </div>
              <p className="text-[11px] text-[#727785]">
                Your central workspace houses stores, warehouse hubs, and financial ledgers.
              </p>
            </div>

            {/* Business Category */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-category"
                className="block text-xs font-semibold text-[#181c20] dark:text-zinc-200"
              >
                Primary Industry / Sector
              </label>
              <select
                id="register-category"
                value={businessCategory}
                onChange={(e) => setBusinessCategory(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-[#dfe3e8] dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 text-sm text-[#181c20] dark:text-zinc-100 transition-all focus:border-[#1664d9] focus:outline-none focus:ring-2 focus:ring-[#1664d9]/15 cursor-pointer"
              >
                {BUSINESS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex h-11 px-4 items-center justify-center gap-1.5 rounded-xl border border-[#dfe3e8] text-[#181c20] text-xs font-bold hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNextFromBusiness}
                className="flex-1 flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#1664d9] hover:bg-[#004caf] text-white text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                <span>Continue to Store</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: STORE DETAILS */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            {/* Store Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-store"
                className="block text-xs font-semibold text-[#181c20] dark:text-zinc-200"
              >
                Primary Storefront Name
              </label>
              <input
                id="register-store"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Apex Flagship Outlet"
                className="flex h-11 w-full rounded-xl border border-[#dfe3e8] dark:border-zinc-800 bg-white dark:bg-zinc-900/90 px-3.5 text-sm text-[#181c20] dark:text-zinc-100 placeholder:text-[#727785] transition-all focus:border-[#1664d9] focus:outline-none focus:ring-2 focus:ring-[#1664d9]/15"
              />
            </div>

            {/* Storefront URL Subdomain Handle Preview */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#181c20] dark:text-zinc-200">
                Storefront Web Address Preview
              </label>
              <div className="flex h-11 w-full items-center rounded-xl border border-[#dfe3e8] bg-[#f8fafc] dark:bg-zinc-800/60 px-3.5 text-xs text-[#181c20] dark:text-zinc-200">
                <span className="font-bold text-[#1664d9]">{subdomainHandle}</span>
                <span className="text-[#727785]">.bornoland.com</span>
              </div>
              <p className="text-[11px] text-[#727785]">
                You can connect your own custom domain (.com, .com.bd) at any time.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex h-11 px-4 items-center justify-center gap-1.5 rounded-xl border border-[#dfe3e8] text-[#181c20] text-xs font-bold hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNextFromStore}
                className="flex-1 flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#1664d9] hover:bg-[#004caf] text-white text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                <span>Review &amp; Finish</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: FINISH & CONFIRMATION */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            {/* Summary Review Card */}
            <div className="rounded-xl border border-[#dfe3e8] bg-[#f8fafc] dark:bg-zinc-800/50 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#dfe3e8]/70">
                <span className="text-[#727785]">Account Owner</span>
                <span className="font-semibold text-[#181c20]">{formValues.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#dfe3e8]/70">
                <span className="text-[#727785]">Email</span>
                <span className="font-semibold text-[#181c20]">{formValues.email}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#dfe3e8]/70">
                <span className="text-[#727785]">Workspace</span>
                <span className="font-semibold text-[#181c20]">
                  {formValues.tenantName || `${formValues.name}'s Enterprise`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#727785]">Initial Store</span>
                <span className="font-semibold text-[#1664d9]">{subdomainHandle}.bornoland.com</span>
              </div>
            </div>

            {/* Terms of Service & Privacy Statement */}
            <p className="text-xs text-[#727785] leading-relaxed">
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                target="_blank"
                className="font-semibold text-[#1664d9] hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                target="_blank"
                className="font-semibold text-[#1664d9] hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                disabled={loading}
                className="flex h-11 px-4 items-center justify-center gap-1.5 rounded-xl border border-[#dfe3e8] text-[#181c20] text-xs font-bold hover:bg-zinc-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1664d9] hover:bg-[#004caf] active:bg-[#003e91] text-white text-sm font-bold shadow-xs transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating workspace...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-[#FFDA1A]" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Account Navigation */}
      <div className="text-center pt-2 border-t border-[#f1f4fa] dark:border-zinc-800/70">
        <p className="text-xs text-[#727785] dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-[#1664d9] hover:text-[#004caf] dark:text-[#60a5fa] transition-colors underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
