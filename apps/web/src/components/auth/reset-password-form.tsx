"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useResetPasswordMutation } from "@/redux/api/auth-api";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { FormLoadingShell } from "@/components/loading/form-loading-shell";
import { useLanguage } from "@/providers/language-provider";

export function ResetPasswordForm({ token }: { token: string }) {
  const { language } = useLanguage();
  const isBn = false;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resetPassword] = useResetPasswordMutation();

  return (
    <FormLoadingShell
      className="space-y-5"
      loading={loading}
      loadingLabel={isBn ? "পাসওয়ার্ড পরিবর্তন করা হচ্ছে..." : "Resetting password..."}
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
              : isBn ? "পাসওয়ার্ড রিসেট করা সম্ভব হয়নি" : "Could not reset password") ||
            (isBn ? "পাসওয়ার্ড রিসেট করা সম্ভব হয়নি" : "Could not reset password");
          toast.error(message);
          return;
        }
        toast.success(
          isBn
            ? "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে। এখন লগইন করুন।"
            : "Password updated successfully. You can sign in now."
        );
        router.push("/login");
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="reset-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {isBn ? "নতুন পাসওয়ার্ড" : "New Password"}
        </Label>
        <PasswordInput
          id="reset-password"
          name="password"
          required
          placeholder={isBn ? "নতুন শক্তিশালী পাসওয়ার্ড দিন" : "Enter a strong new password"}
        />
      </div>
      <Button
        type="submit"
        loading={loading}
        loadingKey="save"
        className="h-11 w-full rounded-xl font-semibold shadow-xs transition-all"
      >
        {isBn ? "পাসওয়ার্ড সংরক্ষণ করুন" : "Reset Password"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        <Link href="/login" className="font-semibold text-primary hover:underline">
          {isBn ? "লগইনে ফিরে যান" : "Back to sign in"}
        </Link>
      </p>
    </FormLoadingShell>
  );
}
