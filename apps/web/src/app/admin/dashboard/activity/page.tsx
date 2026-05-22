"use client";

import { motion } from "framer-motion";
import { Activity, UserPlus, CreditCard, Globe, FileEdit, Shield, Download, Palette } from "lucide-react";
import { recentActivity } from "@/lib/admin/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actionIcons: Record<string, typeof Activity> = {
  create: UserPlus, upgrade: CreditCard, publish: Globe, team: UserPlus,
  ai: FileEdit, export: Download, template: Palette, payment: CreditCard
};

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Activity Logs</h2>
        <p className="mt-1 text-sm text-zinc-500">Track all platform activities and events.</p>
      </motion.div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-zinc-900">Recent Activity</CardTitle>
            <div className="flex items-center gap-3">
              <select className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600">
                <option>All Types</option>
                <option>Users</option>
                <option>Subscriptions</option>
                <option>Sites</option>
              </select>
              <select className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>All time</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-100">
            {recentActivity.map((act) => {
              const Icon = actionIcons[act.type] ?? Activity;
              return (
                <div key={act.id} className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-zinc-50">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100">
                    <Icon className="h-4 w-4 text-zinc-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-zinc-700">
                      <span className="font-medium text-zinc-900">{act.user}</span> {act.action}{" "}
                      <span className="font-medium text-blue-600">{act.target}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">{act.time}</p>
                  </div>
                  <span className="text-xs text-zinc-400 capitalize">{act.type}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
