"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, AlertCircle, ArrowRight, Store, Lock, User } from "lucide-react";
import Link from "next/link";
import { useCurrentUser, useIsAuthenticated } from "@/features/session/hooks";
import { getApiUrl } from "@/lib/urls";

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
      } catch (err: any) {
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
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Invitation Invalid
        </h2>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{error}</p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
        >
          <span>Go to Login</span>
        </Link>
      </div>
    );
  }

  const storeName = invite?.storeId?.name || "BornoLand Store";

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Join {storeName}
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            You&apos;ve been invited to join as <strong className="font-semibold text-zinc-800 dark:text-zinc-200 capitalize">{invite?.role}</strong>.
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleAccept} className="mt-6 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={invite?.email || ""}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-100/60 px-3 py-2 text-xs text-zinc-600 outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400"
            />
          </div>

          {!isAuthenticated && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                  Your Full Name
                </label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-3 text-xs outline-none focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                  Create Password (min. 8 characters)
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-3 text-xs outline-none focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900"
                  />
                </div>
              </div>
            </>
          )}

          {isAuthenticated && (
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
              Logged in as <strong className="font-semibold text-zinc-900 dark:text-white">{currentUser?.email}</strong>. Accepting this invite will attach this store to your account.
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Accept Invitation & Join</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
