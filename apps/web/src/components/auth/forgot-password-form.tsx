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
          className="h-11 rounded-sm border-apple-hairline bg-apple-canvas-parchment/50 px-4 dark:border-apple-hairline dark:bg-apple-surface-tile-1/50"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="h-11 w-full rounded-pill bg-apple-primary text-sm font-semibold text-apple-on-primary hover:bg-apple-primary-focus"
      >
        {loading ? "Sending..." : "Send reset link"}
      </Button>
      <p className="text-center text-sm text-apple-ink-muted-80 dark:text-apple-ink-muted-48">
        Remember your password?{" "}
        <a href="/login" className="font-semibold text-apple-primary hover:text-apple-primary-focus">
          Back to sign in
        </a>
      </p>
    </form>
  );
}
