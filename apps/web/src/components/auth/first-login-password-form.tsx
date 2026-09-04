"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { useChangePasswordMutation } from "@/redux/api/profile-api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const passwordRule = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,128}$/;

export function FirstLoginPasswordForm({
  currentPassword,
  onComplete,
}: {
  currentPassword: string;
  onComplete: () => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!passwordRule.test(newPassword)) {
      setError("Use at least 8 characters with uppercase, lowercase, a number, and a special character.");
      return;
    }
    if (currentPassword && newPassword === currentPassword) {
      setError("New password must be different from the temporary password.");
      return;
    }
    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if ("error" in result) {
        const message =
          result.error && "data" in result.error && result.error.data && typeof result.error.data === "object" && "message" in result.error.data
            ? String((result.error.data as { message?: string }).message)
            : "Could not update password.";
        setError(message);
        toast.error(message);
        return;
      }
      toast.success("Password updated. Continue to your workspace.");
      onComplete();
    } catch {
      setError("Could not update password. Please try again.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#181c20] dark:text-white">
          Create a new password
        </h1>
        <p className="text-xs sm:text-sm text-[#727785] dark:text-zinc-400">
          For security, replace your temporary password before accessing BornoLand.
        </p>
      </div>
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}
      <div className="space-y-1.5">
        <label htmlFor="first-login-new" className="block text-xs font-semibold text-[#181c20] dark:text-zinc-200">
          New password
        </label>
        <PasswordInput
          id="first-login-new"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          autoComplete="new-password"
          disabled={isLoading}
          required
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="first-login-confirm" className="block text-xs font-semibold text-[#181c20] dark:text-zinc-200">
          Confirm new password
        </label>
        <PasswordInput
          id="first-login-confirm"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          disabled={isLoading}
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1664d9] hover:bg-[#004caf] text-white text-sm font-bold shadow-xs disabled:opacity-60"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isLoading ? "Saving..." : "Save new password"}
      </button>
    </form>
  );
}
