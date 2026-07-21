"use client";

import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useGetPlansQuery } from "@/redux/api/store-api";
import {
  useGetPlatformPaymentMethodsQuery,
  useGetStoreSubscriptionPaymentsQuery,
  useSubmitSubscriptionPaymentMutation,
} from "@/redux/api/subscription-payment-api";
import { useGetBillingConfigQuery, useGetBillingStoreSubscriptionQuery, type SubscriptionDuration } from "@/redux/api/billing-api";
import type { Store, Plan } from "@/redux/api/store-api";
import { formatBDT, resolveStoreStatus } from "@/lib/store-status";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DURATION_LABELS: Record<SubscriptionDuration, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  half_yearly: "Half Yearly",
  yearly: "Yearly",
  lifetime: "Lifetime",
};

function getPlanAmount(plan: Plan, duration: SubscriptionDuration): number {
  const pricing = plan.pricing ?? {};
  if (duration === "monthly") return pricing.monthly ?? plan.priceBDT;
  if (duration === "quarterly") return pricing.quarterly ?? plan.priceBDT * 3;
  if (duration === "half_yearly") return pricing.halfYearly ?? plan.priceBDT * 6;
  if (duration === "yearly") return pricing.yearly ?? plan.priceYearly ?? plan.priceBDT * 12;
  return pricing.lifetime ?? 0;
}

