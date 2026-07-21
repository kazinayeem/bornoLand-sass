"use client";

import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { peekRedirectAfterLogin } from "@/lib/auth-redirect-client";

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";

  return (
    <Button
      type="button"
      onClick={() => {
        const queryRedirect = new URLSearchParams(window.location.search).get("redirect");
        const destination = peekRedirectAfterLogin(queryRedirect, "/dashboard");
        window.location.href = `${baseUrl}/auth/google?redirectUrl=${encodeURIComponent(destination)}`;
      }}
      variant="outline"
      className="h-11 w-full gap-3 rounded-xl border-zinc-200 bg-white text-sm font-medium hover:bg-apple-canvas-parchment dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
    >
      <LogIn className="h-4 w-4" />
      {label}
    </Button>
  );
}
