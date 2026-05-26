"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useGetStoreOrdersQuery } from "@/redux/api/store-order-api";
import {
  Users, Loader2, Search, Mail, Phone, ShoppingCart,
  DollarSign, MapPin, Calendar, X,
} from "lucide-react";

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

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="h-9 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 text-sm" />
        </div>
        <p className="text-sm text-zinc-500">{customers.length} customer{customers.length !== 1 ? "s" : ""}</p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-zinc-300" />
          <h3 className="mt-3 text-base font-semibold text-zinc-900">No customer data</h3>
          <p className="mt-1 text-sm text-zinc-500">Customers will appear here when orders are placed.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <motion.button key={c._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              onClick={() => setSelectedCust(c)}
              className="text-left rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-900 truncate">{c.name}</p>
                  <p className="text-xs text-zinc-400 truncate">{c.email || c.phone}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-zinc-50 p-2">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase">Orders</p>
                  <p className="text-sm font-bold text-zinc-900">{c.totalOrders}</p>
                </div>
                <div className="rounded-lg bg-zinc-50 p-2">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase">Spent</p>
                  <p className="text-sm font-bold text-zinc-900">{formatBDT(c.totalSpent)}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Customer Detail Drawer */}
      {selectedCust && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => setSelectedCust(null)} className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-zinc-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                  {selectedCust.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900">{selectedCust.name}</h3>
                  <p className="text-xs text-zinc-400">Customer</p>
                </div>
              </div>
              <button onClick={() => setSelectedCust(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
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
                      <span key={city} className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                        {city}
                      </span>
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
                        <span className={`text-[10px] font-medium ${
                          o.status === "delivered" ? "text-emerald-600" : o.status === "cancelled" ? "text-red-500" : "text-amber-600"
                        }`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                  {orders.filter((o) => o.customerId?._id === selectedCust._id).length === 0 && (
                    <p className="text-sm text-zinc-400 text-center py-4">No orders found</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
