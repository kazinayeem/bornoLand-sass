"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useForgotPasswordMutation } from "@/redux/api/auth-api";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [forgotPassword] = useForgotPasswordMutation();

  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        const response = await forgotPassword({
          email: String(new FormData(event.currentTarget).get("email") ?? "")
        });
        setLoading(false);
        if ("error" in response) {
          const message =
            (response.error && "data" in response.error && response.error.data && typeof response.error.data === "object" && "message" in response.error.data
              ? String((response.error.data as { message?: string }).message)
              : "Could not send reset link") || "Could not send reset link";
          toast.error(message);
          return;
        }
        toast.success("If the email exists, a reset link has been sent.");
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="forgot-email">Email</Label>
        <Input
          id="forgot-email"
          type="email"
          name="email"
          placeholder="you@example.com"
          className="h-11 rounded-xl border-zinc-200 bg-zinc-50/50 px-4 dark:border-zinc-800 dark:bg-zinc-900/50"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="h-11 w-full rounded-xl bg-zinc-900 text-sm font-semibold hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
      >
        {loading ? "Sending..." : "Send reset link"}
      </Button>
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Remember your password?{" "}
        <a href="/login" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
          Back to sign in
        </a>
      </p>
    </form>
  );
}
