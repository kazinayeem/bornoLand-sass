"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useResetPasswordMutation } from "@/redux/api/auth-api";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { FormLoadingShell } from "@/components/loading/form-loading-shell";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resetPassword] = useResetPasswordMutation();

  return (
    <FormLoadingShell
      className="space-y-5"
      loading={loading}
      loadingLabel="Resetting password"
      onSubmit={async (event) => {
        event.preventDefault();
        if (loading) return;
        setLoading(true);
        const response = await resetPassword({
          token,
          password: new FormData(event.currentTarget).get("password") as string,
        });
        setLoading(false);
        if ("error" in response) {
          const message =
            (response.error &&
            typeof response.error === "object" &&
            "data" in response.error &&
            response.error.data &&
            typeof response.error.data === "object" &&
            "message" in response.error.data
              ? String((response.error.data as { message?: string }).message)
              : "Could not reset password") || "Could not reset password";
          toast.error(message);
          return;
        }
        toast.success("Password updated. You can sign in now.");
        router.push("/login");
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="reset-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New password</Label>
        <PasswordInput id="reset-password" name="password" placeholder="Enter a new password" />
      </div>
      <Button
        type="submit"
        loading={loading}
        loadingKey="save"
        className="h-11 w-full rounded-full font-semibold shadow-md transition-all hover:shadow-lg"
      >
        Reset password
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        <a href="/login" className="font-semibold text-primary hover:underline">
          Back to sign in
        </a>
      </p>
    </FormLoadingShell>
  );
}
