"use client";

import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { cn } from "@/lib/utils";
import {
  useDeleteCustomerNotificationMutation,
  useGetCustomerNotificationsQuery,
  useMarkAllCustomerNotificationsReadMutation,
  useMarkCustomerNotificationReadMutation,
} from "@/redux/api/customer-api";
import { getCustomerNotificationStyle, formatNotificationTimeAgo } from "@/lib/customer-notifications";

export function CustomerNotificationBell({
  className = "",
  iconSize = 22,
}: {
  className?: string;
  iconSize?: number;
}) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isFetching } = useGetCustomerNotificationsQuery(
    { page: 1, limit: 10 },
    { pollingInterval: 15000, refetchOnFocus: true, refetchOnReconnect: true },
  );
  const [markRead] = useMarkCustomerNotificationReadMutation();
  const [markAll, { isLoading: markingAll }] = useMarkAllCustomerNotificationsReadMutation();
  const [remove] = useDeleteCustomerNotificationMutation();

  const notifications = data?.data?.notifications ?? [];
  const unreadCount = data?.data?.unreadCount ?? 0;

  return (
    <div className={cn("relative hidden sm:block", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center rounded-apple-sm text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80"
        style={{ width: 44, height: 44, minWidth: 44, minHeight: 44 }}
        aria-label={`${unreadCount} unread notifications`}
        aria-expanded={open}
      >
        <Bell style={{ width: iconSize, height: iconSize }} />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold leading-4 text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="absolute right-0 top-[calc(100%+10px)] z-[80] w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-apple-lg border border-apple-hairline bg-white shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-apple-hairline px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-apple-ink">Notifications</p>
                <p className="text-xs text-apple-ink-muted-48">
                  {unreadCount ? `${unreadCount} unread` : "You're all caught up"}
                  {isFetching && !isLoading ? " · Updating" : ""}
                </p>
              </div>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  disabled={markingAll}
                  onClick={async () => {
                    try {
                      await markAll().unwrap();
                      toast.success("All notifications marked as read");
                    } catch {
                      toast.error("Could not mark all as read");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              ) : null}
            </div>

            <div className="max-h-[430px] overflow-y-auto">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex animate-pulse gap-3 border-b border-apple-hairline p-4">
                    <div className="h-10 w-10 rounded-lg bg-apple-canvas-parchment" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/2 rounded bg-apple-canvas-parchment" />
                      <div className="h-3 w-4/5 rounded bg-apple-canvas-parchment" />
                    </div>
                  </div>
                ))
              ) : notifications.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-apple-canvas-parchment text-apple-ink-muted-48">
                    <Bell className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-apple-ink">No notifications yet</p>
                  <p className="mt-1 text-xs text-apple-ink-muted-48">Order updates and alerts will appear here.</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const style = getCustomerNotificationStyle(notification.type, notification.icon);
                  const Icon = style.icon;
                  return (
                    <div
                      key={notification._id}
                      className={cn(
                        "group relative flex gap-3 border-b border-apple-hairline p-3.5 transition hover:bg-apple-canvas-parchment",
                        !notification.read && "bg-apple-canvas-parchment/60",
                      )}
                    >
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", style.className)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <Link
                        href={notification.link || "/account/notifications"}
                        onClick={() => {
                          if (!notification.read) void markRead(notification._id);
                          setOpen(false);
                        }}
                        className="min-w-0 flex-1 pr-12"
                      >
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-apple-ink">{notification.title}</p>
                          {!notification.read ? <span className="h-2 w-2 rounded-full bg-black" /> : null}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-apple-ink-muted-80">{notification.message}</p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-apple-ink-muted-48">
                          <span className="capitalize">{style.label}</span>
                          <span>•</span>
                          <time title={new Date(notification.createdAt).toLocaleString()}>
                            {formatNotificationTimeAgo(notification.createdAt)}
                          </time>
                        </div>
                      </Link>
                      <div className="absolute right-2 top-3 flex opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                        {!notification.read ? (
                          <button
                            type="button"
                            onClick={() => void markRead(notification._id)}
                            className="rounded-sm p-1.5 text-apple-ink-muted-48 hover:bg-white hover:text-apple-ink"
                            title="Mark as read"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await remove(notification._id).unwrap();
                              toast.success("Notification deleted");
                            } catch {
                              toast.error("Could not delete notification");
                            }
                          }}
                          className="rounded-sm p-1.5 text-apple-ink-muted-48 hover:bg-red-50 hover:text-red-600"
                          title="Delete notification"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <Link
              href="/account/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center border-t border-apple-hairline px-4 py-3 text-sm font-medium text-apple-ink-muted-80 transition hover:bg-apple-canvas-parchment"
            >
              View all notifications
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
