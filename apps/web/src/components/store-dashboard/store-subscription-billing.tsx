"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useGetPlansQuery } from "@/redux/api/store-api";
import {
  useGetPlatformPaymentMethodsQuery,
  useGetStoreSubscriptionPaymentsQuery,
  useSubmitSubscriptionPaymentMutation,
} from "@/redux/api/subscription-payment-api";
import type { Store } from "@/redux/api/store-api";
import { formatBDT, resolveStoreStatus } from "@/lib/store-status";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function StoreSubscriptionBilling({ store }: { store: Store }) {
  const { data: plansData } = useGetPlansQuery();
  const { data: methodsData } = useGetPlatformPaymentMethodsQuery();
  const { data: paymentsData, isLoading: paymentsLoading } = useGetStoreSubscriptionPaymentsQuery(store._id);
  const [submitPayment, { isLoading: submitting }] = useSubmitSubscriptionPaymentMutation();

  const plans = plansData?.data?.plans ?? [];
  const methods = methodsData?.data?.methods ?? [];
  const payments = paymentsData?.data?.payments ?? [];

  const [selectedPlanId, setSelectedPlanId] = useState(plans.find((p) => p.slug === store.plan)?._id ?? plans[0]?._id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "rocket" | "bank">("bkash");
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");

  const selectedPlan = plans.find((p) => p._id === selectedPlanId);
  const selectedMethod = methods.find((m) => m.type === paymentMethod);
  const status = resolveStoreStatus(store);

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
        amount: selectedPlan.priceBDT,
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
            <p className="text-2xl font-semibold text-zinc-900">{currentPlan?.name ?? store.plan}</p>
            <p className="text-sm text-zinc-500">{formatBDT(currentPlan?.priceBDT ?? 0)} / month</p>
          </div>
          <Badge variant={status === "active" || status === "trial" ? "success" : "warning"}>
            {status.replace("_", " ")}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upgrade Plan</CardTitle>
          <CardDescription>Choose a plan and pay manually via bKash, Nagad, Rocket, or bank transfer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <button
                key={plan._id}
                type="button"
                onClick={() => setSelectedPlanId(plan._id)}
                className={`rounded-2xl border-2 p-4 text-left transition-all ${
                  selectedPlanId === plan._id ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <p className="font-semibold text-zinc-900">{plan.name}</p>
                <p className="mt-1 text-lg font-bold">{formatBDT(plan.priceBDT)}</p>
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {methods.map((method) => (
              <button
                key={method.type}
                type="button"
                onClick={() => setPaymentMethod(method.type)}
                className={`rounded-xl border px-4 py-3 text-left text-sm ${
                  paymentMethod === method.type ? "border-zinc-900 bg-zinc-50" : "border-zinc-200"
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>

          {selectedMethod && (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm">
              <p className="font-medium text-zinc-900">Send payment to</p>
              <p className="mt-1 text-lg font-bold tracking-wide text-zinc-900">{selectedMethod.accountNumber}</p>
              {selectedMethod.accountName && <p className="text-zinc-600">{selectedMethod.accountName}</p>}
              {selectedMethod.instructions && <p className="mt-2 text-zinc-500">{selectedMethod.instructions}</p>}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">Sender Number</label>
              <input
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">Transaction ID</label>
              <input
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !senderNumber || !transactionId || !selectedPlan}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
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
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            </div>
          ) : payments.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">No payments submitted yet.</p>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => (
                <div
                  key={payment._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-100 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {typeof payment.planId === "object" ? payment.planId.name : "Plan"} · {formatBDT(payment.amount)}
                    </p>
                    <p className="text-xs text-zinc-500">
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
