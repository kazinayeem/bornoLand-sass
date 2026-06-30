"use client";

import { Bell } from "lucide-react";
import { PageHeader } from "@/components/workspace/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotificationsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Notifications"
        description="Stay updated on payments, trials, orders, and workspace activity."
      />

      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>Your recent alerts and updates.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="When you receive orders, payment updates, or trial reminders, they'll appear here."
          />
        </CardContent>
      </Card>
    </div>
  );
}
