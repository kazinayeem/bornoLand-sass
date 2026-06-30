import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Shield, Sparkles, Store, Zap } from "lucide-react";

type AuthShellProps = {
  children: ReactNode;
  variant?: "login" | "register" | "recovery";
};

const highlights = [
  { icon: Store, text: "Launch stores on your own subdomain" },
  { icon: Zap, text: "Visual builder with publish in one click" },
  { icon: Shield, text: "Secure workspace and role-based access" },
];

export function AuthShell({ children, variant = "login" }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.08),transparent_55%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur-sm transition hover:border-zinc-300 hover:bg-white hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-600/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Borno<span className="text-blue-600">Land</span>
            </span>
          </Link>
        </header>

        <div className="flex flex-1 items-center py-8 lg:py-12">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_420px] lg:gap-16 xl:grid-cols-[1fr_440px]">
            <aside className="hidden lg:block">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600">
                {variant === "register" ? "Get started" : variant === "recovery" ? "Account recovery" : "Welcome back"}
              </p>
              <h2 className="mt-4 max-w-md text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {variant === "register"
                  ? "Build and sell from one powerful workspace."
                  : variant === "recovery"
                    ? "We will help you get back into your account."
                    : "Sign in and manage your stores with confidence."}
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                BornoLand brings together storefronts, products, orders, CMS, and a visual builder — all under your workspace.
              </p>
              <ul className="mt-8 space-y-4">
                {highlights.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-800">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </aside>

            <div className="w-full justify-self-center lg:max-w-md lg:justify-self-end">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
