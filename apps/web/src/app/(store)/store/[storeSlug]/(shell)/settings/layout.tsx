"use client";

import type { ReactNode } from "react";

export default function StoreSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-apple-ink">Store Settings</h1>
        <p className="mt-1 text-[13px] text-apple-ink-muted-48">
          Manage your store configuration — branding, commerce, content, and more.
        </p>
      </div>
      {children}
    </div>
  );
}
