"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Eye, Activity, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const revenueData = [
  { month: "Jan", revenue: 12000, orders: 145, lastYear: 9000 },
  { month: "Feb", revenue: 19000, orders: 210, lastYear: 11000 },
  { month: "Mar", revenue: 15000, orders: 180, lastYear: 13000 },
  { month: "Apr", revenue: 22000, orders: 260, lastYear: 16000 },
  { month: "May", revenue: 28000, orders: 310, lastYear: 19000 },
  { month: "Jun", revenue: 25000, orders: 290, lastYear: 21000 },
  { month: "Jul", revenue: 32000, orders: 350, lastYear: 24000 },
  { month: "Aug", revenue: 35000, orders: 380, lastYear: 26000 },
  { month: "Sep", revenue: 30000, orders: 330, lastYear: 23000 },
  { month: "Oct", revenue: 38000, orders: 410, lastYear: 28000 },
  { month: "Nov", revenue: 42000, orders: 450, lastYear: 31000 },
  { month: "Dec", revenue: 48000, orders: 520, lastYear: 35000 },
];

const salesByCategory = [
  { name: "Electronics", value: 35, color: "#3b82f6" },
  { name: "Fashion", value: 25, color: "#8b5cf6" },
  { name: "Home", value: 20, color: "#10b981" },
  { name: "Sports", value: 12, color: "#f59e0b" },
  { name: "Books", value: 8, color: "#ef4444" },
];

const topProducts = [
  { name: "Wireless Headphones", sales: 234, revenue: 23400, trend: 12 },
  { name: "Smart Watch", sales: 189, revenue: 37800, trend: 8 },
  { name: "Running Shoes", sales: 156, revenue: 18720, trend: -3 },
  { name: "Yoga Mat", sales: 142, revenue: 4260, trend: 15 },
  { name: "Coffee Maker", sales: 128, revenue: 19200, trend: 5 },
];

const trafficData = [
  { day: "Mon", visitors: 1200, pageViews: 3400 },
  { day: "Tue", visitors: 1350, pageViews: 3800 },
  { day: "Wed", visitors: 1100, pageViews: 3200 },
  { day: "Thu", visitors: 1500, pageViews: 4100 },
  { day: "Fri", visitors: 1800, pageViews: 4800 },
  { day: "Sat", visitors: 2200, pageViews: 5600 },
  { day: "Sun", visitors: 1900, pageViews: 4900 },
];

const statCards = [
  { label: "Total Revenue", value: "$358,000", change: 23.5, icon: DollarSign, trend: "up" },
  { label: "Total Orders", value: "3,836", change: 18.2, icon: ShoppingCart, trend: "up" },
  { label: "Total Customers", value: "12,480", change: 14.7, icon: Users, trend: "up" },
  { label: "Conversion Rate", value: "3.24%", change: -2.1, icon: Activity, trend: "down" },
  { label: "Avg. Order Value", value: "$93.40", change: 5.8, icon: DollarSign, trend: "up" },
  { label: "Page Views", value: "28,200", change: 11.3, icon: Eye, trend: "up" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-lg">
        <p className="text-xs font-semibold text-zinc-900">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: ${entry.value?.toLocaleString() ?? entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const periods = [
    { key: "7d" as const, label: "7 Days" },
    { key: "30d" as const, label: "30 Days" },
    { key: "90d" as const, label: "90 Days" },
    { key: "1y" as const, label: "1 Year" },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">Analytics</h1>
          <p className="text-xs text-zinc-500">Real-time store performance metrics</p>
        </div>
        <div className="flex gap-1 rounded-xl border border-zinc-200 bg-white p-1">
          {periods.map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition ${period === p.key ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          const isUp = card.trend === "up";
          return (
            <div key={card.label} className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
                  <Icon className="h-4 w-4 text-zinc-600" />
                </div>
                <span className={`flex items-center gap-0.5 text-[11px] font-medium ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                  {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(card.change)}%
                </span>
              </div>
              <p className="mt-3 text-xs text-zinc-500">{card.label}</p>
              <p className="mt-0.5 text-xl font-semibold text-zinc-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900">Revenue Overview</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="lastYear" stroke="#d4d4d8" strokeWidth={2} fill="none" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="revenue" stroke="#18181b" strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900">Sales by Category</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={salesByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {salesByCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {salesByCategory.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-[11px] text-zinc-500">{entry.name} ({entry.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900">Traffic Overview</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="visitors" fill="#18181b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pageViews" fill="#d4d4d8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900">Top Products</h3>
          <div className="mt-3 space-y-3">
            {topProducts.map((product, i) => (
              <div key={product.name} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[11px] font-semibold text-zinc-500">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-zinc-900">{product.name}</p>
                  <p className="text-[11px] text-zinc-400">{product.sales} sales · ${product.revenue.toLocaleString()}</p>
                </div>
                <span className={`flex items-center gap-0.5 text-[11px] font-medium ${product.trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {product.trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(product.trend)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900">Monthly Orders & Revenue</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#18181b" strokeWidth={2} dot={{ r: 3, fill: "#18181b" }} />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: "#3b82f6" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
