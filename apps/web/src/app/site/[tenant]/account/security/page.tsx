"use client";

import { motion } from "framer-motion";
import { History, Shield, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";

import { CustomerAccountShell } from "@/components/storefront/customer-account-shell";
import { Button } from "@/components/ui/button";
import { useGetCustomerSessionsQuery, useLogoutAllCustomerDevicesMutation } from "@/redux/api/customer-api";
import { useAppDispatch } from "@/hooks/redux";
import { clearCustomer } from "@/redux/slices/customer-slice";
import { resolveStoreHref } from "@/lib/store-href";

export default function SecurityAccountPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname() || "";

  const { data, isLoading, isFetching } = useGetCustomerSessionsQuery();
  const [logoutAll, { isLoading: loggingOut }] = useLogoutAllCustomerDevicesMutation();

  const sessions = data?.data?.sessions ?? [];
  const loginHistory = data?.data?.loginHistory ?? [];

  const onLogoutAll = async () => {
    try {
      await logoutAll().unwrap();
      localStorage.removeItem("customer_token");
      dispatch(clearCustomer());
      window.dispatchEvent(new Event("auth-change"));
      toast.success("Logged out all devices");
      router.push(resolveStoreHref("/", pathname));
    } catch {
      toast.error("Could not log out devices");
    }
  };

  return (
    <CustomerAccountShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Security</h1>
          <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
            Review active sessions and manage device access.
          </p>
        </div>

        <div className="space-y-3 rounded-apple-lg border p-4" style={{ borderColor: "#E5E7EB" }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <p className="text-sm font-semibold">Active sessions</p>
            </div>

            <Button variant="outline" onClick={() => void onLogoutAll()} disabled={loggingOut || sessions.length === 0 || isLoading}>
              <LogOut className="h-4 w-4" /> Logout all devices
            </Button>
          </div>

          {isLoading ? (
            <div className="h-24 animate-pulse rounded-apple-lg bg-apple-canvas-parchment" />
          ) : sessions.length === 0 ? (
            <p className="text-sm" style={{ color: "#6B7280" }}>
              No active sessions.
            </p>
          ) : (
            <div className="space-y-2">
              {sessions.map((s: any) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-apple-lg border p-4"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{s.device || "Browser"}</p>
                      <p className="mt-1 text-xs" style={{ color: "#6B7280" }}>
                        Started: {s.startedAt ? new Date(s.startedAt).toLocaleString() : "—"}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: "#6B7280" }}>
                        IP: {s.ipAddress || "—"}
                      </p>
                    </div>
                    {s.isActive ? <span className="text-xs font-semibold">Active</span> : null}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-apple-lg border p-4" style={{ borderColor: "#E5E7EB" }}>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <p className="text-sm font-semibold">Login history</p>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-apple-lg bg-apple-canvas-parchment" />
              ))}
            </div>
          ) : loginHistory.length === 0 ? (
            <p className="text-sm" style={{ color: "#6B7280" }}>
              No history yet.
            </p>
          ) : (
            <div className="space-y-2">
              {loginHistory.map((h: any) => (
                <div key={h._id ?? h.createdAt ?? Math.random()} className="rounded-apple-lg border p-4" style={{ borderColor: "#E5E7EB" }}>
                  <p className="text-sm font-semibold" style={{ color: "#111111" }}>
                    {h.createdAt ? new Date(h.createdAt).toLocaleString() : "—"}
                  </p>
                </div>
              ))}
            </div>
          )}

          {isFetching ? <p className="text-xs" style={{ color: "#6B7280" }}>Updating…</p> : null}
        </div>

        <div className="space-y-2 rounded-apple-lg border p-4" style={{ borderColor: "#E5E7EB" }}>
          <p className="text-sm font-semibold">Change password</p>
          <p className="text-sm" style={{ color: "#6B7280" }}>
            Update your password regularly.
          </p>
          <Button onClick={() => router.push(resolveStoreHref("/account/password", pathname))} className="mt-2">
            Go to Change Password
          </Button>
        </div>
      </div>
    </CustomerAccountShell>
  );
}
