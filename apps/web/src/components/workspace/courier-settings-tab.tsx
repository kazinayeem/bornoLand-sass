"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  Loader2,
  Package,
  Plug,
  Save,
  Wifi,
  WifiOff,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useGetStoreCouriersQuery,
  useTestStoreCourierMutation,
  useUpdateStoreCourierMutation,
  type CourierProviderSlug,
  type CourierShipmentSettings,
  type StoreCourierConfig,
} from "@/redux/api/courier-api";

type CourierSettingsTabProps = { storeId: string };

const REFRESH_OPTIONS: Array<{ value: CourierShipmentSettings["autoRefreshTracking"]; label: string }> = [
  { value: "5", label: "Every 5 min" },
  { value: "15", label: "Every 15 min" },
  { value: "30", label: "Every 30 min" },
  { value: "manual", label: "Manual" },
];

function StatusBadge({
  tone,
  children,
}: {
  tone: "success" | "danger" | "warning" | "neutral" | "info";
  children: React.ReactNode;
}) {
  const tones = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    neutral: "bg-zinc-50 text-zinc-600 border-zinc-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-apple-hairline bg-apple-canvas p-5">
      <div className="mb-4 h-5 w-40 rounded bg-zinc-200" />
      <div className="space-y-3">
        <div className="h-10 rounded-xl bg-zinc-100" />
        <div className="h-10 rounded-xl bg-zinc-100" />
        <div className="h-10 w-1/2 rounded-xl bg-zinc-100" />
      </div>
    </div>
  );
}

type DraftState = {
  enabled: boolean;
  sandbox: boolean;
  credentials: Record<string, string>;
  shipmentSettings: CourierShipmentSettings;
};

function buildDraft(courier: StoreCourierConfig): DraftState {
  const credentials: Record<string, string> = {};
  for (const field of courier.credentialFields) {
    // Never prefill real values (API does not return them). Mark saved fields so blank saves keep them.
    credentials[field.key] = field.set ? "********" : "";
  }
  return {
    enabled: courier.enabled,
    sandbox: courier.sandbox,
    credentials,
    shipmentSettings: { ...courier.shipmentSettings },
  };
}

