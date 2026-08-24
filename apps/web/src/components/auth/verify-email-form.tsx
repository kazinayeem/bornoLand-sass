"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useVerifyEmailMutation } from "@/redux/api/auth-api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function VerifyEmailForm({ token: propToken }: { token?: string } = {}) {
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
        setMessage(res.message || "Email verified successfully");
        toast.success(res.message || "Email verified successfully");
      })
      .catch((err: unknown) => {
        setStatus("error");
        const msg =
          err && typeof err === "object" && "data" in err && err.data && typeof err.data === "object" && "message" in err.data
            ? String((err.data as { message?: string }).message)
            : "Verification failed";
        setMessage(msg);
        toast.error(msg);
      });
  }, [token, verifyEmail]);

  return (
    <div className="space-y-5 text-center">
      {status === "loading" && <p className="text-sm text-apple-ink-muted-80 dark:text-apple-ink-muted-48">Verifying your email...</p>}
      {status === "success" && (
        <>
          <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
          <Button
            onClick={() => { router.push("/login"); }}
            className="h-11 w-full rounded-xl bg-zinc-900 text-sm font-semibold hover:bg-zinc-800 dark:bg-apple-canvas-parchment dark:text-apple-ink dark:hover:bg-white"
          >
            Sign in
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
          <p className="text-sm text-apple-ink-muted-80 dark:text-apple-ink-muted-48">
            <a href="/login" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
              Back to sign in
            </a>
          </p>
        </>
      )}
    </div>
  );
}
