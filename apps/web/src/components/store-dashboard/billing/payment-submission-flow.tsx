"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  ArrowLeft,
  CreditCard,
  Upload,
  Smartphone,
  Building2,
  ChevronRight,
  Banknote,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetPlatformPaymentMethodsQuery,
  useSubmitSubscriptionPaymentMutation,
  type PlatformPaymentMethod,
} from "@/redux/api/subscription-payment-api";
import { useGetBillingConfigQuery, type SubscriptionDuration } from "@/redux/api/billing-api";
import type { Plan } from "@/redux/api/store-api";
import { formatBDT } from "@/lib/store-status";
import { Badge } from "@/components/ui/badge";

const DURATION_LABELS: Record<string, string> = {
  monthly: "1 Month",
  quarterly: "3 Months",
  half_yearly: "6 Months",
  yearly: "12 Months",
  lifetime: "Lifetime",
};

const DURATION_MONTHS: Record<string, number | null> = {
  monthly: 1,
  quarterly: 3,
  half_yearly: 6,
  yearly: 12,
  lifetime: null,
};

const METHOD_ICONS: Record<string, typeof CreditCard> = {
  bkash: Smartphone,
  nagad: Smartphone,
  rocket: Smartphone,
  bank: Building2,
};

const METHOD_COLORS: Record<string, string> = {
  bkash: "from-rose-500 to-pink-600",
  nagad: "from-emerald-500 to-teal-600",
  rocket: "from-orange-500 to-red-600",
  bank: "from-blue-500 to-indigo-600",
};

function getPlanAmount(plan: Plan, duration: string): number {
  const pricing = plan.pricing ?? {};
  if (duration === "monthly") return pricing.monthly ?? plan.priceBDT ?? 0;
  if (duration === "quarterly") return pricing.quarterly ?? (plan.priceBDT ?? 0) * 3;
  if (duration === "half_yearly") return pricing.halfYearly ?? (plan.priceBDT ?? 0) * 6;
  if (duration === "yearly") return pricing.yearly ?? plan.priceYearly ?? (plan.priceBDT ?? 0) * 12;
  return pricing.lifetime ?? 0;
}

type Step = "plan" | "duration" | "payment" | "confirm" | "success";

