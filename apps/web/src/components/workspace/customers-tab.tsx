"use client";

import { useMemo, useState, useCallback, memo } from "react";
import {
  useGetStoreCustomersQuery,
  useLazyGetStoreCustomersQuery,
  useGetStoreCustomerQuery,
  type CustomerOrder,
  type StoreCustomer,
} from "@/redux/api/store-customers-api";
import { useGetStoreSettingsQuery } from "@/redux/api/store-settings-api";
import { useGetStoreQuery } from "@/redux/api/store-api";
import { getStoreLogoUrl } from "@/lib/store-branding";
import { printCustomerPdfReport } from "@/lib/customers/customer-report-pdf";
import { Users, Mail, Phone, Calendar, ShoppingBag, FileText, RotateCcw } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { DataTable, type Column, type SortConfig, openReportWindow } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/format-currency";
import { downloadStoreOrderInvoice } from "@/lib/order-invoice";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type CustomersTabProps = { storeId: string };

type ProfileTab = "overview" | "orders" | "invoices" | "addresses" | "wishlist" | "activity" | "notes" | "analytics";

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return value || "—";
  }
}

const AVATAR_PALETTES = [
  "bg-blue-600 text-white",
  "bg-emerald-600 text-white",
  "bg-indigo-600 text-white",
  "bg-purple-600 text-white",
  "bg-teal-600 text-white",
  "bg-rose-600 text-white",
  "bg-amber-600 text-white",
  "bg-slate-700 text-white",
];

function getDeterministicInitials(name?: string, email?: string): string {
  const cleanName = (name || "").trim();
  if (cleanName) {
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  }
  const cleanEmail = (email || "").trim();
  if (cleanEmail) {
    return cleanEmail.slice(0, 2).toUpperCase();
  }
  return "CU";
}

function getDeterministicColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index]!;
}

type CustomerAvatarProps = {
  avatar?: string | null;
  name?: string;
  email?: string;
  id: string;
  size?: "md" | "lg";
};

