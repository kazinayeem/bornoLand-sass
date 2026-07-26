"use client";

import { Landmark, Sparkles } from "lucide-react";
import { EmptyState } from "../shared/EmptyState";
import { ReportPanel } from "../shared/ReportPanel";
import type { ModuleBaseProps } from "./module-types";

export function WalletModule(_props: ModuleBaseProps) {
  return (
    <div className="space-y-3">
      <ReportPanel title="Store wallet" description="Balances, top-ups, and payouts">
        <EmptyState
          icon={Landmark}
          title="Wallet reports coming soon"
          description="Store wallet ledgers, settlement cycles, and payout history will appear here on plans that include Bornoland Wallet. Upgrade or enable wallet when available for your store."
          className="py-14"
        />
      </ReportPanel>

      <div className="rounded-xl border border-apple-hairline bg-gradient-to-br from-apple-canvas-parchment to-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-apple-hairline bg-white">
            <Sparkles className="h-4 w-4 text-apple-ink-muted-80" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-apple-ink">Plan note</p>
            <p className="mt-1 text-[11px] leading-relaxed text-apple-ink-muted-48">
              Wallet analytics require the wallet feature flag on your subscription. Contact support
              or check Settings → Billing if you need early access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
