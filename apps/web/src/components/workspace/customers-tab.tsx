"use client";

import { useMemo, useState } from "react";
import {
  useGetStoreCustomersQuery,
  useGetStoreCustomerQuery,
  type CustomerOrder,
  type StoreCustomer,
} from "@/redux/api/store-customers-api";
import { useGetStoreSettingsQuery } from "@/redux/api/store-settings-api";
import { Users, Mail, Phone, Calendar, ShoppingBag, FileText } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { DataTable, type Column } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/format-currency";
import { downloadStoreOrderInvoice } from "@/lib/order-invoice";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";

type CustomersTabProps = { storeId: string };

type ProfileTab = "overview" | "orders" | "invoices" | "addresses" | "wishlist" | "activity" | "notes" | "analytics";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CustomersTab({ storeId }: CustomersTabProps) {
  const { language } = useLanguage();
  const isBn = false;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profileTab, setProfileTab] = useState<ProfileTab>("overview");

  const { data: settingsData } = useGetStoreSettingsQuery(storeId);
  const settings = settingsData?.data?.settings;

  const { data, isLoading } = useGetStoreCustomersQuery({
    storeId,
    page: String(page),
    limit: "20",
    search: search || undefined,
  });

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

  const money = (v: number) => formatCurrency(v || 0, settings);

  const columns: Column<StoreCustomer>[] = useMemo(
    () => [
      {
        key: "customer",
        label: isBn ? "গ্রাহক" : "Customer",
        render: (c) => (
          <div className="flex items-center gap-3">
            {c.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.avatar} alt="" className="h-9 w-9 rounded-xl object-cover" />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-apple-primary text-xs font-bold text-white">
                {(c.name || "?").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-apple-ink">{c.name}</p>
              <p className="text-xs text-apple-ink-muted-48">{c.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: "status",
        label: isBn ? "স্ট্যাটাস" : "Status",
        hideOnTablet: true,
        render: (c) => (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              c.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500",
            )}
          >
            {c.status === "active" ? (isBn ? "সক্রিয়" : "Active") : (isBn ? "অসক্রিয়" : "Inactive")}
          </span>
        ),
      },
      {
        key: "orders",
        label: isBn ? "অর্ডার" : "Orders",
        sortable: true,
        render: (c) => (
          <div className="text-sm">
            <p className="font-medium text-apple-ink">{c.totalOrders}</p>
            <p className="text-[10px] text-apple-ink-muted-48">
              {isBn ? `${c.completedOrders ?? 0}টি সম্পন্ন · ${c.cancelledOrders ?? 0}টি বাতিল` : `${c.completedOrders ?? 0} done · ${c.cancelledOrders ?? 0} cancelled`}
            </p>
          </div>
        ),
      },
      {
        key: "spent",
        label: isBn ? "মোট খরচ" : "Total Spent",
        sortable: true,
        render: (c) => <span className="text-sm font-bold text-apple-ink">{money(c.totalSpent)}</span>,
      },
      {
        key: "aov",
        label: isBn ? "গড় অর্ডার মূল্য" : "AOV",
        hideOnMobile: true,
        render: (c) => <span className="text-sm text-apple-ink-muted-80">{money(c.averageOrderValue)}</span>,
      },
      {
        key: "lastOrderDate",
        label: isBn ? "সর্বশেষ অর্ডার" : "Last Order",
        hideOnMobile: true,
        render: (c) => (
          <span className="text-sm text-apple-ink-muted-48">
            {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : "—"}
          </span>
        ),
      },
      {
        key: "createdAt",
        label: isBn ? "যোগদানের তারিখ" : "Joined",
        hideOnTablet: true,
        render: (c) => (
          <span className="text-sm text-apple-ink-muted-48">
            {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
          </span>
        ),
      },
      {
        key: "phone",
        label: isBn ? "ফোন" : "Phone",
        hideOnMobile: true,
        render: (c) => <span className="text-sm text-apple-ink-muted-48">{c.phone || "—"}</span>,
      },
    ],
    [settings],
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-apple-ink-muted-48">
          {total} customer{total !== 1 ? "s" : ""}
        </p>
      </div>

      <DataTable
        data={customers}
        columns={columns}
        keyExtractor={(c) => c._id}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search customers..."
        emptyIcon={Users}
        emptyTitle="No customers yet"
        emptyDescription="Customers will appear here when they register or place an order."
        onRowClick={(c) => {
          setSelectedId(c._id);
          setProfileTab("overview");
        }}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={20}
        onPageChange={setPage}
      />

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
              {selectedCust.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedCust.avatar} alt="" className="h-12 w-12 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-apple-primary text-sm font-bold text-white">
                  {(selectedCust.name || "?").slice(0, 2).toUpperCase()}
                </div>
              )}
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
                    "rounded-full px-3 py-1.5 text-[12px] font-medium whitespace-nowrap",
                    profileTab === tab.id
                      ? "bg-apple-primary text-white"
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
