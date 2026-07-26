"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Drawer } from "@/components/ui/drawer";
import { SaveIndicator } from "@/components/ui/save-indicator";
import { LoadingButton } from "@/components/ui/loading-button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  useGetAdminStoreSettingsQuery,
  useGetAdminStoreStatsQuery,
  useGetAdminStoreMediaQuery,
  useSaveStoreOverridesMutation,
  useChangeStorePlanEnhancedMutation,
  useManageStoreTrialMutation,
  useManageStoreSubscriptionMutation,
  useResetStoreMutation,
  useRecalculateStoreMutation,
  useDeleteAdminStoreCascadeMutation,
  useManageStoreStaffMutation,
  useSyncStoreSubscriptionMutation,
  type AdminStore,
  type AdminStoreSettings,
} from "@/redux/api/admin-api";
import type { Plan } from "@/redux/api/store-api";

import { OverviewTab } from "./overview-tab";
import { PlanTab } from "./plan-tab";
import { LimitsTab } from "./limits-tab";
import { FeaturesTab } from "./features-tab";
import { CourierTab } from "./courier-tab";
import { StorageTab } from "./storage-tab";
import { TrialTab } from "./trial-tab";
import { SubscriptionTab } from "./subscription-tab";
import { UsersTab } from "./users-tab";
import { AnalyticsTab } from "./analytics-tab";
import { MediaTab } from "./media-tab";
import { DangerTab } from "./danger-tab";

type TabId =
  | "overview" | "plan" | "limits" | "features" | "courier" | "storage"
  | "trial" | "subscription" | "users" | "analytics" | "media" | "danger";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "plan", label: "Plan" },
  { id: "limits", label: "Limits" },
  { id: "features", label: "Features" },
  { id: "courier", label: "Courier" },
  { id: "storage", label: "Storage" },
  { id: "trial", label: "Trial" },
  { id: "subscription", label: "Subscription" },
  { id: "users", label: "Users" },
  { id: "analytics", label: "Analytics" },
  { id: "media", label: "Media" },
  { id: "danger", label: "Danger Zone" },
];

