"use client";

import { useStoreContext } from "@/providers/store-context";
import { NotificationCenter } from "@/components/workspace/notification-center";

export default function StoreNotificationsPage() {
  const { store } = useStoreContext();

  return (
    <NotificationCenter
      mode="store"
      storeId={store?._id}
      storeSlug={store?.slug}
      title={`${store?.shortName || store?.name || "Store"} Notifications`}
      description="Orders, inventory alerts, and system updates for this store."
    />
  );
}
