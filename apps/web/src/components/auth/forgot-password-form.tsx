"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useForgotPasswordMutation } from "@/redux/api/auth-api";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormLoadingShell } from "@/components/loading";
import { useLanguage } from "@/providers/language-provider";

export function ForgotPasswordForm() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [loading, setLoading] = useState(false);
  const [forgotPassword] = useForgotPasswordMutation();

  return (
    <FormLoadingShell
      loading={loading}
      loadingLabel={isBn ? "রিসেট লিংক পাঠানো হচ্ছে..." : "Sending reset link..."}
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
              : isBn ? "রিসেট লিংক পাঠানো সম্ভব হয়নি" : "Could not send reset link") ||
            (isBn ? "রিসেট লিংক পাঠানো সম্ভব হয়নি" : "Could not send reset link");
          toast.error(message);
          return;
        }
        toast.success(
          isBn
            ? "ইমেইলটি সঠিক হলে একটি পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।"
            : "If the email exists, a reset link has been sent."
        );
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="forgot-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {isBn ? "ইমেইল ঠিকানা" : "Email Address"}
        </Label>
        <Input
          id="forgot-email"
          type="email"
          name="email"
          required
          placeholder={isBn ? "আপনার ইমেইল লিখুন" : "you@example.com"}
          className="h-11 rounded-xl border-border bg-card px-4 text-foreground transition-colors focus:border-primary"
        />
      </div>
      <Button
        type="submit"
        loading={loading}
        loadingKey="send"
        className="h-11 w-full rounded-xl font-semibold shadow-xs transition-all"
      >
        {isBn ? "রিসেট লিংক পাঠান" : "Send reset link"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        {isBn ? "পাসওয়ার্ড মনে পড়েছে? " : "Remember your password? "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          {isBn ? "সাইন ইন করুন" : "Back to sign in"}
        </Link>
      </p>
    </FormLoadingShell>
  );
}