function ProviderCard({
  storeId,
  courier,
}: {
  storeId: string;
  courier: StoreCourierConfig;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DraftState>(() => buildDraft(courier));
  const [updateCourier, { isLoading: saving }] = useUpdateStoreCourierMutation();
  const [testConnection, { isLoading: testing }] = useTestStoreCourierMutation();

  useEffect(() => {
    setDraft(buildDraft(courier));
  }, [courier]);

  const setCred = (key: string, value: string) => {
    setDraft((prev) => ({
      ...prev,
      credentials: { ...prev.credentials, [key]: value },
    }));
  };

  const setShipment = <K extends keyof CourierShipmentSettings>(
    key: K,
    value: CourierShipmentSettings[K],
  ) => {
    setDraft((prev) => ({
      ...prev,
      shipmentSettings: { ...prev.shipmentSettings, [key]: value },
    }));
  };

  const handleSave = async () => {
    const credentialsPayload: Record<string, string> = {};
    for (const field of courier.credentialFields) {
      const value = draft.credentials[field.key] ?? "";
      // Blank or mask = keep existing value on the server (do not wipe Client ID / Username / etc.)
      if (value === "" || value === "********") continue;
      credentialsPayload[field.key] = value;
    }

    try {
      await updateCourier({
        storeId,
        provider: courier.provider,
        data: {
          enabled: draft.enabled,
          sandbox: draft.sandbox,
          credentials: Object.keys(credentialsPayload).length ? credentialsPayload : undefined,
          shipmentSettings: draft.shipmentSettings,
        },
      }).unwrap();
      toast.success(`${courier.name} settings saved`);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message ?? `Could not save ${courier.name}`);
    }
  };

  const handleTest = async () => {
    try {
      const result = await testConnection({
        storeId,
        provider: courier.provider,
      }).unwrap();
      if (result.data?.test?.ok) {
        toast.success(result.data.test.message || "Connection successful");
      } else {
        toast.error(result.data?.test?.message || "Connection failed");
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message ?? "Connection test failed");
    }
  };

  const statusTone =
    courier.connectionStatus === "connected"
      ? "success"
      : courier.connectionStatus === "error"
        ? "danger"
        : "neutral";

  return (
    <div className="overflow-hidden rounded-2xl border border-apple-hairline bg-apple-canvas transition-shadow hover:shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-apple-canvas-parchment">
          <Package className="h-5 w-5 text-apple-ink-muted-80" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold text-apple-ink">{courier.name}</h3>
            <StatusBadge tone={statusTone}>
              {courier.connectionStatus === "connected"
                ? "Connected"
                : courier.connectionStatus === "error"
                  ? "Error"
                  : "Not Connected"}
            </StatusBadge>
            <StatusBadge tone={courier.sandbox ? "warning" : "info"}>
              {courier.sandbox ? "Sandbox" : "Production"}
            </StatusBadge>
            {draft.enabled ? (
              <StatusBadge tone="success">Active</StatusBadge>
            ) : (
              <StatusBadge tone="neutral">Inactive</StatusBadge>
            )}
          </div>
          <p className="mt-0.5 text-[12px] text-apple-ink-muted-48">
            {courier.lastTestedAt
              ? `Last tested ${new Date(courier.lastTestedAt).toLocaleString()}`
              : "Never tested"}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-apple-ink-muted-48 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-6 border-t border-apple-hairline px-5 py-5">
            {/* Connection status */}
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-apple-hairline px-3 py-2.5">
                <p className="text-[11px] text-apple-ink-muted-48">Status</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-medium text-apple-ink">
                  {courier.connectionStatus === "connected" ? (
                    <Wifi className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <WifiOff className="h-3.5 w-3.5 text-apple-ink-muted-48" />
                  )}
                  {courier.connectionStatus === "connected" ? "Connected" : "Not Connected"}
                </p>
              </div>
              <div className="rounded-xl border border-apple-hairline px-3 py-2.5">
                <p className="text-[11px] text-apple-ink-muted-48">Environment</p>
                <p className="mt-0.5 text-[13px] font-medium text-apple-ink">
                  {courier.environment === "production" ? "Production" : "Sandbox"}
                </p>
              </div>
              <div className="rounded-xl border border-apple-hairline px-3 py-2.5">
                <p className="text-[11px] text-apple-ink-muted-48">Last Tested</p>
                <p className="mt-0.5 text-[13px] font-medium text-apple-ink">
                  {courier.lastTestedAt
                    ? new Date(courier.lastTestedAt).toLocaleString()
                    : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-apple-hairline px-3 py-2.5">
                <p className="text-[11px] text-apple-ink-muted-48">Last Error</p>
                <p className="mt-0.5 truncate text-[13px] font-medium text-apple-ink" title={courier.lastError}>
                  {courier.lastError || "—"}
                </p>
              </div>
            </section>

            {/* General */}
            <section>
              <h4 className="mb-3 text-[13px] font-semibold text-apple-ink">General</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between gap-4 rounded-xl border border-apple-hairline px-4 py-3">
                  <span className="text-[13px] font-medium text-apple-ink">Active</span>
                  <input
                    type="checkbox"
                    checked={draft.enabled}
                    onChange={(e) => setDraft((p) => ({ ...p, enabled: e.target.checked }))}
                    className="h-4 w-4 rounded border-apple-hairline"
                  />
                </label>
                <label className="flex items-center justify-between gap-4 rounded-xl border border-apple-hairline px-4 py-3">
                  <div>
                    <span className="text-[13px] font-medium text-apple-ink">Sandbox Mode</span>
                    <p className="text-[11px] text-apple-ink-muted-48">
                      Off = Production Mode
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.sandbox}
                    onChange={(e) => setDraft((p) => ({ ...p, sandbox: e.target.checked }))}
                    className="h-4 w-4 rounded border-apple-hairline"
                  />
                </label>
              </div>
            </section>

            {/* Credentials */}
            <section>
              <h4 className="mb-3 text-[13px] font-semibold text-apple-ink">Credentials</h4>
              <p className="mb-3 text-[12px] text-apple-ink-muted-48">
                Secrets are encrypted at rest and never returned by the API. Leave masked fields blank to keep existing values.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {courier.credentialFields.map((field) => (
                  <div key={field.key}>
                    <label className="mb-1.5 block text-[12px] font-medium text-apple-ink-muted-80">
                      {field.label}
                      {field.set ? (
                        <span className="ml-1.5 text-[10px] font-normal text-emerald-600">set</span>
                      ) : null}
                    </label>
                    <input
                      type={field.secret ? "password" : "text"}
                      autoComplete="off"
                      value={
                        draft.credentials[field.key] === "********" && !field.secret
                          ? ""
                          : (draft.credentials[field.key] ?? "")
                      }
                      onChange={(e) => setCred(field.key, e.target.value)}
                      onFocus={() => {
                        if (draft.credentials[field.key] === "********") {
                          setCred(field.key, "");
                        }
                      }}
                      placeholder={field.set ? "Saved — enter new value to change" : field.label}
                      className="h-11 w-full rounded-xl border border-apple-hairline bg-white px-3 text-[13px] outline-none focus:border-apple-primary"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Shipment settings */}
            <section>
              <h4 className="mb-3 text-[13px] font-semibold text-apple-ink">Shipment Settings</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between gap-4 rounded-xl border border-apple-hairline px-4 py-3">
                  <span className="text-[13px] font-medium text-apple-ink">Auto Create Shipment</span>
                  <input
                    type="checkbox"
                    checked={draft.shipmentSettings.autoCreateShipment}
                    onChange={(e) => setShipment("autoCreateShipment", e.target.checked)}
                    className="h-4 w-4 rounded border-apple-hairline"
                  />
                </label>
                <label className="flex items-center justify-between gap-4 rounded-xl border border-apple-hairline px-4 py-3">
                  <span className="text-[13px] font-medium text-apple-ink">Auto Sync Tracking</span>
                  <input
                    type="checkbox"
                    checked={draft.shipmentSettings.autoSyncTracking}
                    onChange={(e) => setShipment("autoSyncTracking", e.target.checked)}
                    className="h-4 w-4 rounded border-apple-hairline"
                  />
                </label>
                <label className="flex items-center justify-between gap-4 rounded-xl border border-apple-hairline px-4 py-3">
                  <span className="text-[13px] font-medium text-apple-ink">COD Enabled</span>
                  <input
                    type="checkbox"
                    checked={draft.shipmentSettings.codEnabled}
                    onChange={(e) => setShipment("codEnabled", e.target.checked)}
                    className="h-4 w-4 rounded border-apple-hairline"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-apple-ink-muted-80">
                      Auto Refresh Tracking
                    </label>
                    <select
                      value={draft.shipmentSettings.autoRefreshTracking}
                      onChange={(e) =>
                        setShipment(
                          "autoRefreshTracking",
                          e.target.value as CourierShipmentSettings["autoRefreshTracking"],
                        )
                      }
                      className="h-11 w-full rounded-xl border border-apple-hairline bg-white px-3 text-[13px] outline-none focus:border-apple-primary"
                    >
                      {REFRESH_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-apple-ink-muted-80">
                      Default Weight (kg)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={draft.shipmentSettings.defaultWeightKg}
                      onChange={(e) => setShipment("defaultWeightKg", Number(e.target.value) || 0)}
                      className="h-11 w-full rounded-xl border border-apple-hairline bg-white px-3 text-[13px] outline-none focus:border-apple-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-apple-ink-muted-80">
                      Default Delivery Type
                    </label>
                    <input
                      type="text"
                      value={draft.shipmentSettings.defaultDeliveryType}
                      onChange={(e) => setShipment("defaultDeliveryType", e.target.value)}
                      className="h-11 w-full rounded-xl border border-apple-hairline bg-white px-3 text-[13px] outline-none focus:border-apple-primary"
                    />
                  </div>
                </div>
              </div>
            </section>

            {courier.lastError ? (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{courier.lastError}</span>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleTest}
                disabled={testing || saving}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-apple-hairline bg-white px-5 text-[13px] font-medium text-apple-ink disabled:opacity-60"
              >
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plug className="h-4 w-4" />}
                Test Connection
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || testing}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-apple-primary px-5 text-[13px] font-medium text-apple-on-primary disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CourierSettingsTab({ storeId }: CourierSettingsTabProps) {
  const { data, isLoading, error, isError, refetch } = useGetStoreCouriersQuery(storeId);

  const forbidden =
    isError &&
    error &&
    typeof error === "object" &&
    "status" in error &&
    (error as { status?: number }).status === 403;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-apple-canvas-parchment px-6 py-16 text-center">
        <h3 className="text-lg font-semibold text-apple-ink">Courier Management</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-apple-ink-muted-48">
          Courier management is not included in your plan. Please upgrade to configure Pathao, RedX,
          Steadfast, Paperfly, or Sundarban.
        </p>
      </div>
    );
  }

  const couriers = data?.data?.couriers ?? [];
  const access = data?.data?.access;

  if (!access?.enabled || couriers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-apple-canvas-parchment px-6 py-16 text-center">
        <h3 className="text-lg font-semibold text-apple-ink">No couriers available</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-apple-ink-muted-48">
          Your plan or store assignment does not include any courier providers.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 text-sm font-medium text-apple-primary hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[15px] font-semibold text-apple-ink">Courier</h2>
        <p className="text-[12px] text-apple-ink-muted-48">
          Configure third-party courier integrations for this store. Credentials are encrypted and never
          exposed in API responses.
        </p>
      </div>

      <div className="space-y-3">
        {couriers.map((courier) => (
          <ProviderCard key={courier.provider} storeId={storeId} courier={courier} />
        ))}
      </div>
    </div>
  );
}

export type { CourierProviderSlug };
