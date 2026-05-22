"use client";

import { motion } from "framer-motion";
import { Users, Building2, DollarSign, CreditCard, Globe, TrendingUp, Activity } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { UserGrowthChart } from "@/components/charts/user-growth-chart";
import { PlanDistributionChart } from "@/components/charts/plan-distribution-chart";
import { stats, recentActivity, revenueData } from "@/lib/admin/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  const totalRevenue = revenueData.reduce((s, r) => s + r.revenue, 0);
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Welcome back, Admin</h2>
          <p className="mt-1 text-sm text-zinc-500">Here&apos;s what&apos;s happening with your platform today.</p>
        </div>
        <div className="hidden items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 sm:flex">
          <Activity className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium text-zinc-700">All systems operational</span>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} change={stats.userGrowth} icon={Users} variant="blue" delay={0} />
        <StatCard title="Total Tenants" value={stats.totalTenants} change={stats.tenantGrowth} icon={Building2} variant="green" delay={0.05} />
        <StatCard title="Revenue" value={`$${(totalRevenue / 1000).toFixed(1)}k`} change={stats.revenueGrowth} icon={DollarSign} variant="default" delay={0.1} />
        <StatCard title="Subscriptions" value={stats.activeSubscriptions} change={11.2} icon={CreditCard} variant="purple" delay={0.15} />
        <StatCard title="Published Sites" value={stats.publishedSites} change={22.4} icon={Globe} variant="amber" delay={0.2} />
        <StatCard title="Growth Rate" value={`${stats.monthlyGrowth}%`} icon={TrendingUp} variant="green" delay={0.25} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-zinc-900">Revenue Overview</CardTitle>
              <select className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600">
                <option>This Year</option>
                <option>Last Quarter</option>
              </select>
            </div>
            <p className="text-sm text-zinc-500">Monthly revenue breakdown with subscription and one-time payments</p>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-zinc-900">Plan Distribution</CardTitle>
            <p className="text-sm text-zinc-500">Current subscription plan breakdown</p>
          </CardHeader>
          <CardContent>
            <PlanDistributionChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-zinc-900">User Growth</CardTitle>
              <select className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600">
                <option>Monthly</option>
                <option>Weekly</option>
              </select>
            </div>
            <p className="text-sm text-zinc-500">Total users vs active users over time</p>
          </CardHeader>
          <CardContent>
            <UserGrowthChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-zinc-900">Recent Activity</CardTitle>
            <p className="text-sm text-zinc-500">Latest platform events</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-100">
              {recentActivity.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start gap-3 px-6 py-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                    {act.user.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-700">
                      <span className="font-medium text-zinc-900">{act.user}</span> {act.action}{" "}
                      <span className="font-medium text-blue-600">{act.target}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