export function StoreDetailDrawer({
  store,
  plans,
  open,
  onClose,
}: {
  store: AdminStore | null;
  plans: Plan[];
  open: boolean;
  onClose: () => void;
}) {
  const storeId = store?._id ?? "";

  // ── Data fetching ──────────────────────────────────────────
  const {
    data: settingsData,
    isLoading: settingsLoading,
    refetch: refetchSettings,
  } = useGetAdminStoreSettingsQuery(storeId, { skip: !storeId || !open });

  const { data: statsData, isLoading: statsLoading } = useGetAdminStoreStatsQuery(
    storeId,
    { skip: !storeId || !open }
  );

  const { data: mediaData, isLoading: mediaLoading } = useGetAdminStoreMediaQuery(
    storeId,
    { skip: !storeId || !open }
  );

  // ── Current tab ────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // ── Mutations ──────────────────────────────────────────────
  const [saveOverrides, { isLoading: savingOverrides }] = useSaveStoreOverridesMutation();
  const [changePlan] = useChangeStorePlanEnhancedMutation();
  const [manageTrial, { isLoading: savingTrial }] = useManageStoreTrialMutation();
  const [manageSub] = useManageStoreSubscriptionMutation();
  const [resetStore] = useResetStoreMutation();
  const [recalcStore, { isLoading: recalculating }] = useRecalculateStoreMutation();
  const [syncSub] = useSyncStoreSubscriptionMutation();
  const [deleteCascade, { isLoading: deleting }] = useDeleteAdminStoreCascadeMutation();
  const [manageStaff, { isLoading: savingStaff }] = useManageStoreStaffMutation();

  // ── Local state for override form ──────────────────────────
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved");
  const [localOverrides, setLocalOverrides] = useState<Record<string, unknown>>({});
  const [localLimits, setLocalLimits] = useState<Record<string, unknown>>({});
  const [localFeatures, setLocalFeatures] = useState<Record<string, unknown>>({});
  const [localStorageMB, setLocalStorageMB] = useState<number | null>(null);
  const [localStorageUnlimited, setLocalStorageUnlimited] = useState(false);
  const [localTrialEnabled, setLocalTrialEnabled] = useState<boolean | null>(null);
  const [localTrialEndsAt, setLocalTrialEndsAt] = useState<string>("");
  const [localSubStatusOverride, setLocalSubStatusOverride] = useState<string | null>(null);
  const [localBillingStatusOverride, setLocalBillingStatusOverride] = useState<string | null>(null);
  const [localPlanId, setLocalPlanId] = useState<string | null>(null);
  const [localMaintenanceMode, setLocalMaintenanceMode] = useState(false);
  const [localLoginDisabled, setLocalLoginDisabled] = useState(false);

  // Reset local state when settings data loads
  useEffect(() => {
    if (settingsData?.data) {
      const d = settingsData.data;
      const ov = (d.override as Record<string, unknown>) ?? {};
      setLocalOverrides(ov);
      setLocalLimits((ov.limits as Record<string, unknown>) ?? {});
      setLocalFeatures((ov.featureOverrides as Record<string, unknown>) ?? {});
      setLocalStorageMB((ov.storageOverrideMB as number) ?? null);
      setLocalStorageUnlimited((ov.storageUnlimited as boolean) ?? false);
      setLocalTrialEnabled((ov.trialEnabled as boolean) ?? null);
      setLocalTrialEndsAt((ov.trialEndsAt as string) ?? "");
      setLocalSubStatusOverride((ov.subscriptionStatusOverride as string) ?? null);
      setLocalBillingStatusOverride((ov.billingStatusOverride as string) ?? null);
      setLocalPlanId((ov.planId as string) ?? null);
      setLocalMaintenanceMode((ov.maintenanceMode as boolean) ?? false);
      setLocalLoginDisabled((ov.loginDisabled as boolean) ?? false);
      setDirty(false);
      setSaveStatus("saved");
    }
  }, [settingsData]);

  const markDirty = useCallback(() => {
    setDirty(true);
    setSaveStatus("unsaved");
  }, []);

  // ── Save all overrides ─────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!storeId) return;
    setSaveStatus("saving");
    try {
      await saveOverrides({
        id: storeId,
        data: {
          limits: localLimits,
          featureOverrides: localFeatures,
          storageOverrideMB: localStorageUnlimited ? null : localStorageMB,
          storageUnlimited: localStorageUnlimited,
          trialEnabled: localTrialEnabled,
          trialEndsAt: localTrialEndsAt || null,
          subscriptionStatusOverride: localSubStatusOverride,
          billingStatusOverride: localBillingStatusOverride,
          planId: localPlanId,
          maintenanceMode: localMaintenanceMode,
          loginDisabled: localLoginDisabled,
        },
      }).unwrap();
      setSaveStatus("saved");
      setDirty(false);
      toast.success("Store overrides saved");
      refetchSettings();
    } catch {
      setSaveStatus("error");
      toast.error("Failed to save overrides");
    }
  }, [
    storeId, saveOverrides, refetchSettings,
    localLimits, localFeatures, localStorageMB, localStorageUnlimited,
    localTrialEnabled, localTrialEndsAt, localSubStatusOverride,
    localBillingStatusOverride, localPlanId, localMaintenanceMode, localLoginDisabled,
  ]);

  // ── Helpers passed to tabs ─────────────────────────────────
  const helpers = useMemo(
    () => ({
      storeId,
      store,
      plans,
      settingsData: settingsData?.data as AdminStoreSettings | undefined,
      statsData: statsData?.data as Record<string, unknown> | undefined,
      mediaData: mediaData?.data as Record<string, unknown> | undefined,
      isLoading: settingsLoading || statsLoading || mediaLoading,
      dirty,
      markDirty,
      saving: savingOverrides || savingTrial || recalculating || savingStaff || deleting,
      handleSave,
      localLimits,
      setLocalLimits,
      localFeatures,
      setLocalFeatures,
      localStorageMB,
      setLocalStorageMB,
      localStorageUnlimited,
      setLocalStorageUnlimited,
      localTrialEnabled,
      setLocalTrialEnabled,
      localTrialEndsAt,
      setLocalTrialEndsAt,
      localSubStatusOverride,
      setLocalSubStatusOverride,
      localBillingStatusOverride,
      setLocalBillingStatusOverride,
      localPlanId,
      setLocalPlanId,
      localMaintenanceMode,
      setLocalMaintenanceMode,
      localLoginDisabled,
      setLocalLoginDisabled,
      changePlan: (planId: string) => changePlan({ id: storeId, planId }),
      manageTrial: (action: string, days?: number, endsAt?: string) =>
        manageTrial({ id: storeId, action, days, endsAt }),
      manageSub: (action: string) => manageSub({ id: storeId, action }),
      resetStore: (type: string) => resetStore({ id: storeId, type }),
      recalculate: () => recalcStore(storeId),
      syncSub: () => syncSub(storeId),
      deleteCascade: () => deleteCascade(storeId),
      manageStaff: (action: string, teamMemberId?: string, role?: string) =>
        manageStaff({ id: storeId, action, teamMemberId, role }),
      handleSuspend: () => {},
      handleActivate: () => {},
      refetchSettings,
    }),
    [
      storeId, store, plans, settingsData, statsData, mediaData,
      settingsLoading, statsLoading, mediaLoading,
      dirty, markDirty, savingOverrides, savingTrial, recalculating, savingStaff, deleting,
      handleSave, changePlan, manageTrial, manageSub, resetStore, recalcStore,
      syncSub, deleteCascade, manageStaff, refetchSettings,
      localLimits, localFeatures, localStorageMB, localStorageUnlimited,
      localTrialEnabled, localTrialEndsAt, localSubStatusOverride,
      localBillingStatusOverride, localPlanId, localMaintenanceMode, localLoginDisabled,
    ]
  );

  if (!store) return null;

  const planName =
    typeof store.planId === "object" && store.planId
      ? (store.planId as { name?: string }).name
      : store.plan ?? "—";

  return (
    <Drawer open={open} onClose={onClose} title={store.name} description={`/${store.slug}`} size="full">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-apple-primary text-lg font-bold text-white">
              {store.name[0]}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-apple-ink">{store.name}</h2>
              <p className="text-xs text-apple-ink-muted-48">
                {store.subdomain || store.slug} · {planName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SaveIndicator status={saveStatus} compact />
            <LoadingButton
              variant="primary"
              size="sm"
              loading={savingOverrides || savingTrial || savingStaff}
              loadingText="Saving..."
              disabled={!dirty}
              onClick={handleSave}
            >
              Save
            </LoadingButton>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-zinc-200 px-6 py-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative shrink-0 px-3 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600"
                  : "text-apple-ink-muted-48 hover:text-zinc-800"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-blue-600" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {settingsLoading && activeTab !== "analytics" && activeTab !== "media" ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600" />
            </div>
          ) : (
            <>
              {activeTab === "overview" && <OverviewTab helpers={helpers} />}
              {activeTab === "plan" && <PlanTab helpers={helpers} />}
              {activeTab === "limits" && <LimitsTab helpers={helpers} />}
              {activeTab === "features" && <FeaturesTab helpers={helpers} />}
              {activeTab === "courier" && <CourierTab helpers={helpers} />}
              {activeTab === "storage" && <StorageTab helpers={helpers} />}
              {activeTab === "trial" && <TrialTab helpers={helpers} />}
              {activeTab === "subscription" && <SubscriptionTab helpers={helpers} />}
              {activeTab === "users" && <UsersTab helpers={helpers} />}
              {activeTab === "analytics" && <AnalyticsTab helpers={helpers} />}
              {activeTab === "media" && <MediaTab helpers={helpers} />}
              {activeTab === "danger" && <DangerTab helpers={helpers} />}
            </>
          )}
        </div>

        {/* Sticky Save Bar */}
        {dirty && (
          <div className="sticky bottom-0 left-0 right-0 flex items-center justify-between border-t border-zinc-200 bg-white/95 px-6 py-3 backdrop-blur-sm">
            <p className="text-sm text-apple-ink-muted-48">
              Unsaved changes
            </p>
            <div className="flex gap-2">
              <LoadingButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  setDirty(false);
                  setSaveStatus("saved");
                  refetchSettings();
                }}
              >
                Discard
              </LoadingButton>
              <LoadingButton
                variant="primary"
                size="sm"
                loading={savingOverrides || savingTrial || savingStaff}
                loadingText="Saving..."
                onClick={handleSave}
              >
                Save Changes
              </LoadingButton>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
