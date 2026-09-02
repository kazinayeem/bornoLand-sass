"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import { useLanguage } from "@/providers/language-provider";
import { PosOrderModal } from "@/components/pos/pos-order-modal";
import { Calculator, Plus, ShoppingCart, Sparkles, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHasPermission } from "@/features/session/hooks";

export default function PosTerminalPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData, isLoading } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [posOpen, setPosOpen] = useState(true);
  const hasPosAccess = useHasPermission("pos:read");

  if (isLoading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent dark:border-white dark:border-t-transparent" />
      </div>
    );
  }

  if (!hasPosAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
          <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {isBn ? "অনুমতি প্রয়োজন" : "Permission Denied"}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 max-w-sm">
          {isBn
            ? "আপনার অ্যাকাউন্টে এই স্টোরের POS টার্মিনাল অ্যাক্সেস করার অনুমতি নেই।"
            : "You don't have permission to access the Point of Sale terminal for this store."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2.5">
            <Calculator className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>{isBn ? "পয়েন্ট অব সেল (POS) টার্মিনাল" : "Point of Sale (POS) Terminal"}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isBn
              ? "দোকানের কাউন্টারে সরাসরি ক্যাশ, কার্ড বা মোবাইল ব্যাংকিংয়ের মাধ্যমে অর্ডার তৈরি ও রসিদ প্রিন্ট করুন।"
              : "In-person cashier register, rapid checkout, barcode scanning, and instant receipt generation."}
          </p>
        </div>

        <Button
          onClick={() => setPosOpen(true)}
          className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>{isBn ? "নতুন POS অর্ডার তৈরি করুন" : "Open POS Register"}</span>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-zinc-500" />
              <span>{isBn ? "দ্রুত চেকআউট" : "Rapid Checkout"}</span>
            </CardTitle>
            <CardDescription>
              {isBn ? "বারকোড স্ক্যানিং বা নাম দিয়ে দ্রুত পণ্য খুঁজুন" : "Search products by SKU, name, or barcode"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {isBn
                ? "ভ্যারিয়েন্ট বাছাই, ডিসকাউন্ট কুপন প্রয়োগ এবং তাত্ক্ষণিক স্টক হিসেব।"
                : "Instant inventory deductions, variation selection, custom discounts, and customer lookup."}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-zinc-500" />
              <span>{isBn ? "মাল্টিপেমেন্ট মেথড" : "Multi-Payment Support"}</span>
            </CardTitle>
            <CardDescription>
              {isBn ? "ক্যাশ, কার্ড, বিকাশ, নগদ বা রকেট" : "Cash, Card, bKash, Nagad, or Rocket"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {isBn
                ? "অন-স্পট লেনদেন নিশ্চিতকরণ এবং গ্রাহকের ফোন নম্বরে অর্ডার হিস্ট্রি সংরক্ষণ।"
                : "Full audit logs of all cashier sales synced in real-time with your store catalog and orders."}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calculator className="h-4 w-4 text-zinc-500" />
              <span>{isBn ? "রসিদ ও প্রিন্টিং" : "POS Receipts"}</span>
            </CardTitle>
            <CardDescription>
              {isBn ? "থার্মাল প্রিন্টার সামঞ্জস্যপূর্ণ" : "Thermal printer and 80mm/58mm slip ready"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {isBn
                ? "বিক্রয় সমাপ্ত হওয়ার সাথে সাথে স্বয়ংক্রিয় চালানের প্রিন্ট ভিউ প্রদর্শিত হবে।"
                : "Instant PDF and browser thermal receipt generation for completed in-person sales."}
            </p>
          </CardContent>
        </Card>
      </div>

      {store?._id && (
        <PosOrderModal
          open={posOpen}
          storeId={store._id}
          onClose={() => setPosOpen(false)}
          onSuccess={() => setPosOpen(false)}
        />
      )}
    </div>
  );
}
