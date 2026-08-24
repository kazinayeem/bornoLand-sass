"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Activity,
  RefreshCw,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useGetAdminTrackingOverviewQuery } from "@/redux/api/tracking-api";

const PLAN_BADGE_COLORS: Record<string, string> = {
  free: "bg-zinc-100 text-zinc-700 border-zinc-200",
  starter: "bg-blue-50 text-blue-700 border-blue-200",
  business: "bg-emerald-50 text-emerald-700 border-emerald-200",
  enterprise: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function AdminTrackingOverviewPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  const { data, isLoading, refetch, isFetching } = useGetAdminTrackingOverviewQuery({
    search: searchTerm || undefined,
    plan: selectedPlan !== "all" ? selectedPlan : undefined,
    platform: selectedPlatform !== "all" ? selectedPlatform : undefined,
  });

  const overview = data?.data;

  const stats = overview?.stats ?? {
    totalStores: 0,
    totalWithTracking: 0,
    totalMetaActive: 0,
    totalTikTokActive: 0,
    adoptionRate: 0,
  };

  const planStats = overview?.planStats ?? [];
  const stores = overview?.stores ?? [];

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader
        title="Tracking & Pixels Overview"
        description="Monitor advertising pixel configurations, entitlements, and adoption across all stores on BornoLand."
        icon={Target}
        actions={
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      {/* ── High Level Stats Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Total Stores</span>
            <div className="h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-900">{stats.totalStores}</div>
          <p className="text-[11px] text-zinc-400 mt-1">Platform-wide stores</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-800">Tracked Stores</span>
            <div className="h-8 w-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-950">{stats.totalWithTracking}</div>
          <p className="text-[11px] text-blue-600 font-medium mt-1">Active pixel enabled</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-800">Meta Pixel</span>
            <div className="h-8 w-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-950">{stats.totalMetaActive}</div>
          <p className="text-[11px] text-indigo-600 font-medium mt-1">Active configurations</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800">TikTok Pixel</span>
            <div className="h-8 w-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-950">{stats.totalTikTokActive}</div>
          <p className="text-[11px] text-rose-600 font-medium mt-1">Active configurations</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
          className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Adoption Rate</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-950">{stats.adoptionRate}%</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Stores using pixels</p>
        </motion.div>
      </div>

      {/* ── Plan-wise Breakdown ─────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-900">Plan-wise Tracking Adoption</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {planStats.map((p) => {
            const percentage = p.totalStores > 0 ? Math.round((p.totalTracking / p.totalStores) * 100) : 0;
            return (
              <div
                key={p.planSlug}
                className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{p.planName}</span>
                    <span className="text-xs font-semibold text-zinc-700">{p.totalTracking} / {p.totalStores} stores</span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-zinc-400">Meta:</span>{" "}
                      <span className="font-semibold text-indigo-700">{p.metaActive}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">TikTok:</span>{" "}
                      <span className="font-semibold text-rose-700">{p.tiktokActive}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-[11px] text-zinc-500 mb-1 font-medium">
                    <span>Adoption</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Store Tracking Table & Filters ───────────────────────────── */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden">
        {/* Filters bar */}
        <div className="p-4 border-b border-zinc-100 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search store name or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Plans</option>
              {planStats.map((p) => (
                <option key={p.planSlug} value={p.planSlug}>
                  {p.planName}
                </option>
              ))}
            </select>

            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Platforms</option>
              <option value="meta">Meta Pixel Active</option>
              <option value="tiktok">TikTok Pixel Active</option>
              <option value="active">Any Pixel Active</option>
              <option value="inactive">No Pixel Active</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs">Loading tracking data...</span>
          </div>
        ) : stores.length === 0 ? (
          <div className="py-16 text-center text-zinc-500">
            <Target className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-700">No stores found</p>
            <p className="text-xs text-zinc-400 mt-0.5">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 text-zinc-500 font-semibold border-b border-zinc-100">
                <tr>
                  <th className="py-3 px-4">Store</th>
                  <th className="py-3 px-4">Plan & Entitlement</th>
                  <th className="py-3 px-4">Meta Pixel</th>
                  <th className="py-3 px-4">TikTok Pixel</th>
                  <th className="py-3 px-4">Tracking Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {stores.map((row) => {
                  const planClass = PLAN_BADGE_COLORS[row.planSlug] || "bg-zinc-100 text-zinc-700 border-zinc-200";

                  return (
                    <tr key={row._id} className="hover:bg-zinc-50/60 transition">
                      {/* Store */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-zinc-900">{row.storeName}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          {row.subdomain ? `${row.subdomain}.bornoland.com` : row.slug}
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${planClass}`}>
                            {row.planName}
                          </span>
                          <span className="text-[10px] text-zinc-400 capitalize">
                            Billing: {row.billingStatus}
                          </span>
                        </div>
                      </td>

                      {/* Meta Pixel */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {row.metaPixel.enabled ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                                Enabled
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-500">
                                Disabled
                              </span>
                            )}
                            {!row.metaPixel.allowedOnPlan && (
                              <span
                                title="Feature not entitled on current plan"
                                className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 font-medium"
                              >
                                <ShieldAlert className="w-3 h-3" /> Locked
                              </span>
                            )}
                          </div>
                          {row.metaPixel.pixelIdMasked ? (
                            <div className="font-mono text-[11px] text-zinc-600 bg-zinc-50 px-1.5 py-0.5 rounded w-fit">
                              ID: {row.metaPixel.pixelIdMasked}
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-400 italic">No ID set</span>
                          )}
                        </div>
                      </td>

                      {/* TikTok Pixel */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {row.tiktokPixel.enabled ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                                Enabled
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-500">
                                Disabled
                              </span>
                            )}
                            {!row.tiktokPixel.allowedOnPlan && (
                              <span
                                title="Feature not entitled on current plan"
                                className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 font-medium"
                              >
                                <ShieldAlert className="w-3 h-3" /> Locked
                              </span>
                            )}
                          </div>
                          {row.tiktokPixel.pixelIdMasked ? (
                            <div className="font-mono text-[11px] text-zinc-600 bg-zinc-50 px-1.5 py-0.5 rounded w-fit">
                              ID: {row.tiktokPixel.pixelIdMasked}
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-400 italic">No ID set</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {row.anyTrackingEnabled ? (
                          <div className="inline-flex items-center gap-1.5 text-emerald-700 font-medium text-xs bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active Tracking</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-zinc-400 font-medium text-xs bg-zinc-100 px-2.5 py-1 rounded-full">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>No Active Pixel</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <a
                          href={`/admin/dashboard/stores?search=${encodeURIComponent(row.slug)}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          <span>Manage</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
