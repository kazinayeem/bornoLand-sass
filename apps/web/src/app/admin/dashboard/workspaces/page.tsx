"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Building2, Loader2, Store, Users } from "lucide-react";
import { useGetAdminUsersQuery, useGetAdminStoresQuery } from "@/redux/api/admin-api";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatCard } from "@/components/admin/stat-card";

type Workspace = {
  userId: string;
  name: string;
  email: string;
  storeCount: number;
  stores: Array<{ _id: string; name: string; slug: string; status: string; plan?: string }>;
};

export default function WorkspacesPage() {
  const { data: usersData, isLoading: loadingUsers } = useGetAdminUsersQuery();
  const { data: storesData, isLoading: loadingStores } = useGetAdminStoresQuery();

  const users = usersData?.data?.users ?? [];
  const stores = storesData?.data?.stores ?? [];

  const workspaces = useMemo(() => {
    const map = new Map<string, Workspace>();
    for (const user of users) {
      map.set(user._id, {
        userId: user._id,
        name: user.name ?? "Unnamed",
        email: user.email,
        storeCount: 0,
        stores: [],
      });
    }
    for (const store of stores) {
      const uid =
        typeof store.userId === "object" && store.userId
          ? store.userId._id
          : String(store.userId ?? "");
      const ws = map.get(uid);
      if (ws) {
        ws.storeCount += 1;
        ws.stores.push({
          _id: store._id,
          name: store.name,
          slug: store.slug,
          status: store.status,
          plan: typeof store.planId === "object" && store.planId
            ? (store.planId as { name?: string }).name
            : store.plan,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.storeCount - a.storeCount);
  }, [users, stores]);

  if (loadingUsers || loadingStores) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Workspaces"
        description="Owners and their stores — your platform's tenant hierarchy."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Workspaces" value={workspaces.length} icon={Building2} variant="blue" />
        <StatCard title="Total stores" value={stores.length} icon={Store} variant="green" />
        <StatCard title="Users" value={users.length} icon={Users} variant="purple" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {workspaces.map((ws) => (
          <div
            key={ws.userId}
            className="rounded-2xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-apple-ink">{ws.name}</h3>
                <p className="text-sm text-apple-ink-muted-48">{ws.email}</p>
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {ws.storeCount} store{ws.storeCount !== 1 ? "s" : ""}
              </span>
            </div>

            {ws.stores.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {ws.stores.map((store) => (
                  <li
                    key={store._id}
                    className="flex items-center justify-between rounded-xl border border-zinc-100 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-zinc-800">{store.name}</p>
                      <p className="text-xs text-apple-ink-muted-48">/{store.slug}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs capitalize text-apple-ink-muted-48">{store.status}</p>
                      <p className="text-xs text-apple-ink-muted-48">{store.plan ?? "—"}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-apple-ink-muted-48">No stores yet.</p>
            )}

            <Link
              href={`/admin/dashboard/users`}
              className="mt-4 inline-block text-xs font-medium text-blue-600 hover:underline"
            >
              View user →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
