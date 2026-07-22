"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Check, CheckCheck, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { CustomerAccountShell } from "@/components/storefront/customer-account-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import { getCustomerNotificationStyle, formatNotificationTimeAgo } from "@/lib/customer-notifications";

import {
  useDeleteCustomerNotificationMutation,
  useGetCustomerNotificationsQuery,
  useMarkAllCustomerNotificationsReadMutation,
  useMarkCustomerNotificationReadMutation,
} from "@/redux/api/customer-api";

export default function NotificationsAccountPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] =
    useState<"all" | "unread" | "order" | "payment" | "shipping" | "security" | "promotion">("all");
  const [search, setSearch] = useState("");
  const { data, isLoading, isFetching, refetch } = useGetCustomerNotificationsQuery({
    page,
    limit: 12,
    unreadOnly: filter === "unread",
    type: filter === "unread" || filter === "all" ? undefined : filter,
    search: search.trim() || undefined,
  });
  const [markAll, { isLoading: markingAll }] = useMarkAllCustomerNotificationsReadMutation();
  const [markRead] = useMarkCustomerNotificationReadMutation();
  const [remove] = useDeleteCustomerNotificationMutation();

  const notifications = data?.data?.notifications ?? [];
  const unreadCount = data?.data?.unreadCount ?? 0;
  const pagination = data?.data?.pagination;

  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <CustomerAccountShell>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
              Order updates, promotions and security alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => void refetch()} disabled={isLoading || isFetching}>
              {isFetching ? "Updating…" : "Refresh"}
            </Button>

            <Button
              onClick={async () => {
                try {
                  await markAll().unwrap();
                  toast.success("All notifications marked as read");
                  setExpanded(null);
                } catch {
                  toast.error("Could not mark all as read");
                }
              }}
              disabled={markingAll || notifications.length === 0}
            >
              <CheckCheck className="h-4 w-4" /> Mark all as read
            </Button>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-apple-ink-muted-48" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search notifications"
              className="h-11 w-full rounded-apple-pill border border-apple-hairline bg-white pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-apple-primary-focus"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "unread", "order", "payment", "shipping", "security", "promotion"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setFilter(value);
                  setPage(1);
                }}
                className={cn(
                  "rounded-apple-pill border px-3 py-2 text-sm font-medium capitalize transition-colors",
                  filter === value
                    ? "border-apple-primary bg-apple-canvas-parchment text-apple-ink"
                    : "border-apple-hairline text-apple-ink-muted-80 hover:bg-apple-canvas-parchment",
                )}
              >
                {value === "unread" ? `Unread${unreadCount ? ` (${unreadCount})` : ""}` : value}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-apple-lg bg-apple-canvas-parchment" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <Bell className="h-12 w-12 text-zinc-300" />
            <h2 className="text-lg font-semibold">No notifications yet</h2>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              {unreadCount ? `${unreadCount} unread` : "You're all caught up"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const isOpen = expanded === n._id;
              const style = getCustomerNotificationStyle(n.type, n.icon);
              const Icon = style.icon;
              return (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "rounded-apple-lg border p-4 text-left transition-colors",
                    n.read ? "border-apple-hairline" : "border-apple-primary",
                  )}
                  style={{ borderColor: n.read ? "#E5E7EB" : "#111111" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button type="button" className="flex flex-1 items-start gap-3 text-left" onClick={() => setExpanded((cur) => (cur === n._id ? null : n._id))}>
                      <div className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", style.className)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                      <p className="text-sm font-semibold">{n.title}</p>
                      <p className="mt-1 text-xs" style={{ color: "#6B7280" }}>
                        <time title={new Date(n.createdAt).toLocaleString()}>{formatNotificationTimeAgo(n.createdAt)}</time>
                      </p>
                      </div>
                    </button>
                    {!n.read ? <span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: "#111111" }} /> : null}
                  </div>
                  <p
                    className="mt-3 text-sm"
                    style={{ color: "#6B7280", display: isOpen ? "block" : "-webkit-box" as any, WebkitLineClamp: isOpen ? undefined : 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}
                  >
                    {n.message}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="text-xs capitalize text-apple-ink-muted-48">{style.label}</div>
                    <div className="flex items-center gap-1">
                      {!n.read ? (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await markRead(n._id).unwrap();
                            } catch {
                              toast.error("Could not mark as read");
                            }
                          }}
                          className="rounded-sm p-2 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await remove(n._id).unwrap();
                            toast.success("Notification deleted");
                          } catch {
                            toast.error("Could not delete notification");
                          }
                        }}
                        className="rounded-sm p-2 text-apple-ink-muted-48 hover:bg-red-50 hover:text-red-600"
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {pagination && pagination.total > 0 ? (
          <Pagination
            page={pagination.page}
            totalPages={pagination.pages}
            total={pagination.total}
            pageSize={pagination.limit}
            onPageChange={setPage}
          />
        ) : null}
      </div>
    </CustomerAccountShell>
  );
}
