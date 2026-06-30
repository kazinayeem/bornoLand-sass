"use client";

import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/workspace/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/redux/api/billing-api";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function NotificationsPage() {
  const { data, isLoading } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();

  const notifications = data?.data?.notifications ?? [];

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id).unwrap();
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Notifications"
        description="Stay updated on payments, trials, orders, and workspace activity."
        actions={
          notifications.some((n) => !n.read) ? (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              {markingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
              Mark all read
            </button>
          ) : undefined
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>Your recent alerts and updates.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No notifications yet"
              description="When you receive orders, payment updates, or trial reminders, they'll appear here."
            />
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => !notification.read && handleMarkRead(notification._id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                    notification.read ? "border-zinc-100 bg-white" : "border-blue-100 bg-blue-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{notification.title}</p>
                      <p className="mt-0.5 text-sm text-zinc-600">{notification.message}</p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && <Badge variant="primary">New</Badge>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
