"use client";

import { StorePageCard } from "@/components/store-dashboard/store-page";
import { Bell } from "lucide-react";

export default function StoreNotificationsSettingsPage() {
  return (
    <StorePageCard>
      <div className="flex flex-col items-center py-16 text-center">
        <Bell className="mb-3 h-8 w-8 text-apple-ink-muted-48" />
        <h2 className="text-[15px] font-semibold text-apple-ink">Notifications</h2>
        <p className="mt-1 max-w-sm text-[13px] text-apple-ink-muted-48">
          Order and customer notification preferences are coming soon.
        </p>
      </div>
    </StorePageCard>
  );
}
