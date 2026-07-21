"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useResetPasswordMutation } from "@/redux/api/auth-api";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [resetPassword] = useResetPasswordMutation();

  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        const response = await resetPassword({
          token,
          password: String(new FormData(event.currentTarget).get("password") ?? "")
        });
        setLoading(false);
        if ("error" in response) {
          const message =
            (response.error && "data" in response.error && response.error.data && typeof response.error.data === "object" && "message" in response.error.data
              ? String((response.error.data as { message?: string }).message)
              : "Could not reset password") || "Could not reset password";
          toast.error(message);
          return;
        }
        toast.success("Password updated. You can sign in now.");
        window.location.href = "/login";
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="reset-password">New password</Label>
        <PasswordInput id="reset-password" name="password" placeholder="Enter a new password" />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="h-11 w-full rounded-xl bg-zinc-900 text-sm font-semibold hover:bg-zinc-800 dark:bg-apple-canvas-parchment dark:text-apple-ink dark:hover:bg-white"
      >
        {loading ? "Resetting..." : "Reset password"}
      </Button>
      <p className="text-center text-sm text-apple-ink-muted-80 dark:text-apple-ink-muted-48">
        <a href="/login" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
          Back to sign in
        </a>
      </p>
    </form>
  );
}
