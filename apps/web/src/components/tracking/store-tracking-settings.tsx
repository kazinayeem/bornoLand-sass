"use client";

import { useState } from "react";
import {
  Target,
  Activity,
  Sparkles,
  Lock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Settings2,
  Play,
  RotateCw,
  HelpCircle,
  ExternalLink,
  Shield,
  Layers,
  Eye,
  Info,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetStoreTrackingQuery,
  useUpdateMetaPixelMutation,
  useUpdateTikTokPixelMutation,
  useTestPixelConnectionMutation,
  type PixelStatus,
} from "@/redux/api/tracking-api";

type Props = {
  storeId: string;
  storeSlug: string;
};

const STATUS_CONFIG: Record<PixelStatus, { label: string; badgeClass: string; icon: typeof CheckCircle2 }> = {
  active: {
    label: "Active & Tracking",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  connected: {
    label: "Connected",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    icon: CheckCircle2,
  },
  disabled: {
    label: "Disabled",
    badgeClass: "bg-zinc-100 text-zinc-600 border-zinc-200",
    icon: Clock,
  },
  invalid: {
    label: "Invalid Configuration",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    icon: AlertCircle,
  },
  not_configured: {
    label: "Not Connected",
    badgeClass: "bg-zinc-100 text-zinc-500 border-zinc-200",
    icon: HelpCircle,
  },
};

export function StoreTrackingSettingsComponent({ storeId, storeSlug }: Props) {
  const { data, isLoading, refetch, isFetching } = useGetStoreTrackingQuery(storeId);
  const [updateMeta, { isLoading: isSavingMeta }] = useUpdateMetaPixelMutation();
  const [updateTikTok, { isLoading: isSavingTikTok }] = useUpdateTikTokPixelMutation();
  const [testPixel, { isLoading: isTestingPixel }] = useTestPixelConnectionMutation();

  const [activeModal, setActiveModal] = useState<"meta" | "tiktok" | null>(null);
  const [testResult, setTestResult] = useState<{ platform: "meta" | "tiktok"; success: boolean; message: string } | null>(null);

  // Meta modal state
  const [metaPixelId, setMetaPixelId] = useState("");
  const [metaEnabled, setMetaEnabled] = useState(false);
  const [metaAutoEvents, setMetaAutoEvents] = useState(true);
  const [metaAdvancedMatching, setMetaAdvancedMatching] = useState(false);
  const [metaTestCode, setMetaTestCode] = useState("");
  const [metaError, setMetaError] = useState("");

  // TikTok modal state
  const [tiktokPixelId, setTiktokPixelId] = useState("");
  const [tiktokEnabled, setTiktokEnabled] = useState(false);
  const [tiktokAutoEvents, setTiktokAutoEvents] = useState(true);
  const [tiktokTestCode, setTiktokTestCode] = useState("");
  const [tiktokError, setTiktokError] = useState("");

  const trackingData = data?.data;
  const settings = trackingData?.settings;
  const entitlements = trackingData?.entitlements ?? {
    metaPixel: false,
    tiktokPixel: false,
    customTracking: false,
    googleAnalytics: false,
  };
  const lockDetails = trackingData?.lockDetails;
  const currentPlan = trackingData?.plan;

  const handleOpenMetaModal = () => {
    if (!settings) return;
    setMetaPixelId(settings.metaPixel?.pixelId || "");
    setMetaEnabled(settings.metaPixel?.enabled || false);
    setMetaAutoEvents(settings.metaPixel?.automaticEvents ?? true);
    setMetaAdvancedMatching(settings.metaPixel?.advancedMatching ?? false);
    setMetaTestCode(settings.metaPixel?.testEventCode || "");
    setMetaError("");
    setActiveModal("meta");
  };

  const handleOpenTikTokModal = () => {
    if (!settings) return;
    setTiktokPixelId(settings.tiktokPixel?.pixelId || "");
    setTiktokEnabled(settings.tiktokPixel?.enabled || false);
    setTiktokAutoEvents(settings.tiktokPixel?.automaticEvents ?? true);
    setTiktokTestCode(settings.tiktokPixel?.testEventCode || "");
    setTiktokError("");
    setActiveModal("tiktok");
  };

  const handleSaveMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setMetaError("");

    const trimmedId = metaPixelId.trim();
    if (trimmedId && !/^\d{8,25}$/.test(trimmedId)) {
      setMetaError("Meta Pixel ID must contain only digits (8 to 25 numbers).");
      return;
    }

    try {
      const res = await updateMeta({
        storeId,
        data: {
          pixelId: trimmedId,
          enabled: metaEnabled,
          automaticEvents: metaAutoEvents,
          advancedMatching: metaAdvancedMatching,
          testEventCode: metaTestCode.trim(),
        },
      }).unwrap();

      toast.success(res.message || "Meta Pixel settings saved successfully");
      setActiveModal(null);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to update Meta Pixel";
      setMetaError(msg);
      toast.error(msg);
    }
  };

  const handleSaveTikTok = async (e: React.FormEvent) => {
    e.preventDefault();
    setTiktokError("");

    const trimmedId = tiktokPixelId.trim();
    if (trimmedId && !/^[a-zA-Z0-9_-]{8,35}$/.test(trimmedId)) {
      setTiktokError("TikTok Pixel ID must be 8 to 35 alphanumeric characters.");
      return;
    }

    try {
      const res = await updateTikTok({
        storeId,
        data: {
          pixelId: trimmedId,
          enabled: tiktokEnabled,
          automaticEvents: tiktokAutoEvents,
          testEventCode: tiktokTestCode.trim(),
        },
      }).unwrap();

      toast.success(res.message || "TikTok Pixel settings saved successfully");
      setActiveModal(null);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to update TikTok Pixel";
      setTiktokError(msg);
      toast.error(msg);
    }
  };

  const handleTest = async (platform: "meta" | "tiktok") => {
    setTestResult(null);
    try {
      const res = await testPixel({ storeId, platform }).unwrap();
      setTestResult({
        platform,
        success: true,
        message: res.data.message || `${platform === "meta" ? "Meta" : "TikTok"} Pixel verified successfully.`,
      });
      toast.success(res.data.message);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || `Failed to verify ${platform} Pixel.`;
      setTestResult({
        platform,
        success: false,
        message: msg,
      });
      toast.error(msg);
    }
  };

  const billingHref = `/store/${storeSlug}/settings/billing`;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-12 text-center shadow-sm">
        <RotateCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
        <p className="text-xs text-zinc-500 font-medium">Loading tracking configuration...</p>
      </div>
    );
  }

  const metaConfig = settings?.metaPixel;
  const tiktokConfig = settings?.tiktokPixel;

  const metaStatus = metaConfig ? (STATUS_CONFIG[metaConfig.status] || STATUS_CONFIG.not_configured) : STATUS_CONFIG.not_configured;
  const tiktokStatus = tiktokConfig ? (STATUS_CONFIG[tiktokConfig.status] || STATUS_CONFIG.not_configured) : STATUS_CONFIG.not_configured;

  const isMetaLocked = !entitlements.metaPixel;
  const isTikTokLocked = !entitlements.tiktokPixel;

  return (
    <div className="space-y-6">
      {/* ── Top Header Section ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-200/80 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900">Tracking & Pixels</h2>
                <p className="text-xs text-zinc-500">
                  Connect your website with advertising and analytics platforms to measure visitors, conversions, campaigns, and customer actions.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-zinc-200 text-zinc-700 shadow-sm">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Plan: <span className="text-blue-700 uppercase">{currentPlan?.name || "Free"}</span>
            </span>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh status"
              className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 transition shadow-sm disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Test Feedback Banner ──────────────────────────────────────── */}
      {testResult && (
        <div
          className={`rounded-xl border p-4 flex items-start justify-between gap-3 ${
            testResult.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-semibold">
                {testResult.platform === "meta" ? "Meta Pixel" : "TikTok Pixel"} Verification Result
              </p>
              <p className="text-xs mt-0.5 opacity-90">{testResult.message}</p>
            </div>
          </div>
          <button
            onClick={() => setTestResult(null)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Pixel Platforms Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Meta Pixel Card ───────────────────────────────────────── */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                  f
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900">Meta Pixel</h3>
                    {metaConfig?.enabled && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">Facebook & Instagram Conversion Tracking</p>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${metaStatus.badgeClass}`}>
                <metaStatus.icon className="w-3.5 h-3.5" />
                {metaStatus.label}
              </span>
            </div>

            {/* Content Body / Locked State */}
            {isMetaLocked ? (
              <div className="mt-5 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-950">Feature Locked on Current Plan</h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Meta Pixel is available on the{" "}
                      <strong className="font-semibold">{lockDetails?.metaPixel?.requiredPlan?.name || "Starter"}</strong> plan
                      or higher.
                    </p>
                    <a
                      href={billingHref}
                      className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition shadow-sm"
                    >
                      <span>Upgrade Plan</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-400 font-medium block">Meta Pixel ID</span>
                    <span className="font-mono text-xs font-semibold text-zinc-800">
                      {metaConfig?.pixelId ? metaConfig.pixelId : "Not set"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-zinc-400 font-medium block">Automatic Tracking</span>
                    <span className={`text-xs font-semibold ${metaConfig?.automaticEvents ? "text-emerald-600" : "text-zinc-500"}`}>
                      {metaConfig?.automaticEvents ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-zinc-400" />
                    Advanced Matching: <strong>{metaConfig?.advancedMatching ? "On" : "Off"}</strong>
                  </span>
                  <span>•</span>
                  {metaConfig?.lastVerifiedAt ? (
                    <span className="text-zinc-500">
                      Verified: {new Date(metaConfig.lastVerifiedAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-zinc-400">Not verified yet</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {!isMetaLocked && (
            <div className="px-6 py-3.5 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleTest("meta")}
                disabled={isTestingPixel || !metaConfig?.pixelId}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition shadow-sm disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5 text-blue-600" />
                Test Connection
              </button>

              <button
                type="button"
                onClick={handleOpenMetaModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                <Settings2 className="w-3.5 h-3.5" />
                Configure Meta Pixel
              </button>
            </div>
          )}
        </div>

        {/* ── TikTok Pixel Card ──────────────────────────────────────── */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-base shadow-sm">
                  <Sparkles className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900">TikTok Pixel</h3>
                    {tiktokConfig?.enabled && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">TikTok Ads & Video Conversion Tracking</p>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${tiktokStatus.badgeClass}`}>
                <tiktokStatus.icon className="w-3.5 h-3.5" />
                {tiktokStatus.label}
              </span>
            </div>

            {/* Content Body / Locked State */}
            {isTikTokLocked ? (
              <div className="mt-5 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-950">Feature Locked on Current Plan</h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      TikTok Pixel is available on the{" "}
                      <strong className="font-semibold">{lockDetails?.tiktokPixel?.requiredPlan?.name || "Starter"}</strong> plan
                      or higher.
                    </p>
                    <a
                      href={billingHref}
                      className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition shadow-sm"
                    >
                      <span>Upgrade Plan</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-400 font-medium block">TikTok Pixel ID</span>
                    <span className="font-mono text-xs font-semibold text-zinc-800">
                      {tiktokConfig?.pixelId ? tiktokConfig.pixelId : "Not set"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-zinc-400 font-medium block">Automatic Tracking</span>
                    <span className={`text-xs font-semibold ${tiktokConfig?.automaticEvents ? "text-emerald-600" : "text-zinc-500"}`}>
                      {tiktokConfig?.automaticEvents ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-zinc-400" />
                    Events: <strong>PageView, AddToCart, Purchase, Checkout</strong>
                  </span>
                  <span>•</span>
                  {tiktokConfig?.lastVerifiedAt ? (
                    <span className="text-zinc-500">
                      Verified: {new Date(tiktokConfig.lastVerifiedAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-zinc-400">Not verified yet</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {!isTikTokLocked && (
            <div className="px-6 py-3.5 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleTest("tiktok")}
                disabled={isTestingPixel || !tiktokConfig?.pixelId}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition shadow-sm disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5 text-rose-600" />
                Test Connection
              </button>

              <button
                type="button"
                onClick={handleOpenTikTokModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition shadow-sm"
              >
                <Settings2 className="w-3.5 h-3.5" />
                Configure TikTok Pixel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Supported Events Guide ────────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-900 mb-1">Standard E-Commerce Events Supported</h3>
        <p className="text-xs text-zinc-500 mb-4">
          When automatic event tracking is enabled, BornoLand automatically reports the following customer interactions to your active pixels:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[
            { name: "PageView", desc: "Storefront page load" },
            { name: "ViewContent", desc: "Product details viewed" },
            { name: "Search", desc: "Customer searches products" },
            { name: "AddToCart", desc: "Product added to cart" },
            { name: "InitiateCheckout", desc: "Checkout begins" },
            { name: "AddPaymentInfo", desc: "Payment info submitted" },
            { name: "Purchase", desc: "Order successfully placed" },
            { name: "CompleteRegistration", desc: "Customer account created" },
          ].map((item) => (
            <div key={item.name} className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
              <div className="font-mono text-xs font-bold text-zinc-800">{item.name}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Internal Event Debug Log ──────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Recent Tracking Events (Debug Log)</h3>
            <p className="text-xs text-zinc-500">Live activity monitor for troubleshooting pixel event dispatching</p>
          </div>
          <span className="text-xs font-semibold text-zinc-500">
            {settings?.recentEvents?.length ?? 0} events recorded
          </span>
        </div>

        {(!settings?.recentEvents || settings.recentEvents.length === 0) ? (
          <div className="p-8 text-center text-zinc-400">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-medium">No tracking events recorded yet</p>
            <p className="text-[11px] mt-0.5">Events from storefront visitors will appear here for debugging</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 text-zinc-500 font-semibold border-b border-zinc-100">
                <tr>
                  <th className="py-2.5 px-4">Event</th>
                  <th className="py-2.5 px-4">Platform</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {settings.recentEvents.slice(0, 10).map((ev, i) => (
                  <tr key={ev.eventId || i} className="hover:bg-zinc-50/50">
                    <td className="py-2.5 px-4 font-mono font-medium text-zinc-900">{ev.eventName}</td>
                    <td className="py-2.5 px-4 uppercase font-semibold text-[10px] text-zinc-600">{ev.platform}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                          ev.status === "sent"
                            ? "bg-emerald-50 text-emerald-700"
                            : ev.status === "skipped"
                            ? "bg-zinc-100 text-zinc-600"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {ev.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-zinc-400">
                      {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Meta Pixel Configuration Modal ────────────────────────────── */}
      {activeModal === "meta" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  f
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Configure Meta Pixel</h3>
                  <p className="text-xs text-zinc-500">Facebook & Instagram advertising integration</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMeta} className="p-6 space-y-5">
              {metaError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{metaError}</span>
                </div>
              )}

              {/* Pixel ID */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Meta Pixel ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123456789012345"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Found in your Meta Events Manager / Business Suite under Data Sources.
                </p>
              </div>

              {/* Enable Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50">
                <div>
                  <div className="text-xs font-bold text-zinc-900">Enable Meta Pixel</div>
                  <div className="text-[11px] text-zinc-500">Allow Meta Pixel scripts to load on your storefront</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={metaEnabled}
                    onChange={(e) => setMetaEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>

              {/* Automatic Event Tracking */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50">
                <div>
                  <div className="text-xs font-bold text-zinc-900">Automatic Event Tracking</div>
                  <div className="text-[11px] text-zinc-500">
                    Automatically track page views, product views, add-to-cart, checkout, and purchases.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={metaAutoEvents}
                    onChange={(e) => setMetaAutoEvents(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>

              {/* Advanced Matching */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50">
                <div>
                  <div className="text-xs font-bold text-zinc-900">Advanced Matching</div>
                  <div className="text-[11px] text-zinc-500">
                    Send hashed customer data (email/phone) at checkout to improve conversion attribution.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={metaAdvancedMatching}
                    onChange={(e) => setMetaAdvancedMatching(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>

              {/* Test Event Code */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Test Event Code <span className="text-zinc-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. TEST12345"
                  value={metaTestCode}
                  onChange={(e) => setMetaTestCode(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Use this to test events inside Meta Events Manager &quot;Test Events&quot; tab.
                </p>
              </div>

              {/* Footer CTA */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingMeta}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {isSavingMeta ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Save Configuration
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TikTok Pixel Configuration Modal ───────────────────────────── */}
      {activeModal === "tiktok" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Configure TikTok Pixel</h3>
                  <p className="text-xs text-zinc-500">TikTok advertising & conversion measurement</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTikTok} className="p-6 space-y-5">
              {tiktokError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{tiktokError}</span>
                </div>
              )}

              {/* Pixel ID */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  TikTok Pixel ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. C52ABCD1234EFG"
                  value={tiktokPixelId}
                  onChange={(e) => setTiktokPixelId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Found in your TikTok Ads Manager under Assets → Events → Web Events.
                </p>
              </div>

              {/* Enable Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50">
                <div>
                  <div className="text-xs font-bold text-zinc-900">Enable TikTok Pixel</div>
                  <div className="text-[11px] text-zinc-500">Allow TikTok Pixel scripts to load on your storefront</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tiktokEnabled}
                    onChange={(e) => setTiktokEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900" />
                </label>
              </div>

              {/* Automatic Event Tracking */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50">
                <div>
                  <div className="text-xs font-bold text-zinc-900">Automatic Event Tracking</div>
                  <div className="text-[11px] text-zinc-500">
                    Automatically track page views, product views, add-to-cart, and orders.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tiktokAutoEvents}
                    onChange={(e) => setTiktokAutoEvents(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900" />
                </label>
              </div>

              {/* Test Event Code */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Test Event Code <span className="text-zinc-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. TEST12345"
                  value={tiktokTestCode}
                  onChange={(e) => setTiktokTestCode(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Use this to test events inside TikTok Events Manager &quot;Test Events&quot; tab.
                </p>
              </div>

              {/* Footer CTA */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTikTok}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {isSavingTikTok ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Save Configuration
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
