"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useResetPasswordMutation } from "@/redux/api/auth-api";

export function ResetPasswordForm({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [resetPassword] = useResetPasswordMutation();

  return (
    <form
      className="space-y-4"
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
      <input type="password" name="password" placeholder="New password" className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950" />
      <button type="submit" disabled={loading} className="w-full rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-950">
        {loading ? "Resetting..." : "Reset password"}
      </button>
    </form>
  );
}
