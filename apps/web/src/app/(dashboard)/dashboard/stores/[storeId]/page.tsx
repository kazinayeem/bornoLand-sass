"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useGetStoreQuery, useDeleteStoreMutation } from "@/redux/api/store-api";
import { useDispatch } from "react-redux";
import { setCurrentStore } from "@/redux/slices/current-store-slice";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Store, AlertTriangle, Trash2, Menu, Construction } from "lucide-react";
import Link from "next/link";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { StoreNavSidebar } from "@/components/workspace/store-nav-sidebar";
import { Drawer } from "@/components/ui/drawer";
import { OverviewTab } from "@/components/workspace/overview-tab";
import { ProductsTab } from "@/components/workspace/products-tab";
import { CategoriesTab } from "@/components/workspace/categories-tab";
import { OrdersTab } from "@/components/workspace/orders-tab";
import { ThemeTab } from "@/components/workspace/theme-tab";
import { CmsTab } from "@/components/workspace/cms-tab";
import { SettingsTab } from "@/components/workspace/settings-tab";
import { PaymentsTab } from "@/components/workspace/payments-tab";
import { DeliveryTab } from "@/components/workspace/delivery-tab";
import { CheckoutTab } from "@/components/workspace/checkout-tab";
import { AnalyticsTab } from "@/components/workspace/analytics-tab";
import { CustomersTab } from "@/components/workspace/customers-tab";
import { tabLabelMap, type WorkspaceTabId } from "@/components/workspace/types";

function PlaceholderTab({ tabId }: { tabId: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Construction className="mb-3 h-10 w-10 text-zinc-300" />
      <h3 className="text-base font-semibold text-zinc-700">{tabLabelMap[tabId] ?? tabId}</h3>
      <p className="mt-1 text-sm text-zinc-400">This section is coming soon.</p>
    </div>
  );
}

export default function StoreWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;

  const { data, isLoading } = useGetStoreQuery(storeId);
  const [deleteStore] = useDeleteStoreMutation();

  const [activeTab, setActiveTab] = useState<WorkspaceTabId>("overview");
  const [showDelete, setShowDelete] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [showNav, setShowNav] = useState(false);

  const store = data?.data?.store;
  const dispatch = useDispatch();

  useEffect(() => {
    if (store) {
      dispatch(setCurrentStore({ storeId: store._id, storeName: store.name, storeSlug: store.slug }));
    }
  }, [store, dispatch]);

  const handleDelete = async () => {
    try {
      await deleteStore(storeId).unwrap();
      toast.success("Store deleted");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to delete store");
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
      case "activity":
      case "reports":
        return <OverviewTab storeId={storeId} store={store!} />;
      case "products":
        return <ProductsTab storeId={storeId} />;
      case "categories":
      case "brands":
      case "collections":
      case "inventory":
        return <CategoriesTab storeId={storeId} />;
      case "orders":
      case "draft-orders":
      case "returns":
      case "abandoned-carts":
        return <OrdersTab storeId={storeId} />;
      case "customers":
      case "customer-groups":
        return <CustomersTab storeId={storeId} />;
      case "payments":
      case "transactions":
      case "payouts":
        return <PaymentsTab storeId={storeId} />;
      case "delivery":
      case "shipping-methods":
      case "tracking":
        return <DeliveryTab storeId={storeId} />;
      case "builder":
        return (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-16 text-center">
            <p className="text-sm text-zinc-500 mb-4">Full page builder experience</p>
            <button
              onClick={() => router.push(`/dashboard/builder/${storeId}`)}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors"
            >
              Open Builder
            </button>
          </div>
        );
      case "theme":
        return <ThemeTab storeId={storeId} />;
      case "cms":
      case "faq":
      case "shipping-policy":
      case "return-policy":
      case "privacy-policy":
      case "terms":
      case "about":
      case "contact-page":
      case "size-guide":
        return <CmsTab storeId={storeId} />;
      case "analytics":
      case "analytics-sales":
      case "analytics-revenue":
      case "analytics-products":
      case "analytics-customers":
        return <AnalyticsTab storeId={storeId} />;
      case "settings":
      case "store-info":
      case "domain":
      case "currency":
      case "taxes":
      case "languages":
      case "notifications":
      case "staff":
      case "security":
      case "api-keys":
        return <SettingsTab storeId={storeId} />;
      default:
        return <PlaceholderTab tabId={activeTab} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-16 text-center">
        <Store className="mx-auto h-12 w-12 text-zinc-300" />
        <h3 className="mt-4 text-lg font-semibold text-zinc-700">Store not found</h3>
        <Link href="/dashboard" className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Mobile menu trigger */}
      <div className="flex items-center gap-3 lg:hidden">
        <button onClick={() => setShowNav(true)} className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm">
          <Menu className="h-4 w-4" /> Menu
        </button>
        <p className="truncate text-sm text-zinc-500">{store.name}</p>
      </div>

      <WorkspaceHeader store={store} onSettings={() => setActiveTab("settings")} onBuilder={() => router.push(`/dashboard/builder/${storeId}`)} />

      {/* Stat cards for overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Revenue", value: "BDT 0", change: "+0%" },
            { label: "Orders", value: "0", change: "+0%" },
            { label: "Products", value: String(store.productCount ?? 0), change: "" },
            { label: "Customers", value: "0", change: "+0%" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-xs font-medium text-zinc-500">{stat.label}</p>
              <p className="mt-1 text-xl font-bold text-zinc-900">{stat.value}</p>
              {stat.change && <p className="mt-0.5 text-xs text-emerald-600">{stat.change}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
        {/* Desktop sidebar */}
        <div className="hidden lg:block lg:sticky lg:top-6 lg:h-[calc(100vh-1.5rem)]">
          <div className="h-full overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
            <StoreNavSidebar
              store={store}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onSettings={() => setActiveTab("settings")}
              onDeleteRequest={() => setShowDelete(true)}
              onOpenBuilder={() => router.push(`/dashboard/builder/${storeId}`)}
            />
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="min-w-0"
        >
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-6">
            {renderTab()}
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowDelete(false); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">Delete Store</h3>
                  <p className="text-sm text-zinc-500">This cannot be undone.</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-zinc-50 p-3">
                <p className="text-sm font-medium text-zinc-700">{store.name}</p>
                <p className="text-xs text-zinc-400">{store.subdomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "bornosoftnr.site"}</p>
              </div>
              <p className="mt-4 text-sm text-zinc-600">
                Type <span className="font-semibold text-red-600">{store.name}</span> to confirm:
              </p>
              <input type="text" value={confirmName} onChange={(e) => setConfirmName(e.target.value)}
                placeholder={store.name}
                className="mt-2 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/20" />
              <div className="mt-6 flex items-center justify-end gap-3">
                <button onClick={() => setShowDelete(false)}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">Cancel</button>
                <button onClick={handleDelete} disabled={confirmName !== store.name}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <Drawer open={showNav} onClose={() => setShowNav(false)} title={store.name} description="Store navigation" side="left" size="full">
        <div className="h-full overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
          <StoreNavSidebar
            store={store}
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setShowNav(false);
            }}
            onSettings={() => {
              setActiveTab("settings");
              setShowNav(false);
            }}
            onDeleteRequest={() => {
              setShowDelete(true);
              setShowNav(false);
            }}
            onOpenBuilder={() => router.push(`/dashboard/builder/${storeId}`)}
          />
        </div>
      </Drawer>
    </div>
  );
}
