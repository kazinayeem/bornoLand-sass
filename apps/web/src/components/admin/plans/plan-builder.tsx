"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import type { Plan, PlanLimits } from "@/redux/api/store-api";
import { useUpdatePlanMutation } from "@/redux/api/store-api";
import {
  useGetAdminFeatureGroupsQuery,
  useGetPlanFeatureAssignmentsQuery,
  useSetPlanFeatureAssignmentsMutation,
  normalizeFeatureType,
} from "@/redux/api/feature-api";
import { useUpdatePlanStorageMutation } from "@/redux/api/admin-storage-api";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { cn } from "@/lib/utils";
import { PlanPreviewCard } from "@/components/admin/plans/plan-preview-card";
import Link from "next/link";
import {
  useCreateAdminFeatureMutation,
  useGetAdminFeaturesQuery,
  type FeatureGroup,
  type PlanFeatureAssignment,
  type PlatformFeature,
} from "@/redux/api/feature-api";
import { AdminPlatformPaymentMethodsPanel } from "@/components/admin/platform-payment-methods-panel";

type AssignmentState = { enabled: boolean; limit: number; tierKey: string };

const BUILDER_TABS = [
  { id: "general", label: "General" },
  { id: "pricing", label: "Pricing" },
  { id: "trial", label: "Trial" },
  { id: "storage", label: "Storage" },
  { id: "limits", label: "Limits" },
  { id: "features", label: "Features" },
  { id: "permissions", label: "Permissions" },
  { id: "payment", label: "Payment" },
  { id: "visibility", label: "Visibility" },
  { id: "preview", label: "Preview" },
];

const LIMIT_FIELDS: Array<{ key: keyof PlanLimits; label: string; hint?: string }> = [
  { key: "products", label: "Products", hint: "0 = unlimited" },
  { key: "orders", label: "Orders", hint: "0 = unlimited" },
  { key: "categories", label: "Categories" },
  { key: "staff", label: "Staff members" },
  { key: "domains", label: "Domains" },
  { key: "builderPages", label: "Pages" },
  { key: "themes", label: "Templates" },
  { key: "bandwidthGB", label: "Bandwidth (GB)" },
  { key: "storageGB", label: "Storage (GB)" },
];

const ROLE_FEATURES = [
  { role: "Admin", keys: ["products", "orders", "customers", "marketing", "analytics", "cms", "media"] },
  { role: "Manager", keys: ["products", "orders", "customers", "inventory", "coupons"] },
  { role: "Staff", keys: ["orders", "products", "customers"] },
  { role: "Viewer", keys: ["analytics", "reports"] },
];

const DEFAULT_STORAGE = {
  storageLimitMB: 500,
  maxFileSizeMB: 10,
  allowedMimeTypes: [] as string[],
  unlimited: false,
};

