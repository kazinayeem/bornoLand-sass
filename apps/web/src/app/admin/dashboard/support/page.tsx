"use client";

import { motion } from "framer-motion";
import { HelpCircle, MessageSquare, Clock, AlertCircle } from "lucide-react";
import { supportTickets } from "@/lib/admin/data";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SupportPage() {
  const openCount = supportTickets.filter((t) => t.status === "open" || t.status === "in_progress").length;
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Support Tickets</h2>
        <p className="mt-1 text-sm text-zinc-500">Manage support requests from tenants.</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">Open</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-blue-600">{openCount}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">Resolved</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-emerald-600">{supportTickets.filter((t) => t.status === "resolved").length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">High Priority</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-600">{supportTickets.filter((t) => t.priority === "high").length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">Avg Response</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-zinc-900">2.4h</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg font-semibold text-zinc-900">All Tickets</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-100">
            {supportTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-start justify-between px-6 py-4 transition-colors hover:bg-zinc-50">
                <div className="flex items-start gap-4">
                  <div className={["mt-1 flex h-8 w-8 items-center justify-center rounded-full", ticket.priority === "high" ? "bg-red-50" : ticket.priority === "medium" ? "bg-amber-50" : "bg-blue-50"].join(" ")}>
                    <MessageSquare className={["h-4 w-4", ticket.priority === "high" ? "text-red-600" : ticket.priority === "medium" ? "text-amber-600" : "text-blue-600"].join(" ")} />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900">{ticket.subject}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                      <span>{ticket.tenant}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ticket.created}</span>
                      <span>•</span>
                      <span>{ticket.assignee}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
