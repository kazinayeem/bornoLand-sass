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
      className="w-full gap-3"
    >
      <LogIn className="h-4 w-4" />
      {label}
    </Button>
  );
}
