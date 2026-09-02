"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useCustomerForgotPasswordMutation } from "@/redux/api/customer-api";
import { useTenant } from "@/providers/tenant-provider";
import { CustomerAuthShell } from "@/components/storefront/auth/customer-auth-shell";
import { resolveStoreHref } from "@/lib/store-href";

export default function ForgotPasswordPage() {
  const { theme } = useTenant();
  const pathname = usePathname() || "";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [forgotPassword, { isLoading }] = useCustomerForgotPasswordMutation();
  const primaryColor = theme?.primaryColor || "#18181b";
  const loginHref = resolveStoreHref("/account/login", pathname);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await forgotPassword({ email: email.trim() }).unwrap();
      setSent(true);
    } catch (err: any) {
      if (err?.status === "FETCH_ERROR" || err?.code === "ERR_NETWORK") {
        setError("Unable to reach the server. Please check your internet connection.");
      } else {
        // Soft success for email enumeration defense
        setSent(true);
      }
    }
  };

  return (
    <CustomerAuthShell
      title="Reset your password"
      subtitle="Enter your account email to receive a password reset link"
      badgeText="Password Recovery"
    >
      {sent ? (
        <div className="space-y-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900">Check your inbox</h3>
            <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">
              If an account exists for <strong className="text-zinc-900">{email}</strong>, we have sent instructions to reset your password.
            </p>
          </div>
          <Link
            href={loginHref}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all hover:opacity-95"
            style={{ backgroundColor: primaryColor }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50/90 px-3.5 py-2.5 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          ) : null}

          <div>
            <label
              htmlFor="customer-forgot-email"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-700"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="customer-forgot-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all hover:border-zinc-300 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: primaryColor }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Sending link...</span>
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>

          <p className="mt-4 text-center text-xs text-zinc-500 sm:text-sm">
            Remembered your password?{" "}
            <Link
              href={loginHref}
              className="font-semibold underline underline-offset-4 transition-colors hover:text-zinc-700"
              style={{ color: primaryColor }}
            >
              Sign in
            </Link>
          </p>
        </form>
      )}
    </CustomerAuthShell>
  );
}
