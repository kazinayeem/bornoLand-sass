"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CheckCircle2, Clock, ShoppingCart, XCircle } from "lucide-react";
import { KpiCard } from "../shared/KpiCard";
import { ChartCard } from "../shared/ChartCard";
import { ReportPanel } from "../shared/ReportPanel";
import { ReportDataTable } from "../shared/ReportDataTable";
import { applyClientFilters, customerName, type OrdersModuleProps } from "./module-types";

export function OrdersModule({ kpis, orderReport, filters, money }: OrdersModuleProps) {
  const byStatus = orderReport?.byStatus ?? [];
  const byPayment = orderReport?.byPaymentMethod ?? [];

  const recentRaw = (orderReport?.recent ?? []).map((o, i) => {
    const row = o as {
      _id?: string;
      orderNumber?: string;
      status?: string;
      paymentStatus?: string;
      paymentMethod?: string;
      total?: number;
      createdAt?: string;
      customerId?: { name?: string; email?: string } | string;
      courier?: string;
    };
    return {
      id: row._id ?? String(i),
      orderNumber: row.orderNumber ?? "—",
      status: row.status ?? "—",
      paymentStatus: row.paymentStatus ?? "—",
      paymentMethod: row.paymentMethod ?? "—",
      total: row.total ?? 0,
      totalLabel: money(row.total ?? 0),
      createdAt: row.createdAt ? new Date(row.createdAt).toLocaleString() : "—",
      customer: customerName(row.customerId),
      courier: row.courier ?? "",
    };
  });

  const recent = applyClientFilters(recentRaw, filters, {
    status: (r) => r.status,
    paymentStatus: (r) => r.paymentStatus,
    paymentMethod: (r) => r.paymentMethod,
    courier: (r) => r.courier,
    searchText: (r) => `${r.orderNumber} ${r.customer} ${r.status}`,
    amount: (r) => r.total,
  });

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-4">
        <KpiCard label="Total orders" value={kpis?.totalOrders ?? 0} icon={ShoppingCart} tone="warning" compact />
        <KpiCard label="Pending" value={kpis?.pendingOrders ?? 0} icon={Clock} tone="warning" compact />
        <KpiCard label="Completed" value={kpis?.completedOrders ?? 0} icon={CheckCircle2} tone="success" compact />
        <KpiCard label="Cancelled" value={kpis?.cancelledOrders ?? 0} icon={XCircle} tone="danger" compact />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <ChartCard title="Orders by status" empty={byStatus.length === 0} height={220}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={32} />
              <Tooltip />
              <Bar dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Orders by payment method" empty={byPayment.length === 0} height={220}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byPayment}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={32} />
              <Tooltip formatter={(v) => money(Number(v || 0))} />
              <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ReportPanel title="Recent orders" description="Client-filtered from order report">
        <ReportDataTable
          columns={[
            { id: "orderNumber", label: "Order" },
            { id: "customer", label: "Customer" },
            { id: "status", label: "Status" },
            { id: "paymentStatus", label: "Payment" },
            { id: "paymentMethod", label: "Method" },
            { id: "totalLabel", label: "Total", align: "right" },
            { id: "createdAt", label: "Date" },
          ]}
          rows={recent}
          rowKey={(r) => String(r.id)}
        />
      </ReportPanel>
    </div>
  );
}
