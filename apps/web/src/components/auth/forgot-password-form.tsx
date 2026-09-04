"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useForgotPasswordMutation } from "@/redux/api/auth-api";
import { Loader2, Mail, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotPassword] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setErrorMessage(null);
    setLoading(true);

    try {
      const response = await forgotPassword({ email: email.trim() });
      setLoading(false);

      if ("error" in response) {
        const errObj = response.error as { data?: { message?: string } };
        const msg = errObj?.data?.message || "Unable to process password reset request. Please try again.";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      setSubmittedEmail(email.trim());
      toast.success("Check your email for a password reset link.");
    } catch {
      setLoading(false);
      const netMsg = "Network error while sending reset link. Please try again.";
      setErrorMessage(netMsg);
      toast.error(netMsg);
    }
  };

  if (submittedEmail) {
    return (
      <div className="w-full text-center space-y-6 py-2 animate-in fade-in-50 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006e2a] border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
          <Mail className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#181c20] dark:text-white">
            Check your email
          </h2>
          <p className="text-xs sm:text-sm text-[#424754] dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            If an account exists for <span className="font-bold text-[#181c20] dark:text-white">{submittedEmail}</span>,
            we have sent instructions to reset your password.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <Link
            href="/login"
            className="flex h-11 w-full items-center justify-center rounded-xl bg-[#1664d9] text-white text-sm font-bold hover:bg-[#004caf] transition-all shadow-xs"
          >
            Back to Sign in
          </Link>
          <button
            type="button"
            onClick={() => {
              setSubmittedEmail(null);
              setEmail("");
            }}
            className="text-xs font-semibold text-[#727785] hover:text-[#181c20] transition-colors cursor-pointer"
          >
            Try another email address
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#181c20] dark:text-white">
          Reset your password
        </h1>
        <p className="text-xs sm:text-sm text-[#727785] dark:text-zinc-400">
          Enter your email and we will send you a password reset link.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 animate-in fade-in-50 duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label
            htmlFor="forgot-email"
            className="block text-xs font-semibold text-[#181c20] dark:text-zinc-200"
          >
            Email Address
          </label>
          <input
            id="forgot-email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            autoComplete="email"
            required
            disabled={loading}
            className="flex h-11 w-full rounded-xl border border-[#dfe3e8] dark:border-zinc-800 bg-white dark:bg-zinc-900/90 px-3.5 text-sm text-[#181c20] dark:text-zinc-100 placeholder:text-[#727785] transition-all focus:border-[#1664d9] focus:outline-none focus:ring-2 focus:ring-[#1664d9]/15 disabled:cursor-not-allowed disabled:bg-zinc-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1664d9] hover:bg-[#004caf] active:bg-[#003e91] text-white text-sm font-bold shadow-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending reset link...</span>
            </>
          ) : (
            <span>Send reset link</span>
          )}
        </button>
      </form>

      {/* Back to sign in */}
      <div className="text-center pt-2 border-t border-[#f1f4fa] dark:border-zinc-800/70">
        <p className="text-xs text-[#727785] dark:text-zinc-400">
          Remember your password?{" "}
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
