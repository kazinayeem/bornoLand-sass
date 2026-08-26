"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, ShoppingBag, ArrowLeft } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { StorefrontButton, StorefrontCard } from "@/components/storefront/storefront-ui";

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const { store } = useTenant();

  const orderNumber = searchParams.get("orderNumber") || "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <StorefrontCard className="flex flex-col items-center p-8 sm:p-10 text-center shadow-lg border border-amber-100 bg-white dark:bg-zinc-900">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-10 w-10" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            Payment Cancelled
          </span>

          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            You cancelled the payment
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            You exited the checkout session before completing the payment. Your items remain saved in your cart if you wish to finish your purchase.
          </p>

          {orderNumber && (
            <div className="mt-6 w-full rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-4 text-left border border-zinc-100 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Order Number</span>
                <span className="font-bold text-foreground">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Store</span>
                <span className="font-semibold text-foreground">{store.name}</span>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <Link href="/checkout" className="w-full sm:w-auto">
              <StorefrontButton className="w-full">
                <ArrowLeft className="h-4 w-4" /> Return to Checkout
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
