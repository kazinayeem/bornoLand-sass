"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { FirstLoginPasswordForm } from "@/components/auth/first-login-password-form";
import { PasswordInput } from "@/components/auth/password-input";
import { useMeQuery } from "@/redux/api/auth-api";
import { consumeRedirectAfterLogin, resolvePostLoginDestination } from "@/lib/auth-redirect-client";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { data, isLoading } = useMeQuery();
  const session = data?.data?.session;
  const user = data?.data?.user;
  const [currentPassword, setCurrentPassword] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      router.replace("/login?redirect=%2Fchange-password");
    }
  }, [isLoading, session, router]);

  if (isLoading || !session) {
    return (
      <AuthShell>
        <p className="text-sm text-zinc-500">Checking your session…</p>
      </AuthShell>
    );
  }

  const destination = resolvePostLoginDestination(
    {
      user: user ?? undefined,
      session,
      defaultStoreSlug: data?.data?.defaultStoreSlug || session.defaultStoreSlug,
      memberRole: session.memberRole || user?.memberRole,
      mustChangePassword: false,
    },
    null,
  );

  return (
    <AuthShell>
      {!ready ? (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold tracking-tight text-[#181c20] dark:text-white">
              Confirm your current password
            </h1>
            <p className="text-xs text-[#727785]">
              Enter your current password. For a new employee account this is the registered mobile number.
            </p>
          </div>
          <PasswordInput
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Current password"
          />
          <button
            type="button"
            disabled={currentPassword.length < 8}
            onClick={() => setReady(true)}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-[#1664d9] text-sm font-bold text-white disabled:opacity-60"
          >
            Continue
          </button>
        </div>
      ) : (
        <FirstLoginPasswordForm
          currentPassword={currentPassword}
          onComplete={() => {
            consumeRedirectAfterLogin(null, destination);
            window.location.replace(destination);
          }}
        />
      )}
    </AuthShell>
  );
}
