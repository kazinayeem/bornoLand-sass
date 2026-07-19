"use client";

import { useState } from "react";
import { Activity, Box, CreditCard, Download, KeyRound, LogIn, LogOut, RefreshCw, Store } from "lucide-react";
import { PageHeader } from "@/components/workspace/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { useGetProfileActivityQuery } from "@/redux/api/profile-api";
import { timeAgo } from "@/components/user/notification-ui";

const icons: Record<string, typeof Activity> = { login: LogIn, logout: LogOut, password_changed: KeyRound, store_settings_updated: Store, store_branding_updated: Store, product_created: Box, order_status_changed: RefreshCw, plan_upgraded: CreditCard, plan_downgraded: CreditCard, invoice_downloaded: Download };
const labels: Record<string, string> = { login: "Login", logout: "Logout", password_changed: "Password changed", store_settings_updated: "Store updated", store_branding_updated: "Store updated", product_created: "Product created", order_status_changed: "Order updated", plan_upgraded: "Plan changed", plan_downgraded: "Plan changed", invoice_downloaded: "Invoice downloaded" };

export default function WorkspaceActivityPage() {
  const [page, setPage] = useState(1); const { data, isLoading } = useGetProfileActivityQuery({ page, limit: 15 });
  const activities = data?.data?.activities ?? []; const pagination = data?.data?.pagination;
  return <div className="mx-auto max-w-5xl space-y-7 pb-16"><PageHeader title="Activity log" description="A chronological record of your account and store actions."/><section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"><div className="border-b border-zinc-100 px-5 py-4"><h2 className="font-semibold text-zinc-950">Recent activity</h2><p className="mt-1 text-sm text-zinc-500">Security-sensitive events include device and IP details when available.</p></div><div className="p-4">{isLoading ? <ListSkeleton rows={7}/> : activities.length === 0 ? <EmptyState icon={Activity} title="No activity recorded" description="Your logins, security changes, and store actions will appear here."/> : <div className="relative space-y-1 before:absolute before:bottom-5 before:left-[21px] before:top-5 before:w-px before:bg-zinc-200">{activities.map((item) => { const Icon = icons[item.action] ?? Activity; return <div key={item.id} className="relative flex gap-4 rounded-2xl p-3 transition hover:bg-zinc-50"><div className="z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm"><Icon className="h-4 w-4"/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-zinc-900">{labels[item.action] ?? item.action.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}</p><time className="text-xs text-zinc-400" title={new Date(item.createdAt).toLocaleString()}>{timeAgo(item.createdAt)}</time></div><p className="mt-0.5 text-sm text-zinc-600">{item.description || `Activity in ${item.module}`}</p>{(item.browser || item.ipAddress || item.location) && <p className="mt-1 text-xs text-zinc-400">{[item.browser, item.device, item.ipAddress, item.location].filter(Boolean).join(" · ")}</p>}</div></div>; })}</div>}</div>{pagination && pagination.total > 0 && <div className="border-t border-zinc-100 px-5 pb-4"><Pagination page={pagination.page} totalPages={pagination.pages} total={pagination.total} pageSize={pagination.limit} onPageChange={setPage}/></div>}</section></div>;
}
