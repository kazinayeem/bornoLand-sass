"use client";

import { motion } from "framer-motion";
import { CreditCard, Download, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from "@/hooks/redux";

export default function BillingPage() {
  const user = useAppSelector((s) => s.user.profile);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Billing</h2>
        <p className="mt-1 text-sm text-zinc-500">Manage your subscription and invoices.</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-zinc-900">Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900">Free Plan</p>
                  <p className="text-xs text-zinc-500">1 store, basic features</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Active</span>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
              Upgrade Plan <ArrowUpRight className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-zinc-900">Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-dashed border-zinc-200 p-4 text-center">
              <CreditCard className="mx-auto h-8 w-8 text-zinc-300" />
              <p className="mt-2 text-sm text-zinc-500">No payment method</p>
              <button className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700">Add card</button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-zinc-900">Invoices</CardTitle>
            <button className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50">
              <Download className="h-4 w-4" /> All Invoices
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <CreditCard className="h-10 w-10 text-zinc-300" />
            <p className="text-sm font-medium text-zinc-600">No invoices yet</p>
            <p className="text-xs text-zinc-400">Invoices will appear here after your first payment.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
