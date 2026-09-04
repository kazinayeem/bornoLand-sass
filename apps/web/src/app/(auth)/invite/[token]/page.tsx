"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Store, Lock, User, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useCurrentUser, useIsAuthenticated } from "@/features/session/hooks";
import { getApiUrl } from "@/lib/urls";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { cn } from "@/lib/utils";

type InviteData = {
  email: string;
  name: string;
  role: string;
  storeId: {
    _id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };
  inviteExpiresAt: string;
};

export default function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const currentUser = useCurrentUser();
  const isAuthenticated = useIsAuthenticated();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const apiBase = getApiUrl();

  useEffect(() => {
    async function fetchInvite() {
      try {
        const res = await fetch(`${apiBase}/invite/${token}`);
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          setInvite(data.data);
          if (data.data.name) setName(data.data.name);
        } else {
          setError(data.message || "Invalid or expired invitation link.");
        }
      } catch {
        setError("Failed to connect to server. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchInvite();
  }, [token, apiBase]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invite) return;
    setError(null);
    setSubmitting(true);

    try {
      const payload: { password?: string; name?: string; userId?: string } = {};
      if (isAuthenticated && currentUser?.id) {
        payload.userId = currentUser.id;
      } else {
        if (!password || password.length < 8) {
          setError("Password must be at least 8 characters long.");
          setSubmitting(false);
          return;
        }
        payload.password = password;
        payload.name = name || invite.name || invite.email;
      }

      const res = await fetch(`${apiBase}/invite/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const storeSlug = invite.storeId?.slug || "";
        if (isAuthenticated) {
          router.push(`/store/${storeSlug}/dashboard`);
        } else {
          router.push(`/login?redirect=/store/${storeSlug}/dashboard&email=${encodeURIComponent(invite.email)}`);
        }
      } else {
        setError(data.message || "Failed to accept invitation.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AuthShell variant="verify">
        <div className="flex min-h-[160px] flex-col items-center justify-center space-y-3 py-6">
          <Loader2 className="h-6 w-6 animate-spin text-[#1664d9]" />
          <p className="text-xs text-[#727785]">Loading invitation details...</p>
        </div>
      </AuthShell>
    );
  }

  if (error && !invite) {
    return (
      <AuthShell variant="unauthorized">
        <div className="w-full text-center space-y-6 py-2">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-2xs">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#181c20] dark:text-white">
              Invitation Invalid
            </h2>
            <p className="text-xs sm:text-sm text-[#424754] dark:text-zinc-400">{error}</p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="flex h-11 w-full items-center justify-center rounded-xl bg-[#1664d9] text-white text-sm font-bold hover:bg-[#004caf] transition-all shadow-xs"
            >
              Go to Sign in
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  const storeName = invite?.storeId?.name || "BornoLand Store";

  return (
    <AuthShell variant="register">
      <div className="w-full space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1664d9] border border-blue-200 flex items-center justify-center mx-auto shadow-2xs">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#181c20] dark:text-white">
            Join {storeName}
          </h1>
          <p className="text-xs sm:text-sm text-[#727785] dark:text-zinc-400">
            You&apos;ve been invited as a{" "}
            <strong className="font-semibold text-[#181c20] dark:text-zinc-200 capitalize">
              {invite?.role}
            </strong>
            .
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleAccept} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#181c20] dark:text-zinc-200">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={invite?.email || ""}
              className="flex h-11 w-full rounded-xl border border-[#dfe3e8] bg-[#f8fafc] px-3.5 text-xs text-[#727785] cursor-not-allowed"
            />
          </div>

          {!isAuthenticated && (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#181c20] dark:text-zinc-200">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tamim Rahman"
                  className="flex h-11 w-full rounded-xl border border-[#dfe3e8] bg-white px-3.5 text-sm text-[#181c20] placeholder:text-[#727785] focus:border-[#1664d9] focus:outline-none focus:ring-2 focus:ring-[#1664d9]/15"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#181c20] dark:text-zinc-200">
                  Create Password (min. 8 characters)
                </label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </>
          )}

          {isAuthenticated && (
            <div className="rounded-xl border border-[#dfe3e8] bg-[#f8fafc] p-3 text-xs text-[#424754]">
              Signed in as <strong className="font-semibold text-[#181c20]">{currentUser?.email}</strong>.
              Accepting will link this store to your account.
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1664d9] hover:bg-[#004caf] text-white text-sm font-bold shadow-xs transition-all disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Accepting invite...</span>
              </>
            ) : (
              <span>Accept &amp; Join Store</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#f1f4fa] dark:border-zinc-800/70">
          <Link
            href="/login"
            className="text-xs font-semibold text-[#727785] hover:text-[#181c20] transition-colors"
          >
            ← Back to Sign in
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
