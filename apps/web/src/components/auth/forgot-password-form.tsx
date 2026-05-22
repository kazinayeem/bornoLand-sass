"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useForgotPasswordMutation } from "@/redux/api/auth-api";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [forgotPassword] = useForgotPasswordMutation();

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        const response = await forgotPassword({
          email: String(new FormData(event.currentTarget).get("email") ?? "")
        });
        setLoading(false);
        if ("error" in response) {
          const message =
            ("data" in response.error && response.error.data && typeof response.error.data === "object" && "message" in response.error.data
              ? String((response.error.data as { message?: string }).message)
              : "Could not send reset link") || "Could not send reset link";
          toast.error(message);
          return;
        }
        toast.success("If the email exists, a reset link has been sent.");
      }}
    >
      <input type="email" name="email" placeholder="you@example.com" className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950" />
      <button type="submit" disabled={loading} className="w-full rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-950">
        {loading ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}
