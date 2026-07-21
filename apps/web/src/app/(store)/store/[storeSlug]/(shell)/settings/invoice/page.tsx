"use client";

import { StorePageCard } from "@/components/store-dashboard/store-page";
import { FileText } from "lucide-react";

export default function StoreInvoiceSettingsPage() {
  return (
    <StorePageCard>
      <div className="flex flex-col items-center py-16 text-center">
        <FileText className="mb-3 h-8 w-8 text-apple-ink-muted-48" />
        <h2 className="text-[15px] font-semibold text-apple-ink">Invoice</h2>
        <p className="mt-1 max-w-sm text-[13px] text-apple-ink-muted-48">
          Invoice templates and numbering options are coming soon. Order and invoice prefixes are under General.
        </p>
      </div>
    </StorePageCard>
  );
}
