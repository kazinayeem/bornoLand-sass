"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  ArrowLeft,
  RefreshCcw,
  ChevronRight,
  AlertCircle,
  Calendar,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useGetPlansQuery, type Plan } from "@/redux/api/store-api";
import {
  useGetPlatformPaymentMethodsQuery,
  useSubmitSubscriptionPaymentMutation,
} from "@/redux/api/subscription-payment-api";
import { useGetBillingConfigQuery, type SubscriptionDuration } from "@/redux/api/billing-api";
import { formatBDT } from "@/lib/store-status";
import { Badge } from "@/components/ui/badge";

const DURATION_OPTIONS: { value: SubscriptionDuration; label: string; months: number | null }[] = [
  { value: "monthly", label: "1 Month", months: 1 },
  { value: "quarterly", label: "3 Months", months: 3 },
  { value: "half_yearly", label: "6 Months", months: 6 },
  { value: "yearly", label: "12 Months", months: 12 },
];

function getPlanAmount(plan: Plan, duration: string): number {
  const pricing = plan.pricing ?? {};
  if (duration === "monthly") return pricing.monthly ?? plan.priceBDT ?? 0;
  if (duration === "quarterly") return pricing.quarterly ?? (plan.priceBDT ?? 0) * 3;
  if (duration === "half_yearly") return pricing.halfYearly ?? (plan.priceBDT ?? 0) * 6;
  if (duration === "yearly") return pricing.yearly ?? plan.priceYearly ?? (plan.priceBDT ?? 0) * 12;
  return pricing.lifetime ?? 0;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function RenewalFlow({
  storeId,
  storeName,
  currentPlanId,
  currentExpireDate,
  onClose,
}: {
  storeId: string;
  storeName: string;
  currentPlanId?: string;
  currentExpireDate?: string | null;
  onClose: () => void;
}) {
  const { data: plansData } = useGetPlansQuery();
  const { data: methodsData } = useGetPlatformPaymentMethodsQuery();
  const { data: billingConfigData } = useGetBillingConfigQuery();
  const [submitPayment, { isLoading: submitting }] = useSubmitSubscriptionPaymentMutation();

  const plans = plansData?.data?.plans ?? [];
  const methods = methodsData?.data?.methods ?? [];
  const billingConfig = billingConfigData?.data;
  const activePlans = plans.filter((p) => p.visible !== false && p.isActive);
  const currentPlan = activePlans.find((p) => p._id === currentPlanId);

  const [selectedPlanId, setSelectedPlanId] = useState(currentPlanId || activePlans[0]?._id || "");
  const [duration, setDuration] = useState<SubscriptionDuration>("monthly");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"plan" | "payment" | "confirm" | "success">("plan");

  const selectedPlan = activePlans.find((p) => p._id === selectedPlanId);
  const selectedMethod = methods.find((m) => m.type === paymentMethod);
  const paymentAmount = selectedPlan ? getPlanAmount(selectedPlan, duration) : 0;

  const newExpireDate = useMemo(() => {
    const base = currentExpireDate ? new Date(currentExpireDate) : new Date();
    if (base.getTime() < Date.now()) {
      const dur = DURATION_OPTIONS.find((d) => d.value === duration);
      const exp = new Date();
      if (dur?.months) exp.setMonth(exp.getMonth() + dur.months);
      return exp;
    }
    const dur = DURATION_OPTIONS.find((d) => d.value === duration);
    if (dur?.months) base.setMonth(base.getMonth() + dur.months);
    return base;
  }, [currentExpireDate, duration]);

  const handleSubmit = async () => {
    if (!selectedPlan || !paymentMethod || !senderNumber || !transactionId) return;
    try {
      await submitPayment({
        storeId,
        planId: selectedPlan._id,
        duration,
        amount: paymentAmount,
        paymentMethod: paymentMethod as any,
        senderNumber,
        transactionId,
        notes: `Renewal: ${notes || `${storeName} subscription renewal`}`,
      }).unwrap();
      setStep("success");
      toast.success("Renewal payment submitted for approval");
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "data" in err
        ? (err as { data?: { message?: string } }).data?.message
        : undefined;
      toast.error(message ?? "Failed to submit renewal");
    }
  };

  const canProceed = senderNumber.length >= 6 && transactionId.length >= 4;

  return (
    <div className="mx-auto max-w-xl">
      <AnimatePresence mode="wait">
        {step === "plan" && (
          <motion.div key="plan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="text-center mb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-3">
                <RefreshCcw className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-apple-ink">Renew Subscription</h2>
              <p className="text-sm text-apple-ink-muted-48 mt-1">{storeName}</p>
              {currentExpireDate && (
                <p className="text-xs text-apple-ink-muted-48 mt-1">
                  Current expiry: {formatDate(new Date(currentExpireDate))}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-apple-ink-muted-80 mb-2">Select Plan</p>
              <div className="grid gap-2">
                {activePlans.map((plan) => (
                  <button
                    key={plan._id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan._id)}
                    className={`flex items-center justify-between rounded-xl border-2 p-3 text-left transition-all ${
                      selectedPlanId === plan._id
                        ? "border-zinc-900 bg-apple-canvas-parchment"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-apple-ink">{plan.name}</p>
                      <p className="text-xs text-apple-ink-muted-48">{plan.description || ""}</p>
                    </div>
                    <p className="text-lg font-bold text-apple-ink">
                      {plan.isCustomPrice ? "Custom" : formatBDT(plan.priceBDT ?? 0)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-apple-ink-muted-80 mb-2">Renewal Duration</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DURATION_OPTIONS.map((d) => {
                  const price = selectedPlan ? getPlanAmount(selectedPlan, d.value) : 0;
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDuration(d.value)}
                      className={`rounded-xl border-2 p-3 text-center transition-all ${
                        duration === d.value
                          ? "border-zinc-900 bg-apple-canvas-parchment"
                          : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <p className="text-sm font-semibold text-apple-ink">{d.label}</p>
                      <p className="text-xs text-apple-ink-muted-48">{formatBDT(price)}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedPlan && (
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">New Expiry Date</p>
                    <p className="text-blue-600">{formatDate(newExpireDate)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep("payment")}
                disabled={!selectedPlanId}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === "payment" && (
          <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-apple-ink">Payment Details</h2>
              <p className="text-sm text-apple-ink-muted-48 mt-1">
                Total: <strong>{formatBDT(paymentAmount)}</strong> for {DURATION_OPTIONS.find((d) => d.value === duration)?.label}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {methods.filter((m) => m.enabled).map((method) => (
                <button
                  key={method.type}
                  type="button"
                  onClick={() => setPaymentMethod(method.type)}
                  className={`rounded-xl border-2 p-3 text-center transition-all ${
                    paymentMethod === method.type
                      ? "border-zinc-900 bg-apple-canvas-parchment"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <p className="text-sm font-semibold text-apple-ink">{method.label}</p>
                </button>
              ))}
            </div>

            {selectedMethod && (
              <div className="rounded-xl border border-zinc-200 bg-apple-canvas-parchment p-4 text-sm space-y-1">
                <p className="font-medium text-apple-ink">Send to:</p>
                <p className="text-lg font-bold tracking-wide text-apple-ink">{selectedMethod.accountNumber}</p>
                {selectedMethod.accountName && <p className="text-apple-ink-muted-80">{selectedMethod.accountName}</p>}
                {selectedMethod.instructions && <p className="text-xs text-apple-ink-muted-48 mt-2">{selectedMethod.instructions}</p>}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-apple-ink-muted-80">Sender Number</label>
                <input
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-apple-ink-muted-80">Transaction ID</label>
                <input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Transaction ID"
                  className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-apple-ink-muted-80">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any additional note..."
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep("plan")}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-apple-ink-muted-80"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep("confirm")}
                disabled={!canProceed}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                Review <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === "confirm" && (
          <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-apple-ink">Confirm Renewal</h2>
              <p className="text-sm text-apple-ink-muted-48 mt-1">Review before submitting</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-apple-canvas-parchment/50 p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-apple-ink-muted-48">Plan</span>
                <span className="font-semibold text-apple-ink">{selectedPlan?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-apple-ink-muted-48">Duration</span>
                <span className="font-semibold text-apple-ink capitalize">{DURATION_OPTIONS.find((d) => d.value === duration)?.label}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-zinc-200 pt-3">
                <span className="text-apple-ink-muted-48">Total</span>
                <span className="text-lg font-bold text-apple-ink">{formatBDT(paymentAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-apple-ink-muted-48">New Expiry</span>
                <span className="font-semibold text-apple-ink">{formatDate(newExpireDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-apple-ink-muted-48">Method</span>
                <Badge variant="default" className="bg-white border border-zinc-200">{selectedMethod?.label || paymentMethod}</Badge>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep("payment")}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-apple-ink-muted-80"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Submitting..." : "Confirm Renewal"}
              </button>
            </div>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center py-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-apple-ink">Renewal Submitted!</h2>
              <p className="text-apple-ink-muted-48 mt-2 max-w-sm mx-auto">
                Your renewal payment is pending admin approval. Your store will be updated once approved.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-700">
              <Clock className="h-4 w-4" />
              Pending Approval
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
