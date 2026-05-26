"use client";

import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/utils/url";

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  return (
    <Button
      type="button"
      onClick={() => {
        window.location.href = getApiUrl("/auth/google?redirectUrl=/dashboard");
      }}
      variant="outline"
      className="w-full gap-3"
    >
      <LogIn className="h-4 w-4" />
      {label}
    </Button>
  );
}
