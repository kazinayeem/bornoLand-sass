"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { useGetPlanPriceQuery, useInitiateCheckoutMutation } from "@/redux/api/billing-api";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const PAYMENT_METHODS = [
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "sslcommerz", label: "SSLCommerz (Cards / Net Banking)" },
  { value: "bank", label: "Manual Bank Transfer" },
] as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

export function RenewSubscriptionModal({
  storeId,
  planId,
  isYearly,
  onClose,
}: {
  storeId: string;
  planId: string;
  isYearly: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const duration = isYearly ? "yearly" : "monthly";

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bkash");
  const [error, setError] = useState<string | null>(null);

  const { data: priceData, isLoading: isPriceLoading } = useGetPlanPriceQuery(
    { planId, duration },
    { skip: !planId }
  );

  const [initiateCheckout, { isLoading: isSubmitting }] = useInitiateCheckoutMutation();

  const amount = priceData?.data?.amount;
  const planName = (priceData?.data?.plan as { name?: string } | undefined)?.name ?? "Selected";

  async function handlePayNow() {
    setError(null);

    if (!amount) {
      setError("Price information is not available. Please try again.");
      return;
    }

    try {
      const result = await initiateCheckout({
        storeId,
        planId,
        duration,
        paymentMethod,
      }).unwrap();

      const redirectUrl = result.data?.mockRedirectUrl;
      if (!redirectUrl) {
        setError("Failed to create payment session. Please try again.");
        return;
      }

      toast.success("Redirecting to payment gateway…");
      onClose();
      router.push(redirectUrl);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        "Something went wrong. Please try again.";
      setError(msg);
    }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Confirm Subscription"
      description={`You are about to subscribe to the ${planName} plan.`}
      size="md"
    >
      {isPriceLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Order summary */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex justify-between border-b border-zinc-200 pb-3">
              <span className="text-sm font-medium text-zinc-600">Plan</span>
              <span className="text-sm font-semibold text-zinc-900">
                {planName} ({duration})
              </span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 py-3">
              <span className="text-sm font-medium text-zinc-600">Amount</span>
              <span className="text-sm font-semibold text-zinc-900">
                ৳{amount?.toLocaleString() ?? "—"}
              </span>
            </div>
            <div className="flex justify-between pt-3">
              <span className="text-base font-bold text-zinc-900">Total</span>
              <span className="text-base font-bold text-indigo-600">
                ৳{amount?.toLocaleString() ?? "—"}
              </span>
            </div>
          </div>

          {/* Payment method */}
          <div className="space-y-2">
            <label htmlFor="payment-method-select" className="text-sm font-medium text-zinc-700">
              Payment Method
            </label>
            <div className="relative">
              <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <select
                id="payment-method-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                disabled={isSubmitting}
                className="flex h-10 w-full appearance-none rounded-md border border-zinc-300 bg-white pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePayNow}
              disabled={isSubmitting || isPriceLoading || !amount}
              className="flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Processing…" : "Pay Now"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
