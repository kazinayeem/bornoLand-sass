"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useVerifyEmailMutation } from "@/redux/api/auth-api";
import { Loader2, CheckCircle2, AlertCircle, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function VerifyEmailForm({ token: propToken }: { token?: string } = {}) {
  const router = useRouter();
  const token =
    propToken ||
    (typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("token") || ""
      : "");

  const [verifyEmail] = useVerifyEmailMutation();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    token ? "loading" : "idle"
  );
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!token) return;
    setStatus("loading");
    verifyEmail({ token })
      .unwrap()
      .then((res) => {
        setStatus("success");
        const msg = res.message || "Your email address has been verified successfully.";
        setMessage(msg);
        toast.success(msg);
      })
      .catch((err: unknown) => {
        setStatus("error");
        const msg =
          err &&
          typeof err === "object" &&
          "data" in err &&
          err.data &&
          typeof err.data === "object" &&
          "message" in err.data
            ? String((err.data as { message?: string }).message)
            : "Verification link is invalid or has expired.";
        setMessage(msg);
        toast.error(msg);
      });
  }, [token, verifyEmail]);

  // Cooldown counter
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = () => {
    if (cooldown > 0) return;
    setCooldown(60);
    toast.info("A fresh verification email has been requested.");
  };

  return (
    <div className="w-full text-center space-y-6 py-2">
      {status === "loading" && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1664d9] border border-blue-200 flex items-center justify-center mx-auto shadow-2xs">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#181c20] dark:text-white">
              Verifying your email
            </h2>
            <p className="text-xs sm:text-sm text-[#727785] dark:text-zinc-400">
              Please wait a moment while we validate your token...
            </p>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006e2a] border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#181c20] dark:text-white">
              Email verified
            </h2>
            <p className="text-xs sm:text-sm text-[#424754] dark:text-zinc-400">
              {message || "Your email address is confirmed. Your account is now fully active."}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="flex h-11 w-full items-center justify-center rounded-xl bg-[#1664d9] text-white text-sm font-bold hover:bg-[#004caf] transition-all shadow-xs"
            >
              Continue to Sign in
            </Link>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-2xs">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#181c20] dark:text-white">
              Verification failed
            </h2>
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
              {message || "This verification link is invalid or has expired."}
            </p>
          </div>
          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#dfe3e8] bg-white text-xs font-bold text-[#181c20] hover:bg-zinc-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", cooldown > 0 && "animate-spin")} />
              <span>{cooldown > 0 ? `Resend available in ${cooldown}s` : "Request New Verification Email"}</span>
            </button>
            <Link
              href="/login"
              className="block text-xs font-semibold text-[#727785] hover:text-[#181c20] transition-colors"
            >
              ← Back to Sign in
            </Link>
          </div>
        </div>
      )}

      {status === "idle" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1664d9] border border-blue-200 flex items-center justify-center mx-auto shadow-2xs">
            <Mail className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#181c20] dark:text-white">
              Verify your email
            </h2>
            <p className="text-xs sm:text-sm text-[#424754] dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
              We sent a verification link to your email address. Please click the link in that email to confirm your account.
            </p>
          </div>
          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#dfe3e8] bg-white text-xs font-bold text-[#181c20] hover:bg-zinc-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", cooldown > 0 && "animate-spin")} />
              <span>{cooldown > 0 ? `Resend email in ${cooldown}s` : "Resend Verification Email"}</span>
            </button>
            <Link
              href="/login"
              className="block text-xs font-semibold text-[#727785] hover:text-[#181c20] transition-colors"
            >
              ← Back to Sign in
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
