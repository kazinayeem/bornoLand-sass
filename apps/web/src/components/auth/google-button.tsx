"use client";

import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";

  return (
    <Button
      type="button"
      onClick={() => {
        window.location.href = `${baseUrl}/auth/google?redirectUrl=/dashboard`;
      }}
      variant="outline"
      className="h-11 w-full gap-3 rounded-xl border-zinc-200 bg-white text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
    >
      <LogIn className="h-4 w-4" />
      {label}
    </Button>
  );
}
