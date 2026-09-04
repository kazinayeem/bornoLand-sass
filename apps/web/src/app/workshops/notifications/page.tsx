"use client";

import { NotificationCenter } from "@/components/workspace/notification-center";

export default function WorkshopsNotificationsPage() {
  return (
    <NotificationCenter
      mode="workspace"
      title="Merchant Notifications"
      description="View your order alerts, payment events, subscriptions, and platform updates."
    />
  );
}
