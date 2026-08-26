"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Globe,
  Lock,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Radio,
  Power,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetStoreSSLCommerzConfigQuery,
  useUpdateStoreSSLCommerzConfigMutation,
  useTestStoreSSLCommerzConnectionMutation,
  useToggleStoreSSLCommerzMutation,
} from "@/redux/api/payment-api";
import { cn } from "@/lib/utils";

type SSLCommerzSettingsCardProps = {
  storeId: string;
};

export function SSLCommerzSettingsCard({ storeId }: SSLCommerzSettingsCardProps) {
  const { data, isLoading, refetch } = useGetStoreSSLCommerzConfigQuery(storeId, {
    skip: !storeId,
  });

  const [updateConfig, { isLoading: isSaving }] = useUpdateStoreSSLCommerzConfigMutation();
  const [testConnection, { isLoading: isTesting }] = useTestStoreSSLCommerzConnectionMutation();
  const [toggleGateway, { isLoading: isToggling }] = useToggleStoreSSLCommerzMutation();

  const config = data?.data;

  const [storeIdValue, setStoreIdValue] = useState("");
  const [storePassword, setStorePassword] = useState("");
  const [environment, setEnvironment] = useState<"sandbox" | "live">("sandbox");
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (config) {
      setStoreIdValue(config.storeIdValue || "");
      setEnvironment(config.environment || "sandbox");
      if (config.hasPassword) {
        setStorePassword("••••••••••••");
        setIsEditingPassword(false);
      } else {
        setStorePassword("");
        setIsEditingPassword(true);
      }
    }
  }, [config]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!storeIdValue.trim()) {
      toast.error("SSLCommerz Store ID is required.");
      return;
    }

    try {
      const payload: {
        storeIdValue: string;
        environment: "sandbox" | "live";
        storePassword?: string;
      } = {
        storeIdValue: storeIdValue.trim(),
        environment,
      };

      if (isEditingPassword && storePassword && storePassword !== "••••••••••••") {
        payload.storePassword = storePassword.trim();
      }

      await updateConfig({ storeId, data: payload }).unwrap();
      toast.success("SSLCommerz configuration saved successfully.");
      setIsEditingPassword(false);
      setTestResult(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save configuration.");
    }
  };

  const handleTestConnection = async () => {
    if (!storeIdValue.trim()) {
      toast.error("Please enter a Store ID to test.");
      return;
    }

    setTestResult(null);
    try {
      const payload: {
        storeIdValue: string;
        environment: "sandbox" | "live";
        storePassword?: string;
      } = {
        storeIdValue: storeIdValue.trim(),
        environment,
      };

      if (isEditingPassword && storePassword && storePassword !== "••••••••••••") {
        payload.storePassword = storePassword.trim();
      }

      const res = await testConnection({ storeId, data: payload }).unwrap();
      if (res.success) {
        setTestResult({ ok: true, message: res.message || "SSLCommerz configuration verified successfully." });
        toast.success("Connection test successful!");
        refetch();
      } else {
        setTestResult({ ok: false, message: res.message || "Connection test failed." });
        toast.error(res.message || "Connection test failed.");
      }
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to connect to SSLCommerz server.";
      setTestResult({ ok: false, message: msg });
      toast.error(msg);
    }
  };

  const handleToggle = async () => {
    if (!config?.isEnabled && (!storeIdValue || (!config?.hasPassword && !storePassword))) {
      toast.error("Please configure and save Store ID & Password before enabling.");
      return;
    }

    const nextState = !config?.isEnabled;
    try {
      const res = await toggleGateway({ storeId, enabled: nextState }).unwrap();
      toast.success(res.message || (nextState ? "SSLCommerz enabled" : "SSLCommerz disabled"));
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to toggle SSLCommerz.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-white p-12">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  const isConfigured = Boolean(config?.storeIdValue && config?.hasPassword);
  const isEnabled = Boolean(config?.isEnabled);
  const isVerified = Boolean(config?.isVerified);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
      {/* Header Banner */}
      <div className="border-b border-zinc-100 bg-gradient-to-r from-zinc-900 to-zinc-800 px-6 py-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md">
              <Globe className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold tracking-tight text-white">SSLCommerz Payment Gateway</h3>
                <span className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-medium tracking-wide text-amber-300">
                  Cards & Banking
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-300">
                Direct multi-tenant gateway integration for automated Visa, Mastercard, bKash, Nagad & Net Banking checkout.
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {isEnabled ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Enabled & Active
              </span>
            ) : isConfigured ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-500/20 border border-zinc-400/30 px-3 py-1 text-xs font-semibold text-zinc-300">
                <span className="h-2 w-2 rounded-full bg-zinc-400" />
                Disabled
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-1 text-xs font-semibold text-amber-300">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Not Configured
              </span>
            )}

            {isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/20 border border-sky-400/30 px-2.5 py-1 text-xs font-semibold text-sky-300" title="Verified with SSLCommerz API">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Configuration Body */}
      <div className="p-6 space-y-6">
        {/* Environment Selection & Toggle Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-zinc-50 p-4 border border-zinc-200/60">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Gateway Environment</span>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEnvironment("sandbox")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all",
                  environment === "sandbox"
                    ? "bg-amber-500 text-white shadow-xs font-semibold"
                    : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
                )}
              >
                <Radio className={cn("h-3.5 w-3.5", environment === "sandbox" ? "text-white" : "text-zinc-400")} />
                Sandbox (Test Mode)
              </button>
              <button
                type="button"
                onClick={() => setEnvironment("live")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all",
                  environment === "live"
                    ? "bg-emerald-600 text-white shadow-xs font-semibold"
                    : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
                )}
              >
                <Radio className={cn("h-3.5 w-3.5", environment === "live" ? "text-white" : "text-zinc-400")} />
                Live (Production)
              </button>
            </div>
          </div>

          {/* Quick Enable/Disable Switch */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-zinc-900">Checkout Availability</p>
              <p className="text-[11px] text-zinc-500">
                {isEnabled ? "Accepting payments at checkout" : "Hidden from checkout"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              disabled={isToggling || (!isConfigured && !storeIdValue)}
              className={cn(
                "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50",
                isEnabled ? "bg-emerald-600" : "bg-zinc-300"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                  isEnabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Store ID */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
                <Key className="h-3.5 w-3.5 text-zinc-400" />
                Store ID
              </label>
              <input
                type="text"
                placeholder="e.g. yourstore001live or testbox"
                value={storeIdValue}
                onChange={(e) => setStoreIdValue(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-zinc-400">
                Your unique merchant Store ID provided by SSLCommerz.
              </p>
            </div>

            {/* Store Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
                  <Lock className="h-3.5 w-3.5 text-zinc-400" />
                  Store Password
                </label>
                {config?.hasPassword && !isEditingPassword && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPassword(true);
                      setStorePassword("");
                    }}
                    className="text-[11px] font-semibold text-zinc-900 hover:underline"
                  >
                    Change Password
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={config?.hasPassword && !isEditingPassword ? "••••••••••••" : "Enter Store Password"}
                  value={storePassword}
                  readOnly={!isEditingPassword && config?.hasPassword}
                  onChange={(e) => setStorePassword(e.target.value)}
                  className={cn(
                    "h-10 w-full rounded-xl border border-zinc-200 px-3.5 pr-10 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none",
                    !isEditingPassword && config?.hasPassword ? "bg-zinc-50 text-zinc-500 cursor-not-allowed" : "bg-white"
                  )}
                />
                {isEditingPassword && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Stored with AES-256-GCM encryption at rest. Never exposed in plain text.
              </p>
            </div>
          </div>

          {/* Test Connection Banner / Feedback */}
          {testResult && (
            <div
              className={cn(
                "flex items-start gap-2.5 rounded-xl p-3.5 text-xs font-medium",
                testResult.ok
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              )}
            >
              {testResult.ok ? (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{testResult.ok ? "Verification Passed" : "Verification Failed"}</p>
                <p className="mt-0.5 text-[11px] opacity-90">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Last Tested Info */}
          {config?.lastTestedAt && !testResult && (
            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
              <span>
                Last tested: {new Date(config.lastTestedAt).toLocaleString()}
              </span>
              {config.lastError && (
                <span className="text-rose-600 font-medium truncate max-w-xs">
                  Error: {config.lastError}
                </span>
              )}
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || isSaving || !storeIdValue}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors disabled:opacity-50"
              >
                {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Test Connection
              </button>

              <a
                href="https://developer.sslcommerz.com/doc/v4/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-800 transition-colors px-2"
              >
                Documentation <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSaving || isTesting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Configuration
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