export function PlanBuilder({ plan, initialTab }: { plan: Plan; initialTab?: string }) {
  const router = useRouter();
  const [tab, setTab] = useState(initialTab && BUILDER_TABS.some((t) => t.id === initialTab) ? initialTab : "general");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: plan.name,
    slug: plan.slug,
    description: plan.description ?? "",
    priceBDT: plan.priceBDT,
    priceYearly: plan.priceYearly ?? plan.pricing?.yearly ?? 0,
    trialDays: plan.trialDays,
    features: plan.features.join("\n"),
    isRecommended: plan.isRecommended,
    isActive: plan.isActive,
    visible: plan.visible ?? true,
    isCustomPrice: plan.isCustomPrice ?? false,
    customDomain: plan.customDomain ?? false,
    prioritySupport: plan.prioritySupport ?? false,
    sortOrder: plan.sortOrder ?? 0,
    limits: { ...plan.limits },
    pricing: {
      monthly: plan.pricing?.monthly ?? plan.priceBDT,
      quarterly: plan.pricing?.quarterly ?? 0,
      halfYearly: plan.pricing?.halfYearly ?? 0,
      yearly: plan.pricing?.yearly ?? plan.priceYearly ?? 0,
      lifetime: plan.pricing?.lifetime ?? 0,
    },
  });

  const [storageForm, setStorageForm] = useState({
    ...DEFAULT_STORAGE,
    storageLimitMB: Math.round((plan.limits.storageGB ?? 0.5) * 1024) || 500,
    imageCompression: true,
    cdnEnabled: false,
  });

  const [trialForm, setTrialForm] = useState({
    enabled: plan.trialDays > 0,
    reminderDays: 2,
    showUpgradeBanner: true,
    disablePublishing: false,
    disableOrders: false,
  });

  const [updatePlan] = useUpdatePlanMutation();
  const [updatePlanStorage] = useUpdatePlanStorageMutation();
  const [setPlanFeatures] = useSetPlanFeatureAssignmentsMutation();
  const [createFeature] = useCreateAdminFeatureMutation();
  const { data: allFeaturesData } = useGetAdminFeaturesQuery();
  const { data: groupsData } = useGetAdminFeatureGroupsQuery();
  const { data: planFeaturesData, isLoading: loadingFeatures } = useGetPlanFeatureAssignmentsQuery(plan._id);

  const planFeatures = planFeaturesData?.data?.features ?? [];
  const groups = groupsData?.data?.groups ?? [];
  const [assignments, setAssignments] = useState<Record<string, AssignmentState>>({});
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next: Record<string, AssignmentState> = {};
    for (const pf of planFeatures) {
      next[pf.featureKey] = {
        enabled: pf.enabled,
        limit: pf.limit,
        tierKey: pf.tierKey ?? pf.value ?? "disabled",
      };
    }
    setAssignments(next);
    const initialOpen: Record<string, boolean> = {};
    for (const g of groups) initialOpen[g.key] = true;
    setOpenGroups(initialOpen);
  }, [planFeatures, groups]);

  const groupedFeatures = useMemo(() => {
    const map = new Map<string, typeof planFeatures>();
    for (const pf of planFeatures) {
      const g = pf.groupKey || pf.group || "general";
      const list = map.get(g) ?? [];
      list.push(pf);
      map.set(g, list);
    }
    return Array.from(map.entries());
  }, [planFeatures]);

  const groupName = (key: string) => groups.find((g) => g.key === key)?.name ?? key;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePlan({
        id: plan._id,
        data: {
          name: form.name,
          slug: form.slug,
          description: form.description,
          priceBDT: form.priceBDT,
          priceYearly: form.pricing.yearly,
          trialDays: form.trialDays,
          features: form.features
            .split("\n")
            .map((f) => f.trim())
            .filter(Boolean),
          limits: form.limits,
          pricing: form.pricing,
          isRecommended: form.isRecommended,
          isActive: form.isActive,
          visible: form.visible,
          isCustomPrice: form.isCustomPrice,
          customDomain: form.customDomain,
          prioritySupport: form.prioritySupport,
          sortOrder: form.sortOrder,
        },
      }).unwrap();

      await updatePlanStorage({
        planId: plan._id,
        data: {
          storageLimitMB: storageForm.storageLimitMB,
          maxFileSizeMB: storageForm.maxFileSizeMB,
          allowedMimeTypes: storageForm.allowedMimeTypes,
          unlimited: storageForm.unlimited,
        },
      }).unwrap();

      if (Object.keys(assignments).length > 0) {
        await setPlanFeatures({
          planId: plan._id,
          features: Object.entries(assignments).map(([featureKey, v]) => ({
            featureKey,
            enabled: v.enabled,
            limit: v.limit,
            tierKey: v.tierKey,
            value: v.tierKey,
          })),
        }).unwrap();
      }

      toast.success("Plan saved");
      router.refresh();
    } catch {
      toast.error("Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminTabs tabs={BUILDER_TABS} active={tab} onChange={setTab} />

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        {tab === "general" && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Plan name">
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Slug">
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Description" className="md:col-span-2">
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className={inputClass}
              />
            </Field>
            <Field label="Marketing bullets (one per line)" className="md:col-span-2">
              <textarea
                value={form.features}
                onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                rows={4}
                className={inputClass}
                placeholder="500 products&#10;5 GB storage&#10;Email support"
              />
            </Field>
            <Field label="Sort order">
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                className={inputClass}
              />
            </Field>
            <div className="md:col-span-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isRecommended} onChange={(e) => setForm((f) => ({ ...f, isRecommended: e.target.checked }))} />
                Recommended / Popular
              </label>
            </div>
          </div>
        )}

        {tab === "pricing" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["monthly", "Monthly"],
                ["quarterly", "Quarterly"],
                ["halfYearly", "Half Yearly"],
                ["yearly", "Yearly"],
                ["lifetime", "Lifetime"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={`${label} (৳)`}>
                <input
                  type="number"
                  min={0}
                  value={form.pricing[key]}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      pricing: { ...f.pricing, [key]: Number(e.target.value) },
                      ...(key === "monthly" ? { priceBDT: Number(e.target.value) } : {}),
                    }))
                  }
                  className={inputClass}
                />
              </Field>
            ))}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={form.isCustomPrice}
                  onChange={(e) => setForm((f) => ({ ...f, isCustomPrice: e.target.checked }))}
                />
                Custom / contact sales pricing
              </label>
            </div>
          </div>
        )}

        {tab === "trial" && (
          <div className="max-w-2xl space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-800">
              <input
                type="checkbox"
                checked={trialForm.enabled}
                onChange={(e) => {
                  setTrialForm((t) => ({ ...t, enabled: e.target.checked }));
                  if (!e.target.checked) setForm((f) => ({ ...f, trialDays: 0 }));
                }}
              />
              Trial enabled for this plan
            </label>
            <Field label="Trial days">
              <input
                type="number"
                min={0}
                disabled={!trialForm.enabled}
                value={form.trialDays}
                onChange={(e) => setForm((f) => ({ ...f, trialDays: Number(e.target.value) }))}
                className={inputClass}
              />
            </Field>
            <Field label="Reminder days before expiry">
              <input
                type="number"
                min={0}
                value={trialForm.reminderDays}
                onChange={(e) => setTrialForm((t) => ({ ...t, reminderDays: Number(e.target.value) }))}
                className={inputClass}
              />
            </Field>
            <div className="space-y-2">
              <Toggle label="Show upgrade banner" checked={trialForm.showUpgradeBanner} onChange={(v) => setTrialForm((t) => ({ ...t, showUpgradeBanner: v }))} />
              <Toggle label="Disable publishing on expiry" checked={trialForm.disablePublishing} onChange={(v) => setTrialForm((t) => ({ ...t, disablePublishing: v }))} />
              <Toggle label="Disable orders on expiry" checked={trialForm.disableOrders} onChange={(v) => setTrialForm((t) => ({ ...t, disableOrders: v }))} />
            </div>
            <p className="text-xs text-zinc-500">
              Global trial policies (expire actions, cron) are in{" "}
              <Link href="/admin/dashboard/settings?tab=trial" className="text-blue-600 underline">Platform Settings → Trial</Link>.
              Per-plan trial length is saved with this plan.
            </p>
          </div>
        )}

        {tab === "storage" && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Storage limit (MB)">
              <input
                type="number"
                min={0}
                disabled={storageForm.unlimited}
                value={storageForm.storageLimitMB}
                onChange={(e) =>
                  setStorageForm((s) => ({ ...s, storageLimitMB: Number(e.target.value) }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Max upload size (MB)">
              <input
                type="number"
                min={1}
                value={storageForm.maxFileSizeMB}
                onChange={(e) =>
                  setStorageForm((s) => ({ ...s, maxFileSizeMB: Number(e.target.value) }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Allowed MIME types" className="md:col-span-2">
              <input
                value={storageForm.allowedMimeTypes.join(", ")}
                onChange={(e) =>
                  setStorageForm((s) => ({
                    ...s,
                    allowedMimeTypes: e.target.value
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="image/jpeg, image/png, application/pdf (empty = all allowed)"
                className={inputClass}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-zinc-700 md:col-span-2">
              <input
                type="checkbox"
                checked={storageForm.unlimited}
                onChange={(e) => setStorageForm((s) => ({ ...s, unlimited: e.target.checked }))}
              />
              Unlimited storage
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700 md:col-span-2">
              <input
                type="checkbox"
                checked={storageForm.imageCompression}
                onChange={(e) => setStorageForm((s) => ({ ...s, imageCompression: e.target.checked }))}
              />
              Image compression on upload
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700 md:col-span-2">
              <input
                type="checkbox"
                checked={storageForm.cdnEnabled}
                onChange={(e) => setStorageForm((s) => ({ ...s, cdnEnabled: e.target.checked }))}
              />
              CDN delivery (when configured)
            </label>
          </div>
        )}

        {tab === "limits" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {LIMIT_FIELDS.map(({ key, label, hint }) => (
                <Field key={key} label={label} hint={hint}>
                  <input
                    type="number"
                    min={0}
                    value={Number(form.limits[key] ?? 0)}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        limits: { ...f.limits, [key]: Number(e.target.value) },
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
              ))}
              <Field label="Stores" hint="0 = unlimited">
                <input
                  type="number"
                  min={0}
                  value={Number(form.limits.stores ?? 0)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      limits: { ...f.limits, stores: Number(e.target.value) },
                    }))
                  }
                  className={inputClass}
                />
              </Field>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-zinc-800">Capability flags</h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    ["apiAccess", "API access"],
                    ["analytics", "Analytics"],
                    ["coupons", "Coupons"],
                    ["reviews", "Reviews"],
                    ["marketing", "Marketing"],
                    ["customCode", "Custom code"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 rounded-xl border border-zinc-100 p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(form.limits[key])}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          limits: { ...f.limits, [key]: e.target.checked },
                        }))
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              Variant, coupon, and AI limits are also controlled in the Features tab per feature key.
            </p>
          </div>
        )}

        {tab === "features" && (
          <div className="space-y-4">
            <FeatureCatalogPanel
              groups={groups}
              allFeatures={allFeaturesData?.data?.features ?? []}
              onCreate={async (payload) => {
                try {
                  await createFeature(payload).unwrap();
                  toast.success("Feature added to catalog");
                } catch {
                  toast.error("Failed to create feature");
                }
              }}
            />
            {loadingFeatures ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              </div>
            ) : (
              groupedFeatures.map(([group, items]) => (
                <div key={group} className="overflow-hidden rounded-xl border border-zinc-200">
                  <button
                    type="button"
                    onClick={() => setOpenGroups((o) => ({ ...o, [group]: !o[group] }))}
                    className="flex w-full items-center justify-between bg-zinc-50 px-4 py-3 text-left"
                  >
                    <span className="text-sm font-semibold text-zinc-900">{groupName(group)}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-zinc-400 transition-transform",
                        openGroups[group] && "rotate-180"
                      )}
                    />
                  </button>
                  {openGroups[group] && (
                    <div className="divide-y divide-zinc-100">
                      {items.map((pf) => {
                        const type = normalizeFeatureType(pf.type);
                        const state = assignments[pf.featureKey] ?? {
                          enabled: pf.enabled,
                          limit: pf.limit,
                          tierKey: pf.tierKey ?? "disabled",
                        };
                        const tierOptions = pf.tiers?.length
                          ? pf.tiers
                          : [
                              { tierKey: "disabled", label: "Disabled", rank: 0 },
                              { tierKey: "basic", label: "Basic", rank: 1 },
                              { tierKey: "advanced", label: "Advanced", rank: 2 },
                              { tierKey: "enterprise", label: "Enterprise", rank: 3 },
                            ];

                        return (
                          <div
                            key={pf.featureKey}
                            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-medium text-zinc-900">{pf.name}</p>
                              <p className="text-xs text-zinc-500">
                                {pf.featureKey} · {type}
                              </p>
                              {pf.comingSoon && (
                                <span className="mt-0.5 inline-block text-[10px] uppercase text-amber-600">Coming soon</span>
                              )}
                            </div>
                            {type === "boolean" && (
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={state.enabled}
                                  onChange={(e) =>
                                    setAssignments((prev) => ({
                                      ...prev,
                                      [pf.featureKey]: { ...state, enabled: e.target.checked },
                                    }))
                                  }
                                />
                                Enabled
                              </label>
                            )}
                            {type === "limit" && (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min={0}
                                  value={state.limit}
                                  onChange={(e) =>
                                    setAssignments((prev) => ({
                                      ...prev,
                                      [pf.featureKey]: {
                                        ...state,
                                        limit: Number(e.target.value),
                                        enabled: Number(e.target.value) !== 0 || state.enabled,
                                      },
                                    }))
                                  }
                                  className="h-9 w-28 rounded-lg border border-zinc-200 px-2 text-sm"
                                />
                                <span className="text-xs text-zinc-500">
                                  {pf.limitMeta?.unit ?? ""} (0 = unlimited)
                                </span>
                              </div>
                            )}
                            {type === "tier" && (
                              <div className="flex flex-col items-end gap-1">
                                <select
                                  value={state.tierKey}
                                  onChange={(e) =>
                                    setAssignments((prev) => ({
                                      ...prev,
                                      [pf.featureKey]: {
                                        ...state,
                                        tierKey: e.target.value,
                                        enabled: e.target.value !== "disabled",
                                      },
                                    }))
                                  }
                                  className="h-9 rounded-lg border border-zinc-200 px-2 text-sm"
                                >
                                  {tierOptions.map((t) => (
                                    <option key={t.tierKey} value={t.tierKey}>
                                      {t.label}
                                    </option>
                                  ))}
                                </select>
                                <span className="text-[10px] text-zinc-400">Required tier</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === "permissions" && (
          <PermissionsMatrix planFeatures={planFeatures} assignments={assignments} />
        )}

        {tab === "payment" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Plan payment capabilities</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Toggle payment-related features for this plan. Global provider credentials are in Platform Settings.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {planFeatures
                  .filter((pf) =>
                    /payment|bkash|nagad|rocket|bank|invoice|billing/i.test(pf.featureKey + pf.name)
                  )
                  .map((pf) => {
                    const state = assignments[pf.featureKey] ?? {
                      enabled: pf.enabled,
                      limit: pf.limit,
                      tierKey: pf.tierKey ?? "disabled",
                    };
                    return (
                      <label
                        key={pf.featureKey}
                        className="flex items-center justify-between rounded-xl border border-zinc-100 p-3 text-sm"
                      >
                        <span className="font-medium text-zinc-800">{pf.name}</span>
                        <input
                          type="checkbox"
                          checked={state.enabled}
                          onChange={(e) =>
                            setAssignments((prev) => ({
                              ...prev,
                              [pf.featureKey]: { ...state, enabled: e.target.checked },
                            }))
                          }
                        />
                      </label>
                    );
                  })}
                {planFeatures.filter((pf) =>
                  /payment|bkash|nagad|rocket|bank|invoice|billing/i.test(pf.featureKey + pf.name)
                ).length === 0 && (
                  <p className="text-sm text-zinc-500 sm:col-span-2">
                    No payment features in catalog yet. Add <code className="text-xs">payment_gateway</code> in Features tab.
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-zinc-900">Platform payment methods</h3>
                <Link href="/admin/dashboard/settings?tab=payments" className="text-xs text-blue-600 hover:underline">
                  Configure in Settings →
                </Link>
              </div>
              <div className="mt-3">
                <AdminPlatformPaymentMethodsPanel compact />
              </div>
            </div>
          </div>
        )}

        {tab === "visibility" && (
          <div className="grid gap-3 max-w-lg">
            <Toggle
              label="Active"
              description="Inactive plans cannot be assigned to new stores."
              checked={form.isActive}
              onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
            />
            <Toggle
              label="Visible on pricing page"
              description="Hide from public pricing while keeping plan assignable."
              checked={form.visible}
              onChange={(v) => setForm((f) => ({ ...f, visible: v }))}
            />
            <Toggle
              label="Recommended"
              description="Highlight as the suggested plan."
              checked={form.isRecommended}
              onChange={(v) => setForm((f) => ({ ...f, isRecommended: v }))}
            />
            <Toggle
              label="Custom domain included"
              checked={form.customDomain}
              onChange={(v) => setForm((f) => ({ ...f, customDomain: v }))}
            />
            <Toggle
              label="Priority support"
              checked={form.prioritySupport}
              onChange={(v) => setForm((f) => ({ ...f, prioritySupport: v }))}
            />
            <div className="rounded-xl border border-zinc-100 p-4">
              <p className="text-sm font-medium text-zinc-900">Visibility mode</p>
              <div className="mt-3 space-y-2">
                {(
                  [
                    { id: "public", label: "Public", desc: "Listed on pricing and available for signup" },
                    { id: "private", label: "Private", desc: "Assignable by admin only, hidden from pricing" },
                    { id: "hidden", label: "Hidden", desc: "Archived — not assignable to new stores" },
                  ] as const
                ).map((mode) => (
                  <label key={mode.id} className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-zinc-50">
                    <input
                      type="radio"
                      name="visibility-mode"
                      checked={
                        mode.id === "public"
                          ? form.visible && form.isActive
                          : mode.id === "private"
                            ? !form.visible && form.isActive
                            : !form.isActive
                      }
                      onChange={() => {
                        if (mode.id === "public") setForm((f) => ({ ...f, visible: true, isActive: true }));
                        if (mode.id === "private") setForm((f) => ({ ...f, visible: false, isActive: true }));
                        if (mode.id === "hidden") setForm((f) => ({ ...f, isActive: false }));
                      }}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-medium text-zinc-800">{mode.label}</p>
                      <p className="text-xs text-zinc-500">{mode.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "preview" && (
          <PlanPreviewCard
            plan={plan}
            form={{
              name: form.name,
              description: form.description,
              priceBDT: form.priceBDT,
              pricing: form.pricing,
              features: form.features,
              trialDays: form.trialDays,
              isRecommended: form.isRecommended,
              isActive: form.isActive,
              visible: form.visible,
              limits: form.limits,
            }}
          />
        )}
      </div>

      <div className="sticky bottom-4 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save plan
        </button>
      </div>
    </div>
  );
}

const inputClass =
  "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-zinc-700">{label}</label>
      {children}
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-zinc-100 p-4 hover:bg-zinc-50">
      <div>
        <p className="text-sm font-medium text-zinc-900">{label}</p>
        {description ? <p className="mt-0.5 text-xs text-zinc-500">{description}</p> : null}
      </div>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1" />
    </label>
  );
}

function FeatureCatalogPanel({
  groups,
  allFeatures,
  onCreate,
}: {
  groups: FeatureGroup[];
  allFeatures: PlatformFeature[];
  onCreate: (payload: Partial<PlatformFeature> & { key: string; name: string; type: string; groupKey: string }) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({
    key: "",
    name: "",
    description: "",
    type: "boolean" as const,
    groupKey: groups[0]?.key ?? "general",
  });

  const handleCreate = async () => {
    if (!draft.key.trim() || !draft.name.trim()) {
      toast.error("Key and name are required");
      return;
    }
    setCreating(true);
    try {
      await onCreate({
        key: draft.key.trim(),
        name: draft.name.trim(),
        description: draft.description,
        type: draft.type,
        groupKey: draft.groupKey,
        group: draft.groupKey,
        isActive: true,
        sortOrder: allFeatures.length + 1,
      });
      setDraft({ key: "", name: "", description: "", type: "boolean", groupKey: groups[0]?.key ?? "general" });
      setOpen(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Feature catalog</p>
          <p className="text-xs text-zinc-500">{allFeatures.length} platform features · manage assignments below</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          {open ? "Cancel" : "Add feature"}
        </button>
      </div>
      {open && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Key">
            <input value={draft.key} onChange={(e) => setDraft((d) => ({ ...d, key: e.target.value }))} placeholder="seo" className={inputClass} />
          </Field>
          <Field label="Name">
            <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="SEO Tools" className={inputClass} />
          </Field>
          <Field label="Group" className="sm:col-span-2">
            <select value={draft.groupKey} onChange={(e) => setDraft((d) => ({ ...d, groupKey: e.target.value }))} className={inputClass}>
              {groups.map((g) => (
                <option key={g.key} value={g.key}>{g.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Type">
            <select value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as "boolean" }))} className={inputClass}>
              <option value="boolean">Boolean</option>
              <option value="limit">Limit</option>
              <option value="tier">Tier</option>
            </select>
          </Field>
          <Field label="Description">
            <input value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {creating ? "Creating…" : "Create feature"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const PERMISSION_ROLES = ["Admin", "Manager", "Staff", "Viewer", "Customer"] as const;

function PermissionsMatrix({
  planFeatures,
  assignments,
}: {
  planFeatures: PlanFeatureAssignment[];
  assignments: Record<string, AssignmentState>;
}) {
  const enabledFeatures = planFeatures.filter((pf) => {
    const state = assignments[pf.featureKey];
    if (state) return state.enabled || state.limit > 0 || (state.tierKey && state.tierKey !== "disabled");
    return pf.enabled || pf.limit > 0;
  });

  const roleHasFeature = (role: string, featureKey: string) => {
    const roleMap = ROLE_FEATURES.find((r) => r.role === role);
    if (role === "Admin") return true;
    if (role === "Customer") return false;
    if (!roleMap) return false;
    return roleMap.keys.some((k) => featureKey.includes(k) || k.includes(featureKey.split("_")[0] ?? ""));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600">
        Role access is derived from enabled plan features. Store staff permissions cannot exceed what the plan allows.
      </p>
      <div className="overflow-x-auto rounded-xl border border-zinc-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3 font-semibold">Feature</th>
              {PERMISSION_ROLES.map((role) => (
                <th key={role} className="px-3 py-3 text-center font-semibold">{role}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {enabledFeatures.map((pf) => (
              <tr key={pf.featureKey} className="border-b border-zinc-50">
                <td className="px-4 py-2.5 font-medium text-zinc-800">{pf.name}</td>
                {PERMISSION_ROLES.map((role) => (
                  <td key={role} className="px-3 py-2.5 text-center">
                    {roleHasFeature(role, pf.featureKey) ? (
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" title="Allowed" />
                    ) : (
                      <span className="inline-block h-2 w-2 rounded-full bg-zinc-200" title="Not included" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {enabledFeatures.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  Enable features in the Features tab to configure role access.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
