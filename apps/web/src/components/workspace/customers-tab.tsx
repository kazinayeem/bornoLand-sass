"use client";

import { useState } from "react";
import { useGetStoreCustomersQuery, useGetStoreCustomerQuery } from "@/redux/api/store-customers-api";
import { Users, Mail, Phone, Calendar } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { DataTable, type Column } from "@/components/ui/data-table";

type CustomersTabProps = { storeId: string };

function formatBDT(v: number) {
  return new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(v || 0);
}

type CustomerRow = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  createdAt: string;
  status: string;
  lastLoginAt: string | null;
};

export function CustomersTab({ storeId }: CustomersTabProps) {
  const { data, isLoading } = useGetStoreCustomersQuery({ storeId, limit: "500" });
  const customers = data?.data?.customers ?? [];

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: detailData } = useGetStoreCustomerQuery(
    { storeId, customerId: selectedId ?? "" },
    { skip: !selectedId },
  );
  const selectedCust = detailData?.data?.customer ?? null;

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
  });

  const columns: Column<CustomerRow>[] = [
    {
      key: "customer", label: "Customer",
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-apple-primary text-xs font-bold text-white">
            {c.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-apple-ink">{c.name}</p>
            <p className="text-xs text-apple-ink-muted-48">{c.email || c.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status", label: "Status", hideOnTablet: true,
      render: (c) => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          c.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
        }`}>
          {c.status === "active" ? "Active" : c.status === "suspended" ? "Suspended" : "Inactive"}
        </span>
      ),
    },
    {
      key: "orders", label: "Orders", sortable: true,
      render: (c) => <span className="text-sm font-medium text-apple-ink">{c.totalOrders}</span>,
    },
    {
      key: "spent", label: "Total Spent", sortable: true,
      render: (c) => <span className="text-sm font-bold text-apple-ink">{formatBDT(c.totalSpent)}</span>,
    },
    {
      key: "lastOrderDate", label: "Last Order",
      render: (c) => <span className="text-sm text-apple-ink-muted-48">{c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : "—"}</span>,
      hideOnMobile: true,
    },
    {
      key: "createdAt", label: "Registered",
      render: (c) => <span className="text-sm text-apple-ink-muted-48">{new Date(c.createdAt).toLocaleDateString()}</span>,
      hideOnTablet: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-apple-ink-muted-48">{data?.data?.total ?? customers.length} customer{(data?.data?.total ?? customers.length) !== 1 ? "s" : ""}</p>
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
        emptyTitle="No customers yet"
        emptyDescription="Customers will appear here when they register or place an order."
        onRowClick={(c) => setSelectedId(c._id)}
      />

      <Drawer
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        title={selectedCust?.name}
        description="Customer details"
        size="md"
      >
        {selectedCust && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-apple-hairline p-4">
                <p className="text-xs font-semibold text-apple-ink-muted-48 uppercase">Total Orders</p>
                <p className="text-2xl font-bold text-apple-ink mt-1">{selectedCust.totalOrders}</p>
              </div>
              <div className="rounded-xl border border-apple-hairline p-4">
                <p className="text-xs font-semibold text-apple-ink-muted-48 uppercase">Total Spent</p>
                <p className="text-2xl font-bold text-apple-ink mt-1">{formatBDT(selectedCust.totalSpent)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-apple-ink">Contact Info</h4>
              <div className="rounded-xl border border-apple-hairline divide-y divide-zinc-100">
                {selectedCust.email && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Mail className="h-4 w-4 text-apple-ink-muted-48" />
                    <span className="text-sm text-apple-ink-muted-80">{selectedCust.email}</span>
                  </div>
                )}
                {selectedCust.phone && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Phone className="h-4 w-4 text-apple-ink-muted-48" />
                    <span className="text-sm text-apple-ink-muted-80">{selectedCust.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 px-4 py-3">
                  <Calendar className="h-4 w-4 text-apple-ink-muted-48" />
                  <span className="text-sm text-apple-ink-muted-80">Registered: {new Date(selectedCust.createdAt).toLocaleDateString()}</span>
                </div>
                {selectedCust.lastLoginAt && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Calendar className="h-4 w-4 text-apple-ink-muted-48" />
                    <span className="text-sm text-apple-ink-muted-80">Last login: {new Date(selectedCust.lastLoginAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {detailData?.data?.orders && detailData.data.orders.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-apple-ink">Order History</h4>
                <div className="space-y-2">
                  {(detailData.data.orders as Array<{ _id: string; orderNumber: string; total: number; status: string; createdAt: string }>).slice(0, 5).map((o) => (
                    <div key={o._id} className="flex items-center justify-between rounded-xl bg-apple-canvas-parchment px-4 py-2.5">
                      <div>
                        <p className="text-xs font-mono font-semibold text-blue-600">{o.orderNumber}</p>
                        <p className="text-xs text-apple-ink-muted-48">{new Date(o.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-apple-ink">{formatBDT(o.total)}</p>
                        <span className={`text-[10px] font-medium ${o.status === "delivered" ? "text-emerald-600" : o.status === "cancelled" ? "text-red-500" : "text-amber-600"}`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedCust.addresses && (selectedCust.addresses as Array<{ _id: string; label: string; city: string; street: string }>).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-apple-ink">Addresses</h4>
                <div className="space-y-2">
                  {(selectedCust.addresses as Array<{ _id: string; label: string; street: string; city: string; state: string; zip: string; country: string }>).map((addr) => (
                    <div key={addr._id} className="rounded-xl border border-apple-hairline px-4 py-3">
                      <p className="text-xs font-semibold text-apple-ink-muted-48">{addr.label}</p>
                      <p className="text-sm text-apple-ink">{addr.street}, {addr.city}, {addr.state} {addr.zip}, {addr.country}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
