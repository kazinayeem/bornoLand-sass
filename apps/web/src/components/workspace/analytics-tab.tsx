"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useGetStoreOrdersQuery } from "@/redux/api/store-order-api";
import {
  BarChart3, DollarSign, ShoppingCart, Package, TrendingUp,
  Users, CreditCard, Activity, Loader2, ArrowUp, ArrowDown,
} from "lucide-react";

type AnalyticsTabProps = { storeId: string };

function formatBDT(v: number) {
  return new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(v || 0);
}

export function AnalyticsTab({ storeId }: AnalyticsTabProps) {
  const { data, isLoading } = useGetStoreOrdersQuery({ storeId, limit: "200" });

  const analytics = data?.data?.analytics;
  const orders = data?.data?.orders ?? [];

  const stats = useMemo(() => {
    const totalRevenue = analytics?.totalRevenue ?? 0;
    const totalOrders = analytics?.totalOrders ?? 0;
    const pendingOrders = analytics?.pendingOrders ?? 0;
    const deliveredOrders = analytics?.deliveredOrders ?? 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const paidOrders = orders.filter((o) => o.paymentStatus === "paid").length;
    const codOrders = orders.filter((o) => o.paymentMethod === "cod").length;
    const bkashOrders = orders.filter((o) => o.paymentMethod === "bkash" || o.paymentMethod === "nagad" || o.paymentMethod === "rocket").length;

    const productSales: Record<string, { qty: number; revenue: number }> = {};
    orders.forEach((o) => {
      o.items?.forEach((item) => {
        if (!productSales[item.name]) productSales[item.name] = { qty: 0, revenue: 0 };
        productSales[item.name].qty += item.quantity;
        productSales[item.name].revenue += item.price * item.quantity;
      });
    });
    const topProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b.qty - a.qty)
      .slice(0, 5);

    const uniqueCustomers = new Set(orders.map((o) => o.customerId?._id).filter(Boolean)).size;

    return {
      totalRevenue, totalOrders, pendingOrders, deliveredOrders,
      avgOrderValue, paidOrders, codOrders, bkashOrders,
      topProducts, uniqueCustomers,
    };
  }, [analytics, orders]);

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }

  const kpiCards = [
    { label: "Total Revenue", value: formatBDT(stats.totalRevenue), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Total Orders", value: String(stats.totalOrders), icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Avg Order Value", value: formatBDT(stats.avgOrderValue), icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-100" },
    { label: "Customers", value: String(stats.uniqueCustomers), icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Delivered", value: String(stats.deliveredOrders), icon: Package, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Pending", value: String(stats.pendingOrders), icon: Activity, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${kpi.bg}`}>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-zinc-900">{kpi.value}</p>
              <p className="mt-0.5 text-xs font-medium text-zinc-500">{kpi.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Analytics */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-zinc-400" /> Payment Analytics
          </h3>
          <div className="space-y-3">
            {[
              { label: "COD Orders", value: stats.codOrders, total: stats.totalOrders, color: "bg-emerald-500" },
              { label: "Mobile Banking", value: stats.bkashOrders, total: stats.totalOrders, color: "bg-pink-500" },
              { label: "Paid Orders", value: stats.paidOrders, total: stats.totalOrders, color: "bg-blue-500" },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600">{item.label}</span>
                  <span className="font-semibold text-zinc-900">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color} transition-all`}
                    style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-zinc-400" /> Top Products
          </h3>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-8">No product data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map(([name, data], i) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs font-bold text-zinc-300 w-5">{i + 1}</span>
                    <span className="text-sm text-zinc-700 truncate">{name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-zinc-500">{data.qty} sold</span>
                    <span className="font-semibold text-zinc-900 w-20 text-right">{formatBDT(data.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Orders Timeline */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-zinc-400" /> Recent Orders
        </h3>
        {orders.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-8">No orders yet</p>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 10).map((order, i) => (
              <div key={order._id} className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-2.5">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-xs font-mono font-semibold text-blue-600">{order.orderNumber}</span>
                  <span className="text-xs text-zinc-500 truncate">{order.customerId?.name || "Guest"}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${
                    order.status === "delivered" ? "bg-emerald-50 text-emerald-700" :
                    order.status === "cancelled" ? "bg-red-50 text-red-700" :
                    order.status === "pending" ? "bg-amber-50 text-amber-700" :
                    "bg-blue-50 text-blue-700"
                  }`}>{order.status}</span>
                  <span className="font-semibold text-zinc-900">{formatBDT(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
