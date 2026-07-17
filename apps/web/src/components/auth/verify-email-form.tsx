"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useVerifyEmailMutation } from "@/redux/api/auth-api";
import { Button } from "@/components/ui/button";

export function VerifyEmailForm({ token }: { token: string }) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [verifyEmail] = useVerifyEmailMutation();

  useEffect(() => {
    verifyEmail({ token })
      .unwrap()
      .then((res) => {
        setStatus("success");
        setMessage(res.message ?? "Email verified successfully");
        toast.success("Email verified successfully");
      })
      .catch((err) => {
        setStatus("error");
        const msg =
          err?.data && typeof err.data === "object" && "message" in err.data
            ? String((err.data as { message?: string }).message)
            : "Verification failed";
        setMessage(msg);
        toast.error(msg);
      });
  }, [token, verifyEmail]);

  return (
    <div className="space-y-5 text-center">
      {status === "loading" && <p className="text-sm text-zinc-600 dark:text-zinc-400">Verifying your email...</p>}
      {status === "success" && (
        <>
          <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
          <Button
            onClick={() => { window.location.href = "/login"; }}
            className="h-11 w-full rounded-xl bg-zinc-900 text-sm font-semibold hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
          >
            Sign in
          </Button>
        </>
      )}
      {status === "error" && (
        <>
          <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <a href="/login" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
              Back to sign in
            </a>
          </p>
        </>
      )}
    </div>
  );
}
