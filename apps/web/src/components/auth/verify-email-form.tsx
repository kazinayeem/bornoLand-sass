"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useVerifyEmailMutation } from "@/redux/api/auth-api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/providers/language-provider";

export function VerifyEmailForm({ token: propToken }: { token?: string } = {}) {
  const { language } = useLanguage();
  const isBn = false;
  const router = useRouter();
  const token = propToken || (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") || "" : "");

  const [verifyEmail] = useVerifyEmailMutation();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    setStatus("loading");
    verifyEmail({ token })
      .unwrap()
      .then((res) => {
        setStatus("success");
        const msg = res.message || (isBn ? "ইমেইল সফলভাবে ভেরিফাই হয়েছে।" : "Email verified successfully.");
        setMessage(msg);
        toast.success(msg);
      })
      .catch((err: unknown) => {
        setStatus("error");
        const msg =
          err && typeof err === "object" && "data" in err && err.data && typeof err.data === "object" && "message" in err.data
            ? String((err.data as { message?: string }).message)
            : isBn ? "ইমেইল ভেরিফিকেশন ব্যর্থ হয়েছে" : "Verification failed";
        setMessage(msg);
        toast.error(msg);
      });
  }, [token, verifyEmail, isBn]);

  return (
    <div className="space-y-5 text-center">
      {status === "loading" && (
        <p className="text-sm text-zinc-500">
          {isBn ? "আপনার ইমেইল যাচাই করা হচ্ছে..." : "Verifying your email..."}
        </p>
      )}
      {status === "success" && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-[#0A8A00]">{message}</p>
          <Button
            onClick={() => { router.push("/login"); }}
            className="h-11 w-full rounded-xl bg-[#003399] hover:bg-[#002B80] text-white text-sm font-bold shadow-xs"
          >
            {isBn ? "সাইন ইন করুন" : "Sign In"}
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-red-600">{message}</p>
          <p className="text-sm text-zinc-500">
            <Link href="/login" className="font-semibold text-primary hover:underline">
              {isBn ? "লগইনে ফিরে যান" : "Back to sign in"}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
