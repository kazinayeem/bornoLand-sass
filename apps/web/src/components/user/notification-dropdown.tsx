"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, Loader2, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDeleteNotificationMutation, useGetNotificationsQuery, useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation } from "@/redux/api/billing-api";
import { getNotificationStyle, timeAgo } from "./notification-ui";

export function NotificationDropdown({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isFetching } = useGetNotificationsQuery({ page: 1, limit: 6 }, { pollingInterval: 15000, refetchOnFocus: true, refetchOnReconnect: true });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAll, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();
  const [remove] = useDeleteNotificationMutation();
  const notifications = data?.data?.notifications ?? [];
  const unreadCount = data?.data?.unreadCount ?? 0;

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (open && rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const handleRead = async (id: string) => {
    try { await markRead(id).unwrap(); } catch { toast.error("Could not update notification"); }
  };

  return (
    <div ref={rootRef} className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={`${unreadCount} unread notifications`}
        className={cn("relative flex h-9 w-9 items-center justify-center rounded-sm border border-apple-hairline bg-apple-canvas text-apple-ink-muted-48 transition hover:bg-apple-canvas-parchment", compact && "border-apple-hairline text-apple-ink-muted-48")}>
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: .98 }} transition={{ duration: .16 }}
            className="fixed inset-x-3 top-16 z-[70] overflow-hidden rounded-lg border border-apple-hairline bg-apple-canvas sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-[390px]">
            <div className="flex items-center justify-between border-b border-apple-divider-soft px-4 py-3.5">
              <div><h2 className="text-sm font-semibold text-apple-ink">Notifications</h2><p className="text-xs text-apple-ink-muted-48">{unreadCount ? `${unreadCount} unread` : "You're all caught up"}{isFetching && !isLoading ? " · Updating" : ""}</p></div>
              {unreadCount > 0 && <button type="button" disabled={markingAll} onClick={async () => { try { await markAll().unwrap(); toast.success("All notifications marked as read"); } catch { toast.error("Could not mark all as read"); } }} className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment">
                {markingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />} Mark all read
              </button>}
            </div>
            <div className="max-h-[min(65vh,430px)] overflow-y-auto">
              {isLoading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="flex animate-pulse gap-3 border-b border-apple-divider-soft p-4"><div className="h-10 w-10 rounded-lg bg-apple-canvas-parchment"/><div className="flex-1 space-y-2"><div className="h-3 w-1/3 rounded bg-apple-canvas-parchment"/><div className="h-3 w-4/5 rounded bg-apple-canvas-parchment"/></div></div>) : notifications.length === 0 ? (
                <div className="px-6 py-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-apple-canvas-parchment text-apple-ink-muted-48"><Bell className="h-5 w-5"/></div><p className="mt-3 text-sm font-medium text-apple-ink">No notifications yet</p><p className="mt-1 text-xs text-apple-ink-muted-48">Updates about your stores and account will appear here.</p></div>
              ) : notifications.map((notification) => {
                const style = getNotificationStyle(notification.type); const Icon = style.icon;
                return <div key={notification._id} className={cn("group relative flex gap-3 border-b border-apple-divider-soft p-3.5 transition hover:bg-apple-canvas-parchment", !notification.isRead && "bg-apple-canvas-parchment/60")}>
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", style.className)}><Icon className="h-4 w-4"/></div>
                  <Link href={notification.actionUrl || "/dashboard/notifications"} onClick={() => { if (!notification.isRead) void handleRead(notification._id); setOpen(false); }} className="min-w-0 flex-1 pr-12">
                    <div className="flex items-center gap-2"><p className="truncate text-sm font-semibold text-apple-ink">{notification.title}</p>{!notification.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-apple-primary"/>}</div>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-apple-ink-muted-80">{notification.message}</p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-apple-ink-muted-48"><span className="capitalize">{style.label}</span><span>•</span><time>{timeAgo(notification.createdAt)}</time></div>
                  </Link>
                  <div className="absolute right-2 top-3 flex opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                    {!notification.isRead && <button type="button" onClick={() => void handleRead(notification._id)} title="Mark as read" className="rounded-sm p-1.5 text-apple-ink-muted-48 hover:bg-apple-canvas hover:text-apple-ink-muted-80"><Check className="h-3.5 w-3.5"/></button>}
                    <button type="button" onClick={async () => { try { await remove(notification._id).unwrap(); toast.success("Notification deleted"); } catch { toast.error("Could not delete notification"); } }} title="Delete" className="rounded-sm p-1.5 text-apple-ink-muted-48 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5"/></button>
                  </div>
                </div>;
              })}
            </div>
            <Link href="/dashboard/notifications" onClick={() => setOpen(false)} className="flex items-center justify-center border-t border-apple-divider-soft px-4 py-3 text-sm font-medium text-apple-ink-muted-80 transition hover:bg-apple-canvas-parchment">View all notifications</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