const CustomerAvatar = memo(function CustomerAvatar({
  avatar,
  name,
  email,
  id,
  size = "md",
}: CustomerAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const initials = useMemo(() => getDeterministicInitials(name, email), [name, email]);
  const colorClass = useMemo(() => getDeterministicColor(id || name || email || "seed"), [id, name, email]);

  const sizeClasses = size === "lg" ? "h-12 w-12 rounded-2xl text-sm" : "h-9 w-9 rounded-xl text-xs";

  if (avatar && !hasError) {
    return (
      <div className={cn("relative shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800", sizeClasses)}>
        <img
          src={avatar}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center font-bold select-none",
        sizeClasses,
        colorClass
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
});

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const escape = (value: string) => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };
  const lines = [headers.join(","), ...rows.map((row) => row.map(escape).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function CustomersTab({ storeId }: CustomersTabProps) {
  const isBn = false;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profileTab, setProfileTab] = useState<ProfileTab>("overview");
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>(undefined);
  const [exportBusy, setExportBusy] = useState(false);

  const { data: settingsData } = useGetStoreSettingsQuery(storeId);
  const settings = settingsData?.data?.settings;

  const { data: storeData } = useGetStoreQuery(storeId);
  const store = storeData?.data?.store;
  const storeName = store?.name || "Bornoland Store";
  const storeLogoUrl = getStoreLogoUrl(store);

  const { data, isLoading, isFetching, isError, refetch } = useGetStoreCustomersQuery({
    storeId,
    page: String(page),
    limit: "20",
    search: search || undefined,
  });

  const [fetchCustomersForExport] = useLazyGetStoreCustomersQuery();

  const { data: detailData, isFetching: detailLoading } = useGetStoreCustomerQuery(
    { storeId, customerId: selectedId ?? "" },
    { skip: !selectedId },
  );

  const customers = data?.data?.customers ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const total = data?.data?.total ?? 0;
  const selectedCust = detailData?.data?.customer ?? null;
  const orders = (detailData?.data?.orders ?? []) as CustomerOrder[];
  const wishlist = detailData?.data?.wishlist ?? [];
  const activity = detailData?.data?.activity ?? [];
  const analytics = detailData?.data?.analytics;

  const money = useCallback((v: number) => formatCurrency(v || 0, settings), [settings]);

  // Client-side sorting for active page
  const sortedCustomers = useMemo(() => {
    if (!sortConfig) return customers;
    const { key, order } = sortConfig;
    const factor = order === "asc" ? 1 : -1;

    return [...customers].sort((a, b) => {
      if (key === "customer") {
        return (a.name || "").localeCompare(b.name || "") * factor;
      }
      if (key === "orders") {
        return ((a.totalOrders || 0) - (b.totalOrders || 0)) * factor;
      }
      if (key === "spent") {
        return ((a.totalSpent || 0) - (b.totalSpent || 0)) * factor;
      }
      if (key === "aov") {
        return ((a.averageOrderValue || 0) - (b.averageOrderValue || 0)) * factor;
      }
      if (key === "lastOrderDate") {
        const timeA = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
        const timeB = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
        return (timeA - timeB) * factor;
      }
      if (key === "createdAt") {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return (timeA - timeB) * factor;
      }
      return 0;
    });
  }, [customers, sortConfig]);

  const columns: Column<StoreCustomer>[] = useMemo(
    () => [
      {
        key: "customer",
        label: isBn ? "গ্রাহক" : "Customer",
        sortable: true,
        render: (c) => (
          <div className="flex items-center gap-3 min-w-0">
            <CustomerAvatar id={c._id} avatar={c.avatar} name={c.name} email={c.email} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[180px]">
                {c.name || "Guest Customer"}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[200px]">
                {c.email || "—"}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "status",
        label: isBn ? "স্ট্যাটাস" : "Status",
        hideOnTablet: true,
        render: (c) => {
          const isActive = (c.status || "active").toLowerCase() === "active";
          return (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                isActive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              )}
            >
              {isActive ? (isBn ? "সক্রিয়" : "Active") : (isBn ? "অসক্রিয়" : "Inactive")}
            </span>
          );
        },
      },
      {
        key: "orders",
        label: isBn ? "অর্ডার" : "Orders",
        sortable: true,
        render: (c) => (
          <div className="text-sm">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{c.totalOrders ?? 0}</p>
            <p className="text-[11px] text-zinc-400">
              {isBn
                ? `${c.completedOrders ?? 0}টি সম্পন্ন · ${c.cancelledOrders ?? 0}টি বাতিল`
                : `${c.completedOrders ?? 0} done · ${c.cancelledOrders ?? 0} cancelled`}
            </p>
          </div>
        ),
      },
      {
        key: "spent",
        label: isBn ? "মোট খরচ" : "Total Spent",
        sortable: true,
        render: (c) => (
          <span className="text-sm font-bold text-zinc-950 dark:text-white">
            {money(c.totalSpent || 0)}
          </span>
        ),
      },
      {
        key: "aov",
        label: isBn ? "গড় অর্ডার মূল্য" : "AOV",
        sortable: true,
        hideOnMobile: true,
        render: (c) => (
          <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
            {money(c.averageOrderValue || 0)}
          </span>
        ),
      },
      {
        key: "lastOrderDate",
        label: isBn ? "সর্বশেষ অর্ডার" : "Last Order",
        sortable: true,
        hideOnMobile: true,
        render: (c) => (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {formatDate(c.lastOrderDate)}
          </span>
        ),
      },
      {
        key: "createdAt",
        label: isBn ? "যোগদানের তারিখ" : "Joined",
        sortable: true,
        hideOnTablet: true,
        render: (c) => (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {formatDate(c.createdAt)}
          </span>
        ),
      },
      {
        key: "phone",
        label: isBn ? "ফোন" : "Phone",
        hideOnMobile: true,
        render: (c) => (
          <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
            {c.phone || "—"}
          </span>
        ),
      },
    ],
    [isBn, money]
  );

  const profileTabs: Array<{ id: ProfileTab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "Orders" },
    { id: "invoices", label: "Invoices" },
    { id: "addresses", label: "Addresses" },
    { id: "wishlist", label: "Wishlist" },
    { id: "activity", label: "Activity" },
    { id: "notes", label: "Notes" },
    { id: "analytics", label: "Analytics" },
  ];

  const loadAllCustomersForExport = useCallback(async (): Promise<StoreCustomer[]> => {
    const limit = Math.min(Math.max(total ?? 0, 100), 1000);
    const res = await fetchCustomersForExport({
      storeId,
      search: search || undefined,
      page: "1",
      limit: String(limit),
    }).unwrap();
    return res?.data?.customers ?? [];
  }, [total, fetchCustomersForExport, storeId, search]);

  const handleExportPdf = useCallback(async () => {
    if (exportBusy) return;
    const targetWin = openReportWindow("Generating Customers PDF Report...");
    setExportBusy(true);
    try {
      const allCustomers = await loadAllCustomersForExport();
      printCustomerPdfReport({
        storeName,
        storeLogoUrl,
        title: "Customer Directory Report",
        subtitle: search ? `Filtered by search "${search}"` : `Complete customer directory`,
        customers: allCustomers,
        currencySettings: settings,
        targetWindow: targetWin,
      });
      toast.success(`Generated PDF for ${allCustomers.length} customers`);
    } catch (err) {
      if (targetWin && !targetWin.closed) targetWin.close();
      toast.error(err instanceof Error ? err.message : "Failed to generate PDF report");
    } finally {
      setExportBusy(false);
    }
  }, [exportBusy, loadAllCustomersForExport, storeName, storeLogoUrl, search, settings]);

  const handleExportCsv = useCallback(async () => {
    if (exportBusy) return;
    setExportBusy(true);
    try {
      const allCustomers = await loadAllCustomersForExport();
      const headers = [
        "Customer",
        "Email",
        "Phone",
        "Status",
        "Total Orders",
        "Completed Orders",
        "Cancelled Orders",
        "Total Spent",
        "AOV",
        "Last Order Date",
        "Joined Date",
      ];
      const rows = allCustomers.map((c) => [
        c.name || "Guest Customer",
        c.email || "",
        c.phone || "",
        c.status || "active",
        String(c.totalOrders || 0),
        String(c.completedOrders || 0),
        String(c.cancelledOrders || 0),
        money(c.totalSpent || 0),
        money(c.averageOrderValue || 0),
        c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : "",
        c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "",
      ]);
      downloadCsv(`customers-report-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      toast.success(`Exported ${allCustomers.length} customers to CSV`);
    } catch {
      toast.error("Failed to export customers CSV");
    } finally {
      setExportBusy(false);
    }
  }, [exportBusy, loadAllCustomersForExport, money]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {total} customer{total !== 1 ? "s" : ""}
          </span>
          {search && (
            <span className="text-xs text-zinc-400">
              (matching &quot;{search}&quot;)
            </span>
          )}
        </div>
      </div>

      {isError ? (
        <ErrorState
          title="Unable to load customers"
          message="Check your network connection and try again."
          onRetry={refetch}
        />
      ) : customers.length === 0 && !isLoading ? (
        <EmptyState
          icon={Users}
          title={search ? "No customers found" : "No customers yet"}
          description={
            search
              ? `No customers match your search for "${search}".`
              : "Customers will appear here when they register or place an order."
          }
          action={
            search ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="cursor-pointer text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Clear Search
              </Button>
            ) : undefined
          }
        />
      ) : (
        <DataTable
          data={sortedCustomers}
          columns={columns}
          keyExtractor={(c) => c._id}
          isLoading={isLoading}
          isFetching={isFetching}
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search customers by name, email, phone..."
          sort={sortConfig}
          onSort={(sort) => setSortConfig(sort)}
          emptyIcon={Users}
          emptyTitle={search ? "No customers found" : "No customers yet"}
          emptyDescription={
            search
              ? `No customers match "${search}".`
              : "Customers will appear here when they register or place an order."
          }
          onRowClick={(c) => {
            setSelectedId(c._id);
            setProfileTab("overview");
          }}
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={20}
          onPageChange={setPage}
          onExportOverride={{
            csv: handleExportCsv,
            pdf: handleExportPdf,
          }}
        />
      )}

      <Drawer
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        title={selectedCust?.name ?? "Customer"}
        description="Customer profile"
        size="lg"
      >
        {detailLoading && !selectedCust ? (
          <p className="text-sm text-apple-ink-muted-48">Loading profile…</p>
        ) : selectedCust ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <CustomerAvatar
                id={selectedCust._id}
                avatar={selectedCust.avatar}
                name={selectedCust.name}
                email={selectedCust.email}
                size="lg"
              />
              <div>
                <p className="text-[15px] font-semibold text-apple-ink">{selectedCust.name}</p>
                <p className="text-[12px] text-apple-ink-muted-48">{selectedCust.email}</p>
              </div>
            </div>

            <div className="flex gap-1 overflow-x-auto">
              {profileTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setProfileTab(tab.id)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[12px] font-medium whitespace-nowrap cursor-pointer",
                    profileTab === tab.id
                      ? "bg-apple-primary text-white font-bold"
                      : "bg-apple-canvas-parchment text-apple-ink-muted-80",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {profileTab === "overview" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { label: "Total orders", value: String(selectedCust.totalOrders) },
                    { label: "Completed", value: String(selectedCust.completedOrders ?? 0) },
                    { label: "Cancelled", value: String(selectedCust.cancelledOrders ?? 0) },
                    { label: "Total spent", value: money(selectedCust.totalSpent) },
                    { label: "Avg order", value: money(selectedCust.averageOrderValue) },
                    { label: "Status", value: selectedCust.status },
                  ].map((card) => (
                    <div key={card.label} className="rounded-xl border border-apple-hairline p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-apple-ink-muted-48">
                        {card.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-apple-ink">{card.value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-apple-hairline divide-y divide-zinc-100">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Mail className="h-4 w-4 text-apple-ink-muted-48" />
                    <span className="text-sm">{selectedCust.email || "—"}</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Phone className="h-4 w-4 text-apple-ink-muted-48" />
                    <span className="text-sm">{selectedCust.phone || "—"}</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Calendar className="h-4 w-4 text-apple-ink-muted-48" />
                    <span className="text-sm">Registered: {formatDate(selectedCust.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Calendar className="h-4 w-4 text-apple-ink-muted-48" />
                    <span className="text-sm">Last login: {formatDate(selectedCust.lastLoginAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <ShoppingBag className="h-4 w-4 text-apple-ink-muted-48" />
                    <span className="text-sm">Last order: {formatDate(selectedCust.lastOrderDate)}</span>
                  </div>
                </div>
              </div>
            ) : null}

            {profileTab === "orders" || profileTab === "invoices" ? (
              <div className="space-y-2">
                {orders.length === 0 ? (
                  <p className="text-sm text-apple-ink-muted-48">No orders yet.</p>
                ) : (
                  orders.map((o) => (
                    <div
                      key={o._id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-apple-hairline px-4 py-3"
                    >
                      <div>
                        <p className="text-xs font-mono font-semibold text-apple-primary">{o.orderNumber}</p>
                        <p className="text-xs text-apple-ink-muted-48">{formatDate(o.createdAt)}</p>
                        <p className="text-[11px] capitalize text-apple-ink-muted-48">{o.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{money(o.total)}</p>
                        <button
                          type="button"
                          className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-apple-primary"
                          onClick={async () => {
                            try {
                              await downloadStoreOrderInvoice(storeId, o._id, o.orderNumber);
                            } catch {
                              toast.error("Could not download invoice");
                            }
                          }}
                        >
                          <FileText className="h-3 w-3" />
                          Invoice PDF
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : null}

            {profileTab === "addresses" ? (
              <div className="space-y-2">
                {(selectedCust.addresses ?? []).length === 0 ? (
                  <p className="text-sm text-apple-ink-muted-48">No saved addresses.</p>
                ) : (
                  (selectedCust.addresses ?? []).map((addr) => (
                    <div key={addr._id} className="rounded-xl border border-apple-hairline px-4 py-3">
                      <p className="text-xs font-semibold text-apple-ink-muted-48">{addr.label || "Address"}</p>
                      <p className="text-sm text-apple-ink">
                        {[addr.street, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            ) : null}

            {profileTab === "wishlist" ? (
              <div className="space-y-2">
                {wishlist.length === 0 ? (
                  <p className="text-sm text-apple-ink-muted-48">Wishlist is empty.</p>
                ) : (
                  wishlist.map((item, idx) => (
                    <div key={`${item.productId ?? idx}`} className="flex items-center justify-between rounded-xl border border-apple-hairline px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-apple-ink">{item.name || "Product"}</p>
                        <p className="text-xs text-apple-ink-muted-48">{money(item.price || 0)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : null}

            {profileTab === "activity" ? (
              <div className="space-y-2">
                {activity.length === 0 ? (
                  <p className="text-sm text-apple-ink-muted-48">No activity yet.</p>
                ) : (
                  activity.slice(0, 40).map((event, idx) => (
                    <div key={`${event.orderNumber}-${idx}`} className="rounded-xl border border-apple-hairline px-4 py-3">
                      <p className="text-sm font-medium text-apple-ink">
                        {event.orderNumber} · {event.status}
                      </p>
                      <p className="text-xs text-apple-ink-muted-48">
                        {formatDate(event.createdAt)}{event.note ? ` · ${event.note}` : ""}
                      </p>
                    </div>
                  ))
                )}
              </div>
            ) : null}

            {profileTab === "notes" ? (
              <div className="rounded-xl border border-apple-hairline p-4">
                <p className="text-sm text-apple-ink-muted-80 whitespace-pre-wrap">
                  {selectedCust.notes || "No notes."}
                </p>
              </div>
            ) : null}

            {profileTab === "analytics" ? (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total orders", value: String(analytics?.totalOrders ?? selectedCust.totalOrders) },
                  { label: "Completed", value: String(analytics?.completedOrders ?? selectedCust.completedOrders ?? 0) },
                  { label: "Cancelled", value: String(analytics?.cancelledOrders ?? selectedCust.cancelledOrders ?? 0) },
                  { label: "Total spent", value: money(analytics?.totalSpent ?? selectedCust.totalSpent) },
                  { label: "Avg order value", value: money(analytics?.averageOrderValue ?? selectedCust.averageOrderValue) },
                  { label: "Wishlist items", value: String(analytics?.wishlistCount ?? wishlist.length) },
                ].map((card) => (
                  <div key={card.label} className="rounded-xl border border-apple-hairline p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-apple-ink-muted-48">
                      {card.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-apple-ink">{card.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
