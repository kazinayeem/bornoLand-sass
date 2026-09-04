"use client";

import { useState } from "react";
import { Activity, Box, CreditCard, Download, KeyRound, LogIn, LogOut, RefreshCw, Store } from "lucide-react";
import { PageHeader } from "@/components/workspace/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { useGetProfileActivityQuery } from "@/redux/api/profile-api";
import { timeAgo } from "@/components/user/notification-ui";
import { useLanguage } from "@/providers/language-provider";

const icons: Record<string, typeof Activity> = {
  login: LogIn,
  logout: LogOut,
  password_changed: KeyRound,
  store_settings_updated: Store,
  store_branding_updated: Store,
  product_created: Box,
  order_status_changed: RefreshCw,
  plan_upgraded: CreditCard,
  plan_downgraded: CreditCard,
  invoice_downloaded: Download,
};

const labels: Record<string, string> = {
  login: "User Logged In",
  logout: "User Logged Out",
  password_changed: "Password Changed",
  store_settings_updated: "Store Settings Updated",
  store_branding_updated: "Branding Updated",
  product_created: "Product Created",
  order_status_changed: "Order Status Changed",
  plan_upgraded: "Plan Upgraded",
  plan_downgraded: "Plan Changed",
  invoice_downloaded: "Invoice Downloaded",
};

export default function WorkspaceActivityPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetProfileActivityQuery({ page, limit: 15 });
  const activities = data?.data?.activities ?? [];
  const pagination = data?.data?.pagination;

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-16">
      <PageHeader
        title={isBn ? "কার্যক্রম লগ" : "Activity Log"}
        description={isBn ? "আপনার অ্যাকাউন্ট এবং সব অনলাইন দোকানের সময়ানুক্রমিক আপডেট ও নিরাপত্তা তথ্য।" : "Chronological updates and security logs for your account and stores."}
      />
      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-4">
          <h2 className="font-semibold text-apple-ink">{isBn ? "সাম্প্রতিক কর্মকাণ্ড" : "Recent Activities"}</h2>
          <p className="mt-1 text-sm text-apple-ink-muted-48">
            {isBn ? "নিরাপত্তা সংক্রান্ত ইভেন্টে ডিভাইস ও আইপি ঠিকানা অন্তর্ভুক্ত থাকে।" : "Security events include device and IP address details."}
          </p>
        </div>
        <div className="p-4">
          {isLoading ? (
            <ListSkeleton rows={7} />
          ) : activities.length === 0 ? (
            <EmptyState
              icon={Activity}
              title={isBn ? "কোনো কার্যক্রম রেকর্ড হয়নি" : "No activity recorded"}
              description={isBn ? "আপনার লগইন, পাসওয়ার্ড পরিবর্তন এবং দোকানের কার্যক্রমসমূহ এখানে দেখা যাবে।" : "Logins, password changes, and store updates will appear here."}
            />
          ) : (
            <div className="relative space-y-1 before:absolute before:bottom-5 before:left-[21px] before:top-5 before:w-px before:bg-zinc-200">
              {activities.map((item) => {
                const Icon = icons[item.action] ?? Activity;
                const labelObj = labels[item.action];
                const actionLabel = labelObj
                  ? labelObj
                  : item.action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

                return (
                  <div
                    key={item.id}
                    className="relative flex gap-4 rounded-2xl p-3 transition hover:bg-apple-canvas-parchment"
                  >
                    <div className="z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-apple-ink-muted-80 shadow-sm">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-apple-ink">{actionLabel}</p>
                        <time
                          className="text-xs text-apple-ink-muted-48"
                          title={new Date(item.createdAt).toLocaleString()}
                        >
                          {timeAgo(item.createdAt)}
                        </time>
                      </div>
                      <p className="mt-0.5 text-sm text-apple-ink-muted-80">
                        {item.description || (isBn ? `${item.module} মডিউলে কার্যক্রম` : `Activity in ${item.module}`)}
                      </p>
                      {(item.browser || item.ipAddress || item.location) && (
                        <p className="mt-1 text-xs text-apple-ink-muted-48">
                          {[item.browser, item.device, item.ipAddress, item.location].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {pagination && pagination.total > 0 && (
          <div className="border-t border-zinc-100 px-5 pb-4">
            <Pagination
              page={pagination.page}
              totalPages={pagination.pages}
              total={pagination.total}
              pageSize={pagination.limit}
              onPageChange={setPage}
            />
          </div>
        )}
      </section>
    </div>
  );
}
