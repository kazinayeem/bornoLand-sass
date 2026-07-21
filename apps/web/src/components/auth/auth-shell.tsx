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
    <div className="relative min-h-screen overflow-hidden bg-apple-canvas-parchment dark:bg-apple-surface-black">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="btn-press inline-flex items-center gap-2 rounded-pill border border-apple-hairline bg-apple-canvas px-4 py-2 text-caption text-apple-ink-muted-80 transition hover:border-apple-primary hover:text-apple-primary dark:border-apple-surface-tile-3 dark:bg-apple-surface-tile-2 dark:text-apple-body-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-apple-primary">
              <Sparkles className="h-4 w-4 text-apple-on-primary" />
            </div>
            <span className="text-caption-strong text-apple-ink dark:text-apple-body-on-dark">
              Borno<span className="text-apple-primary">Land</span>
            </span>
          </Link>
        </header>

        <div className="flex flex-1 items-center py-8 lg:py-12">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_420px] lg:gap-16 xl:grid-cols-[1fr_440px]">
            <aside className="hidden lg:block">
              <p className="text-caption-strong uppercase tracking-[0.35em] text-apple-primary">
                {variant === "register"
                  ? "Get started"
                  : variant === "recovery"
                    ? "Account recovery"
                    : "Welcome back"}
              </p>
              <h2 className="text-display-lg mt-4 max-w-md text-apple-ink dark:text-apple-body-on-dark">
                {variant === "register"
                  ? "Build and sell from one powerful workspace."
                  : variant === "recovery"
                    ? "We will help you get back into your account."
                    : "Sign in and manage your stores with confidence."}
              </h2>
              <p className="mt-4 max-w-md text-body text-apple-ink-muted-80 dark:text-apple-body-muted">
                BornoLand brings together storefronts, products, orders, CMS, and a visual
                builder — all under your workspace.
              </p>
              <ul className="mt-8 space-y-4">
                {highlights.map(({ icon: Icon, text }) => (
                  <li
                    key={text}
                    className="flex items-center gap-3 text-caption text-apple-ink-muted-80 dark:text-apple-body-muted"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-apple-hairline bg-apple-canvas dark:border-apple-surface-tile-3 dark:bg-apple-surface-tile-2">
                      <Icon className="h-4 w-4 text-apple-primary" />
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
