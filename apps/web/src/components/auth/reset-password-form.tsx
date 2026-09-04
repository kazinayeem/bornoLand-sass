"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useResetPasswordMutation } from "@/redux/api/auth-api";
import { PasswordInput } from "@/components/auth/password-input";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetPassword] = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!token) {
      setErrorMessage("Invalid or missing password reset token.");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword({
        token,
        password,
      });

      setLoading(false);

      if ("error" in response) {
        const errObj = response.error as { data?: { message?: string } };
        const msg = errObj?.data?.message || "Unable to reset password. The reset link may have expired.";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      setIsSuccess(true);
      toast.success("Password reset successfully. You can now sign in.");
    } catch {
      setLoading(false);
      const netMsg = "Network error while updating password. Please try again.";
      setErrorMessage(netMsg);
      toast.error(netMsg);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full text-center space-y-6 py-2 animate-in fade-in-50 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006e2a] border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#181c20] dark:text-white">
            Password reset complete
          </h2>
          <p className="text-xs sm:text-sm text-[#424754] dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Your password has been updated. You can now sign in with your new credentials.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="flex h-11 w-full items-center justify-center rounded-xl bg-[#1664d9] text-white text-sm font-bold hover:bg-[#004caf] transition-all shadow-xs"
          >
            Continue to Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#181c20] dark:text-white">
          Create new password
        </h1>
        <p className="text-xs sm:text-sm text-[#727785] dark:text-zinc-400">
          Choose a secure new password for your BornoLand account.
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
        {/* New Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="new-password"
            className="block text-xs font-semibold text-[#181c20] dark:text-zinc-200"
          >
            New Password
          </label>
          <PasswordInput
            id="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
            disabled={loading}
          />
          <p className="text-[11px] text-[#727785]">
            Must be at least 8 characters long.
          </p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirm-new-password"
            className="block text-xs font-semibold text-[#181c20] dark:text-zinc-200"
          >
            Confirm New Password
          </label>
          <PasswordInput
            id="confirm-new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            autoComplete="new-password"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !password || !confirmPassword}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1664d9] hover:bg-[#004caf] active:bg-[#003e91] text-white text-sm font-bold shadow-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Resetting password...</span>
            </>
          ) : (
            <span>Reset password</span>
          )}
        </button>
      </form>

      {/* Back to sign in */}
      <div className="text-center pt-2 border-t border-[#f1f4fa] dark:border-zinc-800/70">
        <Link
          href="/login"
          className="text-xs font-semibold text-[#727785] hover:text-[#181c20] dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
        >
          ← Back to Sign in
        </Link>
      </div>
    </div>
  );
}
