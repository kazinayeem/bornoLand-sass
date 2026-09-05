"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetMyNotificationsQuery,
  useMarkMyNotificationReadMutation,
  useMarkAllMyNotificationsReadMutation,
} from "@/redux/api/hrm-api";
import { useLanguage } from "@/providers/language-provider";
import {
  Bell,
  ArrowLeft,
  CheckCheck,
  CalendarCheck,
  CreditCard,
  Clock,
  FileText,
  Check,
  Loader2,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function NotificationsPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data: notifData, isLoading, refetch } = useGetMyNotificationsQuery(
    { storeId, unreadOnly },
    { skip: !storeId }
  );

  const [markRead] = useMarkMyNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllMyNotificationsReadMutation();

  const notifications = notifData?.data?.notifications ?? [];
  const unreadCount = notifData?.data?.unreadCount ?? 0;

  const handleMarkRead = async (notificationId: string) => {
    try {
      await markRead({ storeId, notificationId }).unwrap();
      refetch();
    } catch {
      // non-fatal
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead(storeId).unwrap();
      toast.success("All notifications marked as read");
      refetch();
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "hrm_leave_approved":
      case "hrm_leave_rejected":
        return <CalendarCheck className="h-4 w-4 text-blue-600" />;
      case "hrm_bank_approved":
      case "hrm_bank_rejected":
        return <CreditCard className="h-4 w-4 text-violet-600" />;
      case "hrm_attendance_approved":
      case "hrm_attendance_rejected":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "hrm_document_added":
        return <FileText className="h-4 w-4 text-emerald-600" />;
      default:
        return <Bell className="h-4 w-4 text-[#003399]" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div>
          <Link
            href={`/store/${storeSlug}/hrm/self-service`}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 mb-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>My Workspace</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Bell className="h-6 w-6 text-[#003399]" />
              <span>Notifications</span>
            </h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Alerts regarding leave approvals, bank updates, attendance reviews, and official HR announcements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`text-xs font-semibold ${unreadOnly ? "bg-zinc-100 font-bold dark:bg-zinc-800" : ""}`}
          >
            {unreadOnly ? "Show All" : "Unread Only"}
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              disabled={isMarkingAll}
              onClick={handleMarkAllRead}
              className="gap-1.5 text-xs font-semibold text-[#003399] border-zinc-200 dark:border-zinc-800"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark All Read</span>
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-16 text-center text-zinc-500 text-xs">
              <Inbox className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
                {unreadOnly ? "No unread notifications" : "No notifications yet"}
              </p>
              <p className="text-zinc-400 mt-1">Updates on your requests and assignments will be posted here.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {notifications.map((n: any) => (
                <div
                  key={n._id}
                  className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                    !n.isRead ? "bg-blue-50/40 dark:bg-blue-950/20" : "hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xs">
                      {getNotifIcon(n.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <span className="h-2 w-2 rounded-full bg-[#003399]" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[10px] font-mono text-zinc-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!n.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkRead(n._id)}
                      className="h-7 text-[11px] text-zinc-500 hover:text-zinc-900 font-semibold shrink-0"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      <span>Mark Read</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
