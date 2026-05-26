"use client";

import { useState, useMemo } from "react";
import { useGetStoreOrdersQuery } from "@/redux/api/store-order-api";
import { Users, Mail, Phone, Calendar } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { DataTable, type Column } from "@/components/ui/data-table";

type CustomersTabProps = { storeId: string };

function formatBDT(v: number) {
  return new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(v || 0);
}

type CustomerSummary = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  cities: string[];
};

export function CustomersTab({ storeId }: CustomersTabProps) {
  const { data, isLoading } = useGetStoreOrdersQuery({ storeId, limit: "500" });
  const orders = data?.data?.orders ?? [];

  const [search, setSearch] = useState("");
  const [selectedCust, setSelectedCust] = useState<CustomerSummary | null>(null);

  const customers = useMemo(() => {
    const map = new Map<string, CustomerSummary>();
    orders.forEach((o) => {
      const c = o.customerId;
      if (!c?._id) return;
      const existing = map.get(c._id);
      if (existing) {
        existing.totalOrders++;
        existing.totalSpent += o.total;
        if (o.shippingAddress?.city && !existing.cities.includes(o.shippingAddress.city)) {
          existing.cities.push(o.shippingAddress.city);
        }
        if (new Date(o.createdAt) > new Date(existing.lastOrder)) {
          existing.lastOrder = o.createdAt;
          existing.phone = o.shippingAddress?.phone || existing.phone;
        }
      } else {
        map.set(c._id, {
          _id: c._id, name: c.name || "Unknown", email: c.email || "",
          phone: o.shippingAddress?.phone || "",
          totalOrders: 1, totalSpent: o.total,
          lastOrder: o.createdAt,
          cities: o.shippingAddress?.city ? [o.shippingAddress.city] : [],
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter((c) =>
      c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [customers, search]);

  const columns: Column<CustomerSummary>[] = [
    {
      key: "customer", label: "Customer",
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
            {c.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">{c.name}</p>
            <p className="text-xs text-zinc-400">{c.email || c.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: "orders", label: "Orders", sortable: true,
      render: (c) => <span className="text-sm font-medium text-zinc-900">{c.totalOrders}</span>,
    },
    {
      key: "spent", label: "Total Spent", sortable: true,
      render: (c) => <span className="text-sm font-bold text-zinc-900">{formatBDT(c.totalSpent)}</span>,
    },
    {
      key: "lastOrder", label: "Last Order",
      render: (c) => <span className="text-sm text-zinc-500">{new Date(c.lastOrder).toLocaleDateString()}</span>,
      hideOnMobile: true,
    },
    {
      key: "cities", label: "Cities", hideOnTablet: true,
      render: (c) => <span className="text-sm text-zinc-500">{c.cities.slice(0, 2).join(", ") || "—"}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{customers.length} customer{customers.length !== 1 ? "s" : ""}</p>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(c) => c._id}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search customers..."
        emptyIcon={Users}
        emptyTitle="No customer data"
        emptyDescription="Customers will appear here when orders are placed."
        onRowClick={setSelectedCust}
      />

      <Drawer
        open={!!selectedCust}
        onClose={() => setSelectedCust(null)}
        title={selectedCust?.name}
        description="Customer details"
        size="md"
      >
        {selectedCust && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-zinc-200 p-4">
                <p className="text-xs font-semibold text-zinc-400 uppercase">Total Orders</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">{selectedCust.totalOrders}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 p-4">
                <p className="text-xs font-semibold text-zinc-400 uppercase">Total Spent</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">{formatBDT(selectedCust.totalSpent)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-zinc-900">Contact Info</h4>
              <div className="rounded-xl border border-zinc-200 divide-y divide-zinc-100">
                {selectedCust.email && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Mail className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm text-zinc-600">{selectedCust.email}</span>
                  </div>
                )}
                {selectedCust.phone && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Phone className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm text-zinc-600">{selectedCust.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 px-4 py-3">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm text-zinc-600">Last order: {new Date(selectedCust.lastOrder).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {selectedCust.cities.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-zinc-900">Shipping Cities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCust.cities.map((city) => (
                    <span key={city} className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">{city}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-zinc-900">Order History</h4>
              <div className="space-y-2">
                {orders.filter((o) => o.customerId?._id === selectedCust._id).slice(0, 5).map((o) => (
                  <div key={o._id} className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-2.5">
                    <div>
                      <p className="text-xs font-mono font-semibold text-blue-600">{o.orderNumber}</p>
                      <p className="text-xs text-zinc-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-zinc-900">{formatBDT(o.total)}</p>
                      <span className={`text-[10px] font-medium ${o.status === "delivered" ? "text-emerald-600" : o.status === "cancelled" ? "text-red-500" : "text-amber-600"}`}>{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
