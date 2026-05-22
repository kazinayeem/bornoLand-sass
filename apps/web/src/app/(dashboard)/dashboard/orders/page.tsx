"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { ShoppingCart, Store, Search, Filter } from "lucide-react";

export default function OrdersPage() {
  const { data: storesData } = useGetMyStoresQuery();
  const stores = storesData?.data?.stores ?? [];
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const store = stores.find((s) => s._id === selectedStoreId);

  if (!selectedStoreId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Orders</h2>
            <p className="mt-1 text-sm text-zinc-500">View and manage your store orders.</p>
          </div>
        </div>
        {stores.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
              <ShoppingCart className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-zinc-900">No stores yet</h3>
            <p className="mt-2 text-sm text-zinc-500">Create a store to start receiving orders.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((s) => (
              <button key={s._id} onClick={() => setSelectedStoreId(s._id)}
                className="group rounded-2xl border border-zinc-200 bg-white p-5 text-left transition-all hover:shadow-lg hover:-translate-y-0.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white">
                  {s.name[0]}
                </div>
                <h3 className="mt-3 font-semibold text-zinc-900">{s.name}</h3>
                <p className="text-xs text-zinc-400">{s.subdomain || s.slug}.bornoland.com</p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Orders</h2>
            <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">{store?.name}</span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">Manage your store orders.</p>
        </div>
        <button onClick={() => setSelectedStoreId("")} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-50">Change Store</button>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
          <ShoppingCart className="h-8 w-8 text-zinc-400" />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-zinc-900">No orders yet</h3>
        <p className="mt-2 text-sm text-zinc-500">Orders will appear here once customers start purchasing.</p>
      </div>
    </div>
  );
}