export function StoreSubscriptionBilling({ store }: { store: Store }) {
  const { data: plansData } = useGetPlansQuery();
  const { data: methodsData } = useGetPlatformPaymentMethodsQuery();
  const { data: paymentsData, isLoading: paymentsLoading } = useGetStoreSubscriptionPaymentsQuery(store._id);
  const { data: billingConfigData } = useGetBillingConfigQuery();
  const { data: subscriptionData } = useGetBillingStoreSubscriptionQuery(store._id);
  const [submitPayment, { isLoading: submitting }] = useSubmitSubscriptionPaymentMutation();

  const plans = plansData?.data?.plans ?? [];
  const methods = methodsData?.data?.methods ?? [];
  const payments = paymentsData?.data?.payments ?? [];
  const billingConfig = billingConfigData?.data;
  const subscription = subscriptionData?.data?.subscription;
  const remainingDays = subscriptionData?.data?.remainingDays;

  const enabledDurations = useMemo(() => {
    const config = billingConfig?.enabledDurations ?? {
      monthly: true,
      quarterly: true,
      halfYearly: true,
      yearly: true,
      lifetime: false,
    };
    return (Object.keys(DURATION_LABELS) as SubscriptionDuration[]).filter((d) => {
      const key = d === "half_yearly" ? "halfYearly" : d;
      return config[key] !== false;
    });
  }, [billingConfig]);

  const [selectedPlanId, setSelectedPlanId] = useState(plans.find((p) => p.slug === store.plan)?._id ?? plans[0]?._id ?? "");
  const [duration, setDuration] = useState<SubscriptionDuration>("monthly");
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "rocket" | "bank">("bkash");
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (enabledDurations.length > 0 && !enabledDurations.includes(duration)) {
      setDuration(enabledDurations[0]);
    }
  }, [enabledDurations, duration]);

  const selectedPlan = plans.find((p) => p._id === selectedPlanId);
  const selectedMethod = methods.find((m) => m.type === paymentMethod);
  const status = resolveStoreStatus(store);
  const paymentAmount = selectedPlan ? getPlanAmount(selectedPlan, duration) : 0;

  const currentPlan = useMemo(
    () => plans.find((p) => p.slug === store.plan) ?? plans[0],
    [plans, store.plan]
  );

  const handleSubmit = async () => {
    if (!selectedPlan) return;
    try {
      await submitPayment({
        storeId: store._id,
        planId: selectedPlan._id,
        duration,
        amount: paymentAmount,
        paymentMethod,
        senderNumber,
        transactionId,
        notes,
      }).unwrap();
      toast.success("Payment submitted for approval");
      setSenderNumber("");
      setTransactionId("");
      setNotes("");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message ?? "Failed to submit payment");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Subscription is tied to this store only.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold text-apple-ink">{currentPlan?.name ?? store.plan}</p>
            <p className="text-sm text-apple-ink-muted-48">
              {currentPlan?.isCustomPrice ? "Custom pricing" : `${formatBDT(currentPlan?.priceBDT ?? 0)} / month`}
            </p>
            {remainingDays !== null && remainingDays !== undefined && (
              <p className="mt-1 text-xs text-apple-ink-muted-48">{remainingDays} day(s) remaining</p>
            )}
            {subscription?.expireDate && (
              <p className="text-xs text-apple-ink-muted-48">
                Expires {new Date(subscription.expireDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <Badge variant={status === "active" || status === "trial" ? "success" : "warning"}>
            {status.replace("_", " ")}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upgrade Plan</CardTitle>
          <CardDescription>Choose a plan, duration, and pay manually via bKash, Nagad, Rocket, or bank transfer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {plans.filter((p) => p.visible !== false).map((plan) => (
              <button
                key={plan._id}
                type="button"
                onClick={() => setSelectedPlanId(plan._id)}
                className={`rounded-apple-lg border-2 p-4 text-left transition-all ${
                  selectedPlanId === plan._id ? "border-zinc-900 bg-apple-canvas-parchment" : "border-apple-hairline hover:border-zinc-300"
                }`}
              >
                <p className="font-semibold text-apple-ink">{plan.name}</p>
                <p className="mt-1 text-lg font-bold">
                  {plan.isCustomPrice ? "Custom" : formatBDT(plan.priceBDT)}
                </p>
              </button>
            ))}
          </div>

          {enabledDurations.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-apple-ink-muted-80">Billing Duration</p>
              <div className="flex flex-wrap gap-2">
                {enabledDurations.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      duration === d ? "border-zinc-900 bg-apple-canvas-parchment font-medium" : "border-apple-hairline"
                    }`}
                  >
                    {DURATION_LABELS[d]}
                  </button>
                ))}
              </div>
              {selectedPlan && !selectedPlan.isCustomPrice && (
                <p className="mt-2 text-sm text-apple-ink-muted-80">
                  Total: <span className="font-semibold text-apple-ink">{formatBDT(paymentAmount)}</span>
                </p>
              )}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {methods.map((method) => (
              <button
                key={method.type}
                type="button"
                onClick={() => setPaymentMethod(method.type)}
                className={`rounded-xl border px-4 py-3 text-left text-sm ${
                  paymentMethod === method.type ? "border-zinc-900 bg-apple-canvas-parchment" : "border-apple-hairline"
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>

          {selectedMethod && (
            <div className="rounded-apple-lg border border-apple-hairline bg-apple-canvas-parchment p-4 text-sm">
              <p className="font-medium text-apple-ink">Send payment to</p>
              <p className="mt-1 text-lg font-bold tracking-wide text-apple-ink">{selectedMethod.accountNumber}</p>
              {selectedMethod.merchantNumber && (
                <p className="text-apple-ink-muted-80">Merchant: {selectedMethod.merchantNumber}</p>
              )}
              {selectedMethod.personalNumber && (
                <p className="text-apple-ink-muted-80">Personal: {selectedMethod.personalNumber}</p>
              )}
              {selectedMethod.accountName && <p className="text-apple-ink-muted-80">{selectedMethod.accountName}</p>}
              {selectedMethod.bankName && (
                <p className="text-apple-ink-muted-80">
                  {selectedMethod.bankName}
                  {selectedMethod.branchName ? ` · ${selectedMethod.branchName}` : ""}
                </p>
              )}
              {selectedMethod.qrCodeUrl && (
                <img src={selectedMethod.qrCodeUrl} alt="QR Code" className="mt-3 h-32 w-32 rounded-lg border" />
              )}
              {selectedMethod.instructions && <p className="mt-2 text-apple-ink-muted-48">{selectedMethod.instructions}</p>}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-apple-ink-muted-80">Sender Number</label>
              <input
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                className="h-10 w-full rounded-xl border border-apple-hairline px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-apple-ink-muted-80">Transaction ID</label>
              <input
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="h-10 w-full rounded-xl border border-apple-hairline px-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-apple-ink-muted-80">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-apple-hairline px-3 py-2 text-sm"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !senderNumber || !transactionId || !selectedPlan || (paymentAmount <= 0 && !selectedPlan.isCustomPrice)}
            className="inline-flex items-center gap-2 rounded-xl bg-apple-ink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Payment
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-apple-ink-muted-48" />
            </div>
          ) : payments.length === 0 ? (
            <p className="py-6 text-center text-sm text-apple-ink-muted-48">No payments submitted yet.</p>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => (
                <div
                  key={payment._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-apple-divider-soft px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-apple-ink">
                      {typeof payment.planId === "object" ? payment.planId.name : "Plan"} · {formatBDT(payment.amount)}
                      {payment.duration && (
                        <span className="ml-1 text-xs text-apple-ink-muted-48">({payment.duration.replace("_", " ")})</span>
                      )}
                    </p>
                    <p className="text-xs text-apple-ink-muted-48">
                      {payment.paymentMethod} · {payment.transactionId}
                    </p>
                  </div>
                  <Badge
                    variant={
                      payment.status === "approved"
                        ? "success"
                        : payment.status === "rejected"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
