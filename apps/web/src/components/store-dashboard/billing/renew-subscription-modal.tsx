"use client";

import { Modal } from "@/components/ui/modal";
import { useGetPlanPriceQuery } from "@/redux/api/billing-api";
import { Loader2 } from "lucide-react";

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
  const duration = isYearly ? "yearly" : "monthly";
  const { data: priceData, isLoading } = useGetPlanPriceQuery({ planId, duration });

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Confirm Subscription"
      description={`You are about to subscribe to the ${priceData?.data?.plan?.name || "selected"} plan.`}
      size="md"
    >
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex justify-between border-b border-zinc-200 pb-3">
              <span className="text-sm font-medium text-zinc-600">Plan</span>
              <span className="text-sm font-semibold text-zinc-900">{priceData?.data?.plan?.name} ({duration})</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 py-3">
              <span className="text-sm font-medium text-zinc-600">Amount</span>
              <span className="text-sm font-semibold text-zinc-900">৳{priceData?.data?.amount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-3">
              <span className="text-base font-bold text-zinc-900">Total</span>
              <span className="text-base font-bold text-indigo-600">৳{priceData?.data?.amount?.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Payment Method</label>
            <select className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="sslcommerz">SSLCommerz (Cards/Net Banking)</option>
              <option value="bank">Manual Bank Transfer</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isLoading}
              className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              Pay Now
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
