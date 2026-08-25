"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, Loader2, Trash2 } from "lucide-react";
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
import { useLanguage } from "@/providers/language-provider";

export default function NotificationsPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { data, isLoading, isFetching } = useGetNotificationsQuery(
    { page, limit: 10, unreadOnly: filter === "unread" },
    { pollingInterval: 15000, refetchOnFocus: true }
  );
  const [markRead] = useMarkNotificationReadMutation();
  const [markAll, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();
  const [remove] = useDeleteNotificationMutation();
  const [clearAll, { isLoading: clearing }] = useClearNotificationsMutation();

  const notifications = data?.data?.notifications ?? [];
  const pagination = data?.data?.pagination;
  const unread = data?.data?.unreadCount ?? 0;

  const allRead = async () => {
    try {
      await markAll().unwrap();
      toast.success(isBn ? "সব নোটিফিকেশন পড়া হয়েছে হিসেবে চিহ্নিত করা হয়েছে" : "All notifications marked as read");
    } catch {
      toast.error(isBn ? "নোটিফিকেশন আপডেট করা যায়নি" : "Could not update notifications");
    }
  };

  const clear = async () => {
    if (!window.confirm(isBn ? "আপনি কি স্থায়ীভাবে সব নোটিফিকেশন মুছে ফেলতে চান?" : "Are you sure you want to delete all notifications?")) return;
    try {
      await clearAll().unwrap();
      setPage(1);
      toast.success(isBn ? "সব নোটিফিকেশন মুছে ফেলা হয়েছে" : "All notifications deleted");
    } catch {
      toast.error(isBn ? "নোটিফিকেশন মোছা যায়নি" : "Could not delete notifications");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-16">
      <PageHeader
        title={isBn ? "নোটিফিকেশন সেন্টার" : "Notification Center"}
        description={isBn ? "অর্ডার, পেমেন্ট, সাবস্ক্রিপশন, নিরাপত্তা ও সিস্টেমের আপডেটসমূহ এক সাথে দেখুন।" : "View order, payment, subscription, security, and system updates."}
        actions={
          <div className="flex flex-wrap gap-2">
            {unread > 0 && (
              <button
                type="button"
                onClick={() => void allRead()}
                disabled={markingAll}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
              >
                {markingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
                {isBn ? "সব পড়া হয়েছে" : "Mark All Read"}
              </button>
            )}
            <button
              type="button"
              onClick={() => void clear()}
              disabled={clearing || (!isLoading && (pagination?.total ?? 0) === 0)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {isBn ? "সব মুছে ফেলুন" : "Clear All"}
            </button>
          </div>
        }
      />
      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-zinc-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-xl bg-zinc-100 p-1">
            {(["all", "unread"] as const).map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => {
                  setFilter(value);
                  setPage(1);
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                  filter === value ? "bg-white text-apple-ink shadow-sm" : "text-apple-ink-muted-48"
                )}
              >
                {value === "all" ? (isBn ? "সব" : "All") : (isBn ? "অপঠিত" : "Unread")}
                {value === "unread" && unread > 0 ? ` (${unread})` : ""}
              </button>
            ))}
          </div>
          {isFetching && !isLoading && (
            <span className="inline-flex items-center gap-1.5 text-xs text-apple-ink-muted-48">
              <Loader2 className="h-3 w-3 animate-spin" />
              {isBn ? "আপডেট হচ্ছে" : "Updating..."}
            </span>
          )}
        </div>
        <div className="p-3 sm:p-4">
          {isLoading ? (
            <ListSkeleton rows={6} />
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title={
                filter === "unread"
                  ? (isBn ? "কোনো অপঠিত নোটিফিকেশন নেই" : "No unread notifications")
                  : (isBn ? "এখনও কোনো নোটিফিকেশন নেই" : "No notifications yet")
              }
              description={
                filter === "unread"
                  ? (isBn ? "সব নোটিফিকেশন পড়া শেষ।" : "All notifications have been read.")
                  : (isBn ? "নতুন অর্ডার, পেমেন্ট ও প্ল্যাটফর্ম আপডেট এখানে জমা হবে।" : "New order, payment, and system updates will appear here.")
              }
            />
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => {
                const style = getNotificationStyle(notification.type);
                const Icon = style.icon;
                return (
                  <div
                    key={notification._id}
                    className={cn(
                      "group flex items-start gap-3 rounded-2xl border p-4 transition hover:border-zinc-300 hover:shadow-sm",
                      notification.isRead ? "border-zinc-100 bg-white" : "border-blue-100 bg-blue-50/50"
                    )}
                  >
                    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", style.className)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <Link
                      href={notification.actionUrl || "#"}
                      onClick={() => {
                        if (!notification.isRead) void markRead(notification._id);
                      }}
                      className="min-w-0 flex-1"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-apple-ink">{notification.title}</h2>
                        {!notification.isRead && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            {isBn ? "নতুন" : "New"}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-apple-ink-muted-80">{notification.message}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-apple-ink-muted-48">
                        <span className="capitalize">{style.label}</span>
                        <span>•</span>
                        <time title={new Date(notification.createdAt).toLocaleString()}>{timeAgo(notification.createdAt)}</time>
                      </div>
                    </Link>
                    <div className="flex shrink-0 gap-1">
                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await markRead(notification._id).unwrap();
                            } catch {
                              toast.error(isBn ? "নোটিফিকেশন আপডেট করা যায়নি" : "Could not update notification");
                            }
                          }}
                          title={isBn ? "পড়া হয়েছে হিসেবে চিহ্নিত করুন" : "Mark as read"}
                          className="rounded-xl p-2 text-apple-ink-muted-48 hover:bg-white hover:text-zinc-800"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        title={isBn ? "মুছে ফেলুন" : "Delete"}
                        onClick={async () => {
                          try {
                            await remove(notification._id).unwrap();
                            toast.success(isBn ? "নোটিফিকেশন মুছে ফেলা হয়েছে" : "Notification deleted");
                          } catch {
                            toast.error(isBn ? "নোটিফিকেশন মোছা যায়নি" : "Could not delete notification");
                          }
                        }}
                        className="rounded-xl p-2 text-apple-ink-muted-48 hover:bg-red-50 hover:text-red-600"
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
          <div className="border-t border-zinc-100 px-5 pb-4">
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
