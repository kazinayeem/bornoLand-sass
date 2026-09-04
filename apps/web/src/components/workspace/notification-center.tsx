"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Loader2,
  Trash2,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/workspace/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { ListSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useClearNotificationsMutation,
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/redux/api/billing-api";
import { getNotificationStyle, timeAgo } from "@/components/user/notification-ui";

interface NotificationCenterProps {
  mode?: "workspace" | "store";
  storeId?: string;
  storeSlug?: string;
  title?: string;
  description?: string;
}

export function NotificationCenter({
  mode = "workspace",
  storeId,
  storeSlug,
  title = "Notification Center",
  description = "View order, payment, subscription, security, and system updates.",
}: NotificationCenterProps) {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const queryParams = {
    page,
    limit: 10,
    unreadOnly: filter === "unread",
    ...(storeId ? { storeId } : {}),
  };

  const { data, isLoading, isFetching, isError, refetch } = useGetNotificationsQuery(
    queryParams,
    { pollingInterval: 15000, refetchOnFocus: true }
  );

  const [markRead] = useMarkNotificationReadMutation();
  const [markAll, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();
  const [remove] = useDeleteNotificationMutation();
  const [clearAll, { isLoading: clearing }] = useClearNotificationsMutation();

  const notifications = data?.data?.notifications ?? [];
  const pagination = data?.data?.pagination;
  const unread = data?.data?.unreadCount ?? 0;

  const handleMarkAllRead = async () => {
    try {
      await markAll().unwrap();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Could not update notifications");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to permanently delete all notifications?")) return;
    try {
      await clearAll().unwrap();
      setPage(1);
      toast.success("All notifications deleted");
    } catch {
      toast.error("Could not delete notifications");
    }
  };

  const handleSingleRead = async (id: string) => {
    try {
      await markRead(id).unwrap();
    } catch {
      toast.error("Could not update notification");
    }
  };

  const handleSingleDelete = async (id: string) => {
    try {
      await remove(id).unwrap();
      toast.success("Notification deleted");
    } catch {
      toast.error("Could not delete notification");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-16">
      <PageHeader
        title={title}
        description={description}
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
              Refresh
            </button>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                disabled={markingAll}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                {markingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
                Mark All Read
              </button>
            )}
            <button
              type="button"
              onClick={() => void handleClearAll()}
              disabled={clearing || (!isLoading && (pagination?.total ?? 0) === 0)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Clear All
            </button>
          </div>
        }
      />

      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-3 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800/80 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
            {(["all", "unread"] as const).map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => {
                  setFilter(value);
                  setPage(1);
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                  filter === value
                    ? "bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                )}
              >
                {value === "all" ? "All Notifications" : "Unread"}
                {value === "unread" && unread > 0 ? ` (${unread})` : ""}
              </button>
            ))}
          </div>

          {isFetching && !isLoading && (
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Updating...
            </span>
          )}
        </div>

        <div className="p-3 sm:p-4">
          {isLoading ? (
            <ListSkeleton rows={6} />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Unable to load notifications
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm">
                There was a problem communicating with the notification service. Please check your network connection and try again.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-zinc-950"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try Again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title={
                filter === "unread"
                  ? "No unread notifications"
                  : "No notifications yet"
              }
              description={
                filter === "unread"
                  ? "All notifications have been marked as read."
                  : mode === "store"
                  ? "Orders, inventory updates, and store events will appear here in real time."
                  : "New orders, payments, subscriptions, and system alerts will appear here."
              }
            />
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => {
                const style = getNotificationStyle(notification.type);
                const Icon = style.icon;
                const actionHref = notification.actionUrl || (storeSlug ? `/store/${storeSlug}/dashboard` : "/workshops");

                return (
                  <div
                    key={notification._id}
                    className={cn(
                      "group flex items-start gap-3.5 rounded-2xl border p-4 transition hover:border-zinc-300 hover:shadow-xs dark:hover:border-zinc-700",
                      notification.isRead
                        ? "border-zinc-100 bg-white dark:border-zinc-900 dark:bg-zinc-950"
                        : "border-indigo-100 bg-indigo-50/40 dark:border-indigo-900/40 dark:bg-indigo-950/20"
                    )}
                  >
                    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", style.className)}>
                      <Icon className="h-4 w-4" />
                    </div>

                    <Link
                      href={actionHref}
                      onClick={() => {
                        if (!notification.isRead) void handleSingleRead(notification._id);
                      }}
                      className="min-w-0 flex-1"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {notification.title}
                        </h2>
                        {!notification.isRead && (
                          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                        <span className="capitalize font-medium">{style.label}</span>
                        <span>•</span>
                        <time>{timeAgo(notification.createdAt)}</time>
                      </div>
                    </Link>

                    <div className="flex shrink-0 items-center gap-1">
                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={() => void handleSingleRead(notification._id)}
                          title="Mark as read"
                          aria-label="Mark as read"
                          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        title="Delete notification"
                        aria-label="Delete notification"
                        onClick={() => void handleSingleDelete(notification._id)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {pagination && pagination.total > 0 && (
          <div className="border-t border-zinc-100 px-5 pb-4 dark:border-zinc-800/80">
            <Pagination
              page={pagination.page}
              totalPages={pagination.pages}
              total={pagination.total}
              pageSize={pagination.limit}
              onPageChange={setPage}
            />
          </div>
        )}
      </section>
    </div>
  );
}
