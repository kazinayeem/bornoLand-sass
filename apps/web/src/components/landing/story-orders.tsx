"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";
import { useLandingLocale } from "./landing-locale";
import { Reveal } from "./motion-primitives";
import {
  Calculator,
  QrCode,
  CreditCard,
  Banknote,
  Printer,
  CheckCircle2,
  ArrowRight,
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function StoryOrders() {
  const { locale, t } = useLandingLocale();
  const [paymentType, setPaymentType] = useState<"cash" | "bkash" | "card">("bkash");
  const [receiptPrinted, setReceiptPrinted] = useState(false);

  const cartItems = [
    { name: "Premium Cotton Panjabi (M)", price: 1850, qty: 1 },
    { name: "Wireless Earbuds Pro", price: 2450, qty: 1 },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discount = 300;
  const total = subtotal - discount;

  return (
    <section id="pos" className="py-20 sm:py-24 bg-zinc-50/70 border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
          {/* Left Column: Interactive POS Terminal Mockup */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <Reveal direction="scale" delay={150}>
              <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-md space-y-4">
                {/* Terminal Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#003399] text-white">
                      <Calculator className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-zinc-950">{t.pos.terminalTitle}</p>
                      <p className="text-[10px] text-zinc-500">{t.pos.cashier}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-[#0A8A00] flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0A8A00] animate-pulse" />
                    Live Register
                  </span>
                </div>

                {/* Simulated Barcode / Product Search Bar */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-500">
                  <Barcode className="h-4 w-4 text-[#003399]" />
                  <span className="font-mono text-[11px]">SKU: PNJ-COT-01 • Scan or Search...</span>
                  <span className="ml-auto text-[10px] bg-zinc-200 px-1.5 py-0.5 rounded font-bold text-zinc-700">
                    F2 Search
                  </span>
                </div>

                {/* Cart Items Table */}
                <div className="divide-y divide-zinc-100 text-xs">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-bold text-zinc-900">{item.name}</p>
                        <p className="text-[10px] text-zinc-400">Qty: {item.qty} × ৳{item.price}</p>
                      </div>
                      <p className="font-bold text-zinc-950">৳{item.price * item.qty}</p>
                    </div>
                  ))}
                </div>

                {/* Bill Summary Breakdown */}
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>{t.pos.subtotal}</span>
                    <span>৳{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>{t.pos.discount}</span>
                    <span>-৳{discount}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-zinc-200 text-sm font-extrabold text-zinc-950">
                    <span>{t.pos.total}</span>
                    <span className="text-[#003399]">৳{total}</span>
                  </div>
                </div>

                {/* Payment Tender Switches */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentType("bkash");
                      setReceiptPrinted(true);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                      paymentType === "bkash"
                        ? "border-[#E2136E] bg-[#E2136E]/10 text-[#E2136E] shadow-2xs"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    )}
                  >
                    <QrCode className="h-4 w-4" />
                    <span>bKash QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentType("cash");
                      setReceiptPrinted(true);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                      paymentType === "cash"
                        ? "border-[#003399] bg-[#003399]/10 text-[#003399] shadow-2xs"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    )}
                  >
                    <Banknote className="h-4 w-4" />
                    <span>{t.pos.payCash}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentType("card");
                      setReceiptPrinted(true);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                      paymentType === "card"
                        ? "border-purple-600 bg-purple-50 text-purple-700 shadow-2xs"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    )}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Card POS</span>
                  </button>
                </div>

                {/* Simulated Thermal Receipt Printed Banner */}
                {receiptPrinted && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-[#0A8A00] font-bold animate-in fade-in duration-200">
                    <span className="flex items-center gap-1.5">
                      <Printer className="h-3.5 w-3.5" />
                      {t.pos.receiptPrinted}
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Auto Stock Sync
                    </span>
                  </div>
                )}
              </div>
            </Reveal>
          </div>

          {/* Right Column: Value Copy */}
          <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
            <Reveal direction="down" delay={50}>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {t.pos.eyebrow}
              </span>
            </Reveal>

            <Reveal direction="up" delay={100}>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight">
                {t.pos.title}
              </h2>
            </Reveal>

            <Reveal direction="up" delay={160}>
              <p className="text-base text-zinc-600 leading-relaxed font-normal">
                {t.pos.description}
              </p>
            </Reveal>

            <Reveal direction="up" delay={220}>
              <div className="space-y-3 pt-2">
                {t.pos.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-[#0A8A00] shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal direction="up" delay={280}>
              <div className="pt-3">
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#003399] text-white text-xs font-bold shadow-xs hover:bg-[#002B80] transition-all"
                >
                  <span>{t.pos.cta}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
