"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

type LoginFormProps = {
  googleButton?: boolean;
};

const SEED_EMAILS = {
  user: process.env.NEXT_PUBLIC_ROOT_DOMAIN === "bornosoftnr.site" ? "admin@bornosoftnr.site" : "admin@bornoland.com",
  demo: process.env.NEXT_PUBLIC_ROOT_DOMAIN === "bornosoftnr.site" ? "demo@bornosoftnr.site" : "demo@bornoland.com",
};

export function LoginForm({ googleButton = false }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("redirect") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Email and password required");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (json.success) {
        router.push(callbackUrl);
      } else {
        toast.error(json.message ?? "Login failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com" required
          className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
        <div className="relative">
          <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" required
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white pr-10 pl-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Sign In
      </button>

      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button"
          onClick={() => { setEmail(SEED_EMAILS.user); setPassword("Admin@123"); }}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
          Quick admin login
        </button>
        <button type="button"
          onClick={() => { setEmail(SEED_EMAILS.demo); setPassword("Demo@123"); }}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
          Quick demo login
        </button>
      </div>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        New here? <a href="/register" className="font-medium text-zinc-950 dark:text-zinc-50">Create an account</a>
      </p>
    </form>
  );
}
