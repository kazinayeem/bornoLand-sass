"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle, RotateCcw, ShoppingBag, ArrowLeft, AlertTriangle } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { StorefrontButton, StorefrontCard } from "@/components/storefront/storefront-ui";

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const { store } = useTenant();

  const orderNumber = searchParams.get("orderNumber") || searchParams.get("order") || "";
  const error = searchParams.get("error") || "";
  const tranId = searchParams.get("tran_id") || searchParams.get("tranId") || "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <StorefrontCard className="flex flex-col items-center p-8 sm:p-10 text-center shadow-lg border border-rose-100 bg-white dark:bg-zinc-900">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <XCircle className="h-10 w-10" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
            <AlertTriangle className="h-3.5 w-3.5" /> Payment Incomplete
          </span>

          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Payment could not be completed
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            The transaction was declined or could not be verified by your payment provider. No funds have been deducted from your account.
          </p>

          {(orderNumber || error || tranId) && (
            <div className="mt-6 w-full rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-4 text-left border border-zinc-100 dark:border-zinc-800 space-y-2 text-xs">
              {orderNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Order Number</span>
                  <span className="font-bold text-foreground">{orderNumber}</span>
                </div>
              )}
              {error && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Reason</span>
                  <span className="font-medium text-rose-600 dark:text-rose-400 capitalize">{error.replace(/_/g, " ")}</span>
                </div>
              )}
              {tranId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Transaction ID</span>
                  <span className="font-mono text-foreground">{tranId}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <Link href="/checkout" className="w-full sm:w-auto">
              <StorefrontButton className="w-full">
                <RotateCcw className="h-4 w-4" /> Try Again
              </StorefrontButton>
            </Link>
            <Link href="/shop" className="w-full sm:w-auto">
              <StorefrontButton variant="secondary" className="w-full">
                <ShoppingBag className="h-4 w-4" /> Continue Shopping
              </StorefrontButton>
            </Link>
          </div>
        </StorefrontCard>
      </motion.div>
    </div>
  );
}
