"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Eye, DollarSign, ArrowUp, ArrowDown } from "lucide-react";
import { revenueData, userGrowthData, pageViewsData } from "@/lib/admin/data";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";

export default function AnalyticsPage() {
  const totalPageViews = pageViewsData.reduce((s, d) => s + d.views, 0);
  const totalUnique = pageViewsData.reduce((s, d) => s + d.unique, 0);
  const totalUsers = userGrowthData[userGrowthData.length - 1].users;
  const totalRevenue = revenueData.reduce((s, r) => s + r.revenue, 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Analytics</h2>
        <p className="mt-1 text-sm text-zinc-500">Platform-wide metrics and performance insights.</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">Total Users</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-zinc-900">{totalUsers.toLocaleString()}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600"><ArrowUp className="h-3 w-3" /> +12.5% this month</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">Total Revenue</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-zinc-900">${totalRevenue.toLocaleString()}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600"><ArrowUp className="h-3 w-3" /> +23.1% this year</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">Page Views</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-zinc-900">{totalPageViews.toLocaleString()}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600"><ArrowUp className="h-3 w-3" /> +8.2% this week</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">Unique Visitors</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-zinc-900">{totalUnique.toLocaleString()}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-amber-600"><ArrowDown className="h-3 w-3" /> -2.1% this week</p></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg font-semibold text-zinc-900">Revenue Trend</CardTitle></CardHeader>
          <CardContent><RevenueChart /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg font-semibold text-zinc-900">Page Views (This Week)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pageViewsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs><linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                  <Area type="monotone" dataKey="views" stroke="#2563eb" fill="url(#viewsGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="unique" stroke="#60a5fa" fill="none" strokeWidth={2} strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg font-semibold text-zinc-900">Monthly Performance</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
