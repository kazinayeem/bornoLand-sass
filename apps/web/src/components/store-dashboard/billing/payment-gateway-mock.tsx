"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { useCheckoutCallbackMutation } from "@/redux/api/billing-api";
import { Loader2, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type GatewayState = "pending" | "confirming" | "success" | "failed";

export function PaymentGatewayMock() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { store, storeId } = useStorePage();

  const paymentId = searchParams.get("paymentId") ?? "";
  const [state, setState] = useState<GatewayState>("pending");
  const [countdown, setCountdown] = useState(5);

  const [checkoutCallback] = useCheckoutCallbackMutation();

  const handleCallback = useCallback(
    async (status: "success" | "cancelled") => {
      if (!paymentId) return;
      setState("confirming");
      try {
        await checkoutCallback({ paymentId, status }).unwrap();
        if (status === "success") {
          setState("success");
          toast.success("Payment successful! Subscription activated.");
        } else {
          setState("failed");
          toast.error("Payment cancelled.");
        }
      } catch {
        setState("failed");
        toast.error("Something went wrong confirming your payment.");
      }
    },
    [paymentId, checkoutCallback]
  );

  // Auto-redirect after success/fail
  useEffect(() => {
    if (state !== "success" && state !== "failed") return;
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id);
          const slug = store?.slug ?? "";
          router.push(`/store/${slug}/billing`);
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state, store?.slug, router]);

  if (!paymentId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fb]">
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-md">
          <XCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <h2 className="text-lg font-semibold text-zinc-900">Invalid Payment Link</h2>
          <p className="mt-1 text-sm text-zinc-500">No payment ID was provided.</p>
          <button
            onClick={() => router.push(`/store/${store?.slug}/billing`)}
            className="mt-4 rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Back to Billing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-900">Secure Payment</h1>
            <p className="text-xs text-zinc-500">BornoLand Payment Gateway (Sandbox)</p>
          </div>
        </div>

        {/* Divider */}
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            🧪 Sandbox Mode — No real payment processed
          </p>
        </div>

        {/* State: Pending */}
        {state === "pending" && (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <p className="text-sm text-zinc-500">
                Simulate a payment outcome for your subscription.
              </p>
              <p className="text-xs text-zinc-400">Payment ID: {paymentId}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleCallback("success")}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Simulate Success
              </button>
              <button
                onClick={() => handleCallback("cancelled")}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 py-3 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-100"
              >
                <XCircle className="h-4 w-4" />
                Cancel Payment
              </button>
            </div>
          </div>
        )}

        {/* State: Confirming */}
        {state === "confirming" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-zinc-700">Confirming payment…</p>
            <p className="text-xs text-zinc-400">Please wait while we activate your subscription.</p>
          </div>
        )}

        {/* State: Success */}
        {state === "success" && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Payment Successful!</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Your subscription has been activated successfully.
              </p>
            </div>
            <div className="mt-2 rounded-lg bg-zinc-100 px-4 py-2">
              <p className="text-sm text-zinc-600">
                Redirecting to Billing in{" "}
                <span className="font-bold text-indigo-600">{countdown}s</span>
              </p>
            </div>
            <button
              onClick={() => router.push(`/store/${store?.slug}/billing`)}
              className="mt-1 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Go to Billing Now
            </button>
          </div>
        )}

        {/* State: Failed / Cancelled */}
        {state === "failed" && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Payment Cancelled</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Your payment was not completed. Your subscription was not changed.
              </p>
            </div>
            <div className="mt-2 rounded-lg bg-zinc-100 px-4 py-2">
              <p className="text-sm text-zinc-600">
                Redirecting to Billing in{" "}
                <span className="font-bold text-red-500">{countdown}s</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setState("pending")}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push(`/store/${store?.slug}/billing`)}
                className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Back to Billing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
