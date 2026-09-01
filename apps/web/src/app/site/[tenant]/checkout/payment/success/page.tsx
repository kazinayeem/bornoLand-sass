"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, ShoppingBag, FileText, Sparkles } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { StorefrontButton, StorefrontCard } from "@/components/storefront/storefront-ui";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const { store, theme } = useTenant();

  const orderNumber = searchParams.get("orderNumber") || searchParams.get("order") || "";
  const orderId = searchParams.get("orderId") || "";
  const tranId = searchParams.get("tran_id") || searchParams.get("tranId") || "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <StorefrontCard className="flex flex-col items-center p-8 sm:p-10 text-center shadow-lg border border-emerald-100 bg-white dark:bg-zinc-900">
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0.3 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
              className="absolute inset-0 rounded-full bg-emerald-400/20"
            />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" /> Payment Successful
          </span>

          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Thank you for your order!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Your payment was verified and processed securely via SSLCommerz. We are preparing your order for fulfillment.
          </p>

          {(orderNumber || tranId) && (
            <div className="mt-6 w-full rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-4 text-left border border-zinc-100 dark:border-zinc-800 space-y-2 text-xs">
              {orderNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Order Number</span>
                  <span className="font-bold text-foreground">{orderNumber}</span>
                </div>
              )}
              {tranId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Transaction ID</span>
                  <span className="font-mono font-bold text-foreground">{tranId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Store</span>
                <span className="font-semibold text-foreground">{store.name}</span>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            {orderId ? (
              <Link href={`/orders/${orderId}`} className="w-full sm:w-auto">
                <StorefrontButton className="w-full">
                  <FileText className="h-4 w-4" /> View Order Status
                </StorefrontButton>
              </Link>
            ) : orderNumber ? (
              <Link href={`/order-tracking?orderNumber=${encodeURIComponent(orderNumber)}`} className="w-full sm:w-auto">
                <StorefrontButton className="w-full">
                  <FileText className="h-4 w-4" /> Track Order
                </StorefrontButton>
              </Link>
            ) : null}

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
