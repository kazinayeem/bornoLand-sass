"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export default function SettingsContactLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const storeSlug = typeof params.storeSlug === "string" ? params.storeSlug : "";

  return (
    <div className="space-y-6">
      <Link
        href={storeSlug ? `/store/${storeSlug}/settings?section=cms-pages` : "#"}
        className="inline-flex items-center gap-2 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:text-apple-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Settings
      </Link>
      {children}
    </div>
  );
}
