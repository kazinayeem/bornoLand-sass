"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { KeyRound, Mail, ArrowLeft } from "lucide-react";
import { useForgotPasswordMutation } from "@/redux/api/customer-api";
import {
  StorefrontButton,
  useStorefrontSurface,
} from "@/components/storefront/storefront-ui";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const { classes, primaryColor } = useStorefrontSurface();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await forgotPassword({ email: email.trim() }).unwrap();
      setSent(true);
    } catch (err: any) {
      if (err?.status === "FETCH_ERROR") {
        setError("Unable to reach the server. Please try again.");
      } else {
        // Still show success-style for enumeration safety when API returns soft success
        setSent(true);
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-apple-lg bg-apple-canvas-parchment">
            <KeyRound className="h-6 w-6 text-apple-ink-muted-80" />
          </div>
          <h1 className={cn("text-display-md", classes.heading)}>Forgot password</h1>
          <p className={cn("mt-1 text-caption", classes.muted)}>
            We&apos;ll email you reset instructions if an account exists.
          </p>
        </div>

        {sent ? (
          <div className={cn("p-5 text-center", classes.card)}>
            <p className={cn("text-body", classes.body)}>
              If an account exists for <strong>{email}</strong>, you&apos;ll receive instructions shortly.
            </p>
            <Link
              href="/account/login"
              className="mt-4 inline-flex items-center gap-1.5 text-caption font-medium"
              style={{ color: primaryColor }}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className={cn("mb-1.5 block text-caption-strong", classes.body)}>Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-apple-ink-muted-48" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={cn(classes.input, "pl-10")}
                />
              </div>
            </div>
            {error ? <p className="rounded-apple-md bg-red-50 px-3 py-2 text-caption text-red-600">{error}</p> : null}
            <StorefrontButton type="submit" disabled={isLoading} className="h-11 w-full">
              {isLoading ? "Sending…" : "Send reset link"}
            </StorefrontButton>
            <p className={cn("text-center text-caption", classes.muted)}>
              <Link href="/account/login" className="font-medium underline underline-offset-4" style={{ color: primaryColor }}>
                Back to login
              </Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
