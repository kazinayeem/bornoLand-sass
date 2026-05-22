"use client";

import { motion } from "framer-motion";
import { useAppSelector } from "@/hooks/redux";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { Store, Package, Palette, ShoppingCart, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function DashboardHomePage() {
  const user = useAppSelector((s) => s.user.profile);
  const { data: storesData } = useGetMyStoresQuery();
  const stores = storesData?.data?.stores ?? [];
  const activeStores = stores.filter((s) => s.status === "active");

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
          Welcome back, {user?.name?.split(" ")[0] ?? "User"}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">Manage your ecommerce stores.</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Stores</CardTitle>
            <Store className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-900">{stores.length}</p>
            <p className="text-xs text-zinc-500">{activeStores.length} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Products</CardTitle>
            <Package className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-900">—</p>
            <p className="text-xs text-zinc-500">Select a store to view</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Plan</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-900 capitalize">{stores[0]?.plan ?? "Free"}</p>
            <p className="text-xs text-zinc-500">Current subscription</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Stores Published</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-900">{stores.length}</p>
            <p className="text-xs text-zinc-500">Across all stores</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-zinc-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link href="/dashboard/create-store"
              className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Create Store</p>
                <p className="text-xs text-zinc-500">Launch a new store</p>
              </div>
            </Link>
            <Link href="/dashboard/products"
              className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Manage Products</p>
                <p className="text-xs text-zinc-500">Add/edit products</p>
              </div>
            </Link>
            <Link href="/dashboard/theme"
              className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 transition-all hover:border-violet-200 hover:bg-violet-50/50 hover:shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Customize Theme</p>
                <p className="text-xs text-zinc-500">Change look and feel</p>
              </div>
            </Link>
            <Link href="/dashboard/settings"
              className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 transition-all hover:border-amber-200 hover:bg-amber-50/50 hover:shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Settings</p>
                <p className="text-xs text-zinc-500">Account settings</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-zinc-900">Your Stores</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {stores.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                <Store className="h-10 w-10 text-zinc-300" />
                <p className="text-sm font-medium text-zinc-600">No stores yet</p>
                <p className="text-xs text-zinc-400">Create your first store to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {stores.slice(0, 5).map((store) => (
                  <div key={store._id} className="flex items-center gap-3 px-6 py-3.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                      {store.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-900">{store.name}</p>
                      <p className="text-xs text-zinc-500">{store.subdomain} &middot; {store.status}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 capitalize">{store.plan}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
