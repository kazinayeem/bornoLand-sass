"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { AnalyticsTab } from "@/components/workspace/analytics-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { VisitorsAnalyticsPanel } from "@/components/store-dashboard/visitors-analytics-panel";
import { Loader2, BarChart3, Eye, TrendingUp, Package, Users, Globe, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const ANALYTICS_TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "visitors", label: "Visitors", icon: Eye },
  { id: "sales", label: "Sales", icon: TrendingUp },
  { id: "products", label: "Products", icon: Package },
  { id: "customers", label: "Customers", icon: Users },
  { id: "sources", label: "Traffic", icon: Globe },
  { id: "live", label: "Live", icon: Activity },
];

export default function StoreAnalyticsPage() {
  const { storeId, isLoading } = useStorePage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab") || "overview";

  if (isLoading || !storeId) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }

  const setTab = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <StorePageCard>
      {/* Sub-tab bar */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-1">
        {ANALYTICS_TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all",
              tab === t.id ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800"
            )}>
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <AnalyticsTab storeId={storeId} />}
      {tab === "visitors" && <VisitorsAnalyticsPanel storeId={storeId} />}
      {tab === "sales" && <AnalyticsTab storeId={storeId} />}
      {tab === "products" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <Package className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
          <p className="text-sm text-zinc-500">Product analytics — coming soon</p>
        </div>
      )}
      {tab === "customers" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <Users className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
          <p className="text-sm text-zinc-500">Customer analytics — coming soon</p>
        </div>
      )}
      {tab === "sources" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <Globe className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
          <p className="text-sm text-zinc-500">Traffic sources — coming soon</p>
        </div>
      )}
      {tab === "live" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <Activity className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
          <p className="text-sm text-zinc-500">Live visitors — coming soon</p>
        </div>
      )}
    </StorePageCard>
  );
}
