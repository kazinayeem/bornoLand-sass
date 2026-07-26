"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useForgotPasswordMutation } from "@/redux/api/auth-api";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormLoadingShell } from "@/components/loading";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [forgotPassword] = useForgotPasswordMutation();

  return (
    <FormLoadingShell
      loading={loading}
      loadingLabel="Sending reset link"
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        if (loading) return;
        setLoading(true);
        const response = await forgotPassword({
          email: String(new FormData(event.currentTarget).get("email") ?? ""),
        });
        setLoading(false);
        if ("error" in response) {
          const message =
            (response.error &&
            "data" in response.error &&
            response.error.data &&
            typeof response.error.data === "object" &&
            "message" in response.error.data
              ? String((response.error.data as { message?: string }).message)
              : "Could not send reset link") || "Could not send reset link";
          toast.error(message);
          return;
        }
        toast.success("If the email exists, a reset link has been sent.");
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="forgot-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
        <Input
          id="forgot-email"
          type="email"
          name="email"
          placeholder="you@example.com"
          className="h-11 rounded-lg border-border bg-card px-4 text-foreground transition-colors focus:border-primary"
        />
      </div>
      <Button type="submit" loading={loading} loadingKey="send" className="h-11 w-full rounded-full font-semibold shadow-md transition-all hover:shadow-lg">
        Send reset link
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Remember your password?{" "}
        <a href="/login" className="font-semibold text-primary hover:underline">
          Back to sign in
        </a>
      </p>
    </FormLoadingShell>
  );
}