export function PaymentSubmissionFlow({
  storeId,
  plans,
  onClose,
}: {
  storeId: string;
  plans: Plan[];
  onClose: () => void;
}) {
  const { data: methodsData } = useGetPlatformPaymentMethodsQuery();
  const { data: billingConfigData } = useGetBillingConfigQuery();
  const [submitPayment, { isLoading: submitting }] = useSubmitSubscriptionPaymentMutation();

  const methods = methodsData?.data?.methods ?? [];
  const billingConfig = billingConfigData?.data;
  const activePlans = plans.filter((p) => p.visible !== false && p.isActive);

  const [step, setStep] = useState<Step>("plan");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [duration, setDuration] = useState<SubscriptionDuration>("monthly");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const enabledDurations = useMemo(() => {
    const config = billingConfig?.enabledDurations ?? {
      monthly: true, quarterly: true, halfYearly: true, yearly: true, lifetime: false,
    };
    return (Object.keys(DURATION_LABELS) as SubscriptionDuration[]).filter((d) => {
      const key = d === "half_yearly" ? "halfYearly" : d;
      return config[key] !== false;
    });
  }, [billingConfig]);

  const selectedPlan = activePlans.find((p) => p._id === selectedPlanId);
  const selectedMethod = methods.find((m) => m.type === paymentMethod);
  const paymentAmount = selectedPlan ? getPlanAmount(selectedPlan, duration) : 0;
  const totalMonths = DURATION_MONTHS[duration];

  // Coupon / Discount / Tax calculations
  const discountAmount = couponApplied ? couponDiscount : 0;
  const subtotalAfterDiscount = Math.max(0, paymentAmount - discountAmount);
  const taxRate = 0; // Tax can be configured per plan
  const taxAmount = Math.round(subtotalAfterDiscount * taxRate);
  const finalTotal = subtotalAfterDiscount + taxAmount;

  const handleApplyCoupon = useCallback(() => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    // Simulate coupon validation — in production this calls a backend endpoint
    setTimeout(() => {
      // For demo: any 3+ char code gives 10% discount
      if (couponCode.trim().length >= 3) {
        const discount = Math.round(paymentAmount * 0.1);
        setCouponDiscount(discount);
        setCouponApplied(true);
        toast.success(`Coupon applied! You save ${formatBDT(discount)}`);
      } else {
        toast.error("Invalid coupon code");
      }
      setApplyingCoupon(false);
    }, 800);
  }, [couponCode, paymentAmount]);

  const handleRemoveCoupon = useCallback(() => {
    setCouponCode("");
    setCouponDiscount(0);
    setCouponApplied(false);
  }, []);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onload = (ev) => setScreenshotPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

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
        notes,
      }).unwrap();
      setStep("success");
      toast.success("Payment submitted for approval");
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "data" in err
        ? (err as { data?: { message?: string } }).data?.message
        : undefined;
      toast.error(message ?? "Failed to submit payment");
    }
  };

  const canProceedToConfirm = selectedPlanId && duration && paymentMethod && senderNumber.length >= 6 && transactionId.length >= 4;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Steps indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {(["plan", "duration", "payment", "confirm"] as Step[]).map((s, i) => {
            const stepIndex = ["plan", "duration", "payment", "confirm"].indexOf(step);
            const isActive = ["plan", "duration", "payment", "confirm"].indexOf(s) <= stepIndex;
            const isCurrent = s === step;
            return (
              <div key={s} className="flex items-center">
                <div className={`flex items-center gap-2 ${isActive ? "text-zinc-900" : "text-zinc-300"}`}>
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-zinc-900 text-white"
                        : isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-zinc-100 text-zinc-400"
                    }`}
                  >
                    {isActive && s !== step ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium capitalize ${isCurrent ? "text-zinc-900" : ""}`}>
                    {s === "payment" ? "Pay" : s}
                  </span>
                </div>
                {s !== "confirm" && <div className={`mx-2 h-px w-8 ${isActive ? "bg-zinc-300" : "bg-zinc-100"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "plan" && (
          <motion.div key="plan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-zinc-900">Choose a Plan</h2>
              <p className="text-sm text-zinc-500 mt-1">Select the plan that fits your needs</p>
            </div>
            <div className="grid gap-3">
              {activePlans.map((plan) => {
                const price = plan.pricing?.monthly || plan.priceBDT || 0;
                const isSelected = selectedPlanId === plan._id;
                return (
                  <button
                    key={plan._id}
                    type="button"
                    onClick={() => { setSelectedPlanId(plan._id); }}
                    className={`relative flex items-center justify-between rounded-2xl border-2 p-4 text-left transition-all ${
                      isSelected
                        ? "border-zinc-900 bg-zinc-50 shadow-sm"
                        : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold ${
                        isSelected ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
                      }`}>
                        {plan.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900">{plan.name}</p>
                        <p className="text-sm text-zinc-500">{plan.description || "—"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-zinc-900">{formatBDT(price)}</p>
                      <p className="text-xs text-zinc-500">/mo</p>
                    </div>
                    {plan.isRecommended && (
                      <Badge variant="primary" className="absolute -top-2 -right-2 bg-indigo-500 text-white border-0">
                        Popular
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep("duration")}
                disabled={!selectedPlanId}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === "duration" && (
          <motion.div key="duration" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-zinc-900">Select Duration</h2>
              <p className="text-sm text-zinc-500 mt-1">Choose your billing cycle</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {enabledDurations.map((d) => {
                const price = selectedPlan ? getPlanAmount(selectedPlan, d) : 0;
                const saving = d === "yearly" && selectedPlan
                  ? Math.round((1 - price / ((selectedPlan.pricing?.monthly || selectedPlan.priceBDT || 0) * 12)) * 100)
                  : 0;
                const isSelected = duration === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`relative rounded-2xl border-2 p-4 text-center transition-all ${
                      isSelected
                        ? "border-zinc-900 bg-zinc-50 shadow-sm ring-1 ring-zinc-900/10"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <p className="text-sm font-semibold text-zinc-900">{DURATION_LABELS[d]}</p>
                    <p className="mt-1 text-lg font-bold text-zinc-900">{formatBDT(price)}</p>
                    {totalMonths && (
                      <p className="text-[11px] text-zinc-500">
                        {formatBDT(Math.round(price / totalMonths))}/mo
                      </p>
                    )}
                    {saving > 0 && (
                      <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Save {saving}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep("plan")}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep("payment")}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === "payment" && (
          <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-zinc-900">Payment Details</h2>
              <p className="text-sm text-zinc-500 mt-1">
                Pay {formatBDT(paymentAmount)} for {DURATION_LABELS[duration]} of <strong>{selectedPlan?.name}</strong>
              </p>
            </div>

            {/* Payment method selection */}
            <div>
              <p className="text-sm font-medium text-zinc-700 mb-2">Select Payment Method</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {methods.map((method) => {
                  const Icon = METHOD_ICONS[method.type] || CreditCard;
                  const isSelected = paymentMethod === method.type;
                  return (
                    <button
                      key={method.type}
                      type="button"
                      onClick={() => setPaymentMethod(method.type)}
                      className={`relative rounded-xl border-2 p-3 text-center transition-all ${
                        isSelected
                          ? "border-zinc-900 bg-zinc-50 shadow-sm"
                          : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${METHOD_COLORS[method.type] || "from-zinc-500 to-zinc-600"} text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-1.5 text-xs font-semibold text-zinc-900">{method.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment info display */}
            {selectedMethod && (
              <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-5">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <p className="text-sm font-semibold text-zinc-900">Send payment to the following account</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Account Number</span>
                    <span className="font-bold text-zinc-900 text-lg tracking-wide">{selectedMethod.accountNumber}</span>
                  </div>
                  {selectedMethod.merchantNumber && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Merchant Number</span>
                      <span className="font-medium text-zinc-900">{selectedMethod.merchantNumber}</span>
                    </div>
                  )}
                  {selectedMethod.accountName && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Account Name</span>
                      <span className="font-medium text-zinc-900">{selectedMethod.accountName}</span>
                    </div>
                  )}
                  {selectedMethod.bankName && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Bank</span>
                      <span className="font-medium text-zinc-900">{selectedMethod.bankName}</span>
                    </div>
                  )}
                  {selectedMethod.branchName && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Branch</span>
                      <span className="font-medium text-zinc-900">{selectedMethod.branchName}</span>
                    </div>
                  )}
                  {selectedMethod.instructions && (
                    <div className="mt-3 rounded-lg bg-zinc-100 p-3 text-xs text-zinc-600">
                      <p className="font-medium text-zinc-700 mb-1">Instructions:</p>
                      {selectedMethod.instructions}
                    </div>
                  )}
                </div>
                {selectedMethod.qrCodeUrl && (
                  <div className="mt-4 flex justify-center">
                    <img src={selectedMethod.qrCodeUrl} alt="QR Code" className="h-32 w-32 rounded-xl border border-zinc-200" />
                  </div>
                )}
              </div>
            )}

            {/* User input fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Your Sender Number</label>
                <input
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Transaction ID</label>
                <input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. A7B8C9D10"
                  className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                />
              </div>
            </div>

            {/* Screenshot upload */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">Payment Screenshot (optional)</label>
              <div
                className="relative flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 p-6 hover:border-zinc-300 transition-colors"
                onClick={() => document.getElementById("screenshot-upload")?.click()}
              >
                {screenshotPreview ? (
                  <div className="relative">
                    <img src={screenshotPreview} alt="Preview" className="max-h-40 rounded-lg object-contain" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setScreenshot(null); setScreenshotPreview(""); }}
                      className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-zinc-300" />
                    <p className="mt-2 text-sm text-zinc-500">Upload payment screenshot</p>
                    <p className="text-xs text-zinc-400">PNG, JPG or JPEG</p>
                  </div>
                )}
                <input
                  id="screenshot-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleScreenshotChange}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any additional reference..."
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep("duration")}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep("confirm")}
                disabled={!canProceedToConfirm}
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
              <h2 className="text-xl font-bold text-zinc-900">Confirm Payment</h2>
              <p className="text-sm text-zinc-500 mt-1">Review your payment details before submitting</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <span className="text-sm text-zinc-600">Plan</span>
                <span className="text-sm font-semibold text-zinc-900">{selectedPlan?.name}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <span className="text-sm text-zinc-600">Duration</span>
                <span className="text-sm font-semibold text-zinc-900 capitalize">{DURATION_LABELS[duration]}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <span className="text-sm text-zinc-600">Amount</span>
                <span className="text-lg font-bold text-zinc-900">{formatBDT(paymentAmount)}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <span className="text-sm text-zinc-600">Payment Method</span>
                <Badge variant="default" className="bg-white border border-zinc-200 text-zinc-700">
                  {selectedMethod?.label || paymentMethod}
                </Badge>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <span className="text-sm text-zinc-600">Sender Number</span>
                <span className="text-sm font-mono font-medium text-zinc-900">{senderNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">Transaction ID</span>
                <span className="text-sm font-mono font-medium text-zinc-900">{transactionId}</span>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <p className="font-medium mb-0.5">After submission:</p>
              <p>Your payment will be reviewed by an admin. This typically takes 2-24 hours. You will be notified once your payment is approved or if more information is needed.</p>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep("payment")}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Submitting..." : "Submit Payment"}
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
              <h2 className="text-2xl font-bold text-zinc-900">Payment Submitted!</h2>
              <p className="text-zinc-500 mt-2 max-w-sm mx-auto">
                Your payment is pending admin approval. We will notify you once it is reviewed.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              Pending Approval — Estimated review time: 2-24 hours
            </div>
            <div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Back to Billing
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
