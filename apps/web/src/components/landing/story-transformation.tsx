"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";
import { Reveal, AnimatedNumber, AnimatedChart } from "./motion-primitives";
import {
  Globe,
  Calculator,
  Boxes,
  Landmark,
  Users,
  LineChart,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Barcode,
  QrCode,
  CreditCard,
  Banknote,
  Printer,
  Warehouse,
  AlertTriangle,
  Scale,
  FileText,
  Clock,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabKey = "commerce" | "pos" | "inventory" | "finance" | "hrm" | "analytics";

export function StoryTransformation() {
  const [activeTab, setActiveTab] = useState<TabKey>("commerce");

  // Sub-state for Commerce tab
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeCategory, setActiveCategory] = useState<"all" | "apparel" | "electronics">("all");

  // Sub-state for POS tab
  const [paymentType, setPaymentType] = useState<"card" | "cash" | "qr">("card");
  const [receiptPrinted, setReceiptPrinted] = useState(false);

  // Sub-state for Inventory tab
  const [selectedHub, setSelectedHub] = useState<"hubA" | "dhanmondi" | "ctg">("hubA");

  // Sub-state for Finance tab
  const [financeView, setFinanceView] = useState<"pnl" | "journal">("pnl");

  // Sub-state for HRM tab
  const [payslipDispatched, setPayslipDispatched] = useState(false);

  // Sub-state for Analytics tab
  const [analyticsPeriod, setAnalyticsPeriod] = useState<"7D" | "30D" | "90D" | "1Y">("30D");

  const tabs = [
    { id: "commerce", label: "Commerce & Storefront", icon: Globe },
    { id: "pos", label: "Cloud POS Register", icon: Calculator },
    { id: "inventory", label: "Multi-Warehouse Inventory", icon: Boxes },
    { id: "finance", label: "Double-Entry Finance", icon: Landmark },
    { id: "hrm", label: "HRM & Payroll", icon: Users },
    { id: "analytics", label: "BI & Analytics", icon: LineChart },
  ] as const;

  // Mock data for Commerce
  const storefrontProducts = [
    { name: "Premium Tailored Blazer", price: "$185.00", category: "apparel", tag: "Featured" },
    { name: "Wireless ANC Headphones", price: "$240.00", category: "electronics", tag: "Best Seller" },
    { name: "Classic Linen Oxford Shirt", price: "$95.00", category: "apparel", tag: "New" },
    { name: "Minimalist Smart Watch", price: "$320.00", category: "electronics", tag: "-15%" },
  ];

  const filteredStorefront =
    activeCategory === "all"
      ? storefrontProducts
      : storefrontProducts.filter((p) => p.category === activeCategory);

  // Mock data for Inventory
  const warehouseData = {
    hubA: [
      { name: "Premium Tailored Blazer", sku: "BLZ-TLR-01", stock: 450, cost: "$82.00", status: "In Stock", alert: false },
      { name: "Wireless ANC Headphones", sku: "HDP-ANC-04", stock: 14, cost: "$110.00", status: "Low Stock", alert: true },
      { name: "Classic Linen Oxford Shirt", sku: "SHT-LIN-02", stock: 320, cost: "$38.00", status: "In Stock", alert: false },
      { name: "Minimalist Smart Watch", sku: "WTC-SMR-09", stock: 8, cost: "$145.00", status: "Low Stock", alert: true },
    ],
    dhanmondi: [
      { name: "Premium Tailored Blazer", sku: "BLZ-TLR-01", stock: 35, cost: "$82.00", status: "In Stock", alert: false },
      { name: "Wireless ANC Headphones", sku: "HDP-ANC-04", stock: 18, cost: "$110.00", status: "In Stock", alert: false },
      { name: "Classic Linen Oxford Shirt", sku: "SHT-LIN-02", stock: 6, cost: "$38.00", status: "Low Stock", alert: true },
      { name: "Minimalist Smart Watch", sku: "WTC-SMR-09", stock: 24, cost: "$145.00", status: "In Stock", alert: false },
    ],
    ctg: [
      { name: "Premium Tailored Blazer", sku: "BLZ-TLR-01", stock: 120, cost: "$82.00", status: "In Stock", alert: false },
      { name: "Wireless ANC Headphones", sku: "HDP-ANC-04", stock: 42, cost: "$110.00", status: "In Stock", alert: false },
      { name: "Classic Linen Oxford Shirt", sku: "SHT-LIN-02", stock: 85, cost: "$38.00", status: "In Stock", alert: false },
      { name: "Minimalist Smart Watch", sku: "WTC-SMR-09", stock: 4, cost: "$145.00", status: "Low Stock", alert: true },
    ],
  };

  // Mock data for HRM
  const employees = [
    { name: "Tanvir Ahmed", role: "Head POS Cashier", attendance: "100%", salary: "$1,850", status: "Present" },
    { name: "Farhana Yasmin", role: "Warehouse Inventory Lead", attendance: "96.4%", salary: "$2,400", status: "Present" },
    { name: "Mahmudul Hasan", role: "Retail Operations", attendance: "92.0%", salary: "$2,100", status: "On Leave" },
  ];

  // Mock data for Analytics
  const analyticsChartData = {
    "7D": [
      { label: "Day 1", value: 14000 },
      { label: "Day 2", value: 19500 },
      { label: "Day 3", value: 16200 },
      { label: "Day 4", value: 25400 },
      { label: "Day 5", value: 34000 },
      { label: "Day 6", value: 39800 },
      { label: "Day 7", value: 44200 },
    ],
    "30D": [
      { label: "Week 1", value: 72000 },
      { label: "Week 2", value: 98000 },
      { label: "Week 3", value: 124000 },
      { label: "Week 4", value: 156000 },
    ],
    "90D": [
      { label: "Month 1", value: 295000 },
      { label: "Month 2", value: 395000 },
      { label: "Month 3", value: 510000 },
    ],
    "1Y": [
      { label: "Q1", value: 890000 },
      { label: "Q2", value: 1240000 },
      { label: "Q3", value: 1580000 },
      { label: "Q4", value: 2120000 },
    ],
  };

  const analyticsKpis = {
    "7D": { gross: 88400, orders: 362, margin: "44.2%", growth: "+14.8%" },
    "30D": { gross: 254800, orders: 1320, margin: "45.1%", growth: "+24.2%" },
    "90D": { gross: 915000, orders: 4280, margin: "45.8%", growth: "+36.5%" },
    "1Y": { gross: 3580000, orders: 17400, margin: "46.2%", growth: "+52.4%" },
  };

  return (
    <section id="platform" className="py-20 sm:py-24 bg-white border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
          <Reveal direction="down" delay={40}>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              PLATFORM OVERVIEW & INTERACTIVE SHOWCASE
            </span>
          </Reveal>
          <Reveal direction="up" delay={80}>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight">
              One Unified System. Zero Integration Overhead.
            </h2>
          </Reveal>
          <Reveal direction="up" delay={140}>
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
              Explore how each core module operates seamlessly from a single centralized transactional database.
            </p>
          </Reveal>
        </div>

        {/* 6 Interactive Showcase Tabs Selector */}
        <div className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto pb-4 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabKey)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border shadow-2xs",
                  isActive
                    ? "bg-[#003399] text-white border-[#003399] shadow-sm scale-[1.02]"
                    : "bg-white text-zinc-700 border-zinc-200/90 hover:bg-zinc-50 hover:text-zinc-950"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="max-w-6xl mx-auto">
          {/* TAB 1: COMMERCE & STOREFRONT */}
          {activeTab === "commerce" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-5 space-y-5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  STOREFRONT BUILDER & CHECKOUT
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight leading-tight">
                  Design High-Converting Storefronts Visually
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                  Customize sections, configure custom domains with free automated SSL, and deliver lightning-fast shopping experiences across all mobile and desktop devices.
                </p>

                <div className="space-y-2.5 pt-1">
                  {[
                    "Zero-latency visual editing with live responsive previews",
                    "Custom domain connection with automated SSL renewal",
                    "Integrated bKash, Card, and instant courier dispatch",
                    "Dynamic variant matrices, SKU tracking, and fast search",
                  ].map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-700 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-[#0A8A00] shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <a
                    href="/register"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#003399] text-white text-xs font-bold shadow-xs hover:bg-[#002B80] transition-colors"
                  >
                    <span>Launch Storefront</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Interactive Commerce Mockup */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/70 p-4 sm:p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3">
                    <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setDevice("desktop")}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer",
                          device === "desktop" ? "bg-[#003399] text-white shadow-2xs" : "text-zinc-600 hover:text-zinc-950"
                        )}
                      >
                        <Monitor className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Desktop</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDevice("tablet")}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer",
                          device === "tablet" ? "bg-[#003399] text-white shadow-2xs" : "text-zinc-600 hover:text-zinc-950"
                        )}
                      >
                        <Tablet className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Tablet</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDevice("mobile")}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer",
                          device === "mobile" ? "bg-[#003399] text-white shadow-2xs" : "text-zinc-600 hover:text-zinc-950"
                        )}
                      >
                        <Smartphone className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Mobile</span>
                      </button>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0A8A00] animate-pulse" />
                      Live Preview Canvas
                    </span>
                  </div>

                  <div
                    className={cn(
                      "mx-auto transition-all duration-300 rounded-xl border border-zinc-200/90 bg-white overflow-hidden shadow-xs",
                      device === "desktop" && "w-full",
                      device === "tablet" && "w-full sm:w-[480px]",
                      device === "mobile" && "w-full sm:w-[320px]"
                    )}
                  >
                    <div className="p-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 text-xs">
                      <span className="font-extrabold text-[#003399]">AURA BOUTIQUE</span>
                      <div className="flex gap-2 text-[10px] text-zinc-500 font-semibold">
                        <span>Shop</span>
                        <span>Lookbook</span>
                        <span>Cart (2)</span>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-[#003399] to-indigo-800 text-white space-y-1.5 text-center">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#FFDA1A]">
                        SUMMER COLLECTION 2026
                      </span>
                      <h4 className="text-base font-black leading-tight">Elevated Modern Luxury</h4>
                    </div>

                    <div className="p-3 border-b border-zinc-100 flex items-center gap-1.5 text-[10px]">
                      {(["all", "apparel", "electronics"] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setActiveCategory(cat)}
                          className={cn(
                            "px-2.5 py-0.5 rounded-full font-bold capitalize transition-colors",
                            activeCategory === cat ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="p-3 grid grid-cols-2 gap-2 text-xs">
                      {filteredStorefront.map((p, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg border border-zinc-100 bg-zinc-50/50 space-y-1">
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">{p.tag}</span>
                            <ShoppingBag className="h-3 w-3 text-zinc-400" />
                          </div>
                          <p className="font-bold text-zinc-900 text-[11px] truncate">{p.name}</p>
                          <p className="font-extrabold text-[#003399] text-xs">{p.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLOUD POS REGISTER */}
          {activeTab === "pos" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-5 space-y-5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  RETAIL POINT OF SALE (POS)
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight leading-tight">
                  High-Speed In-Store Register Synchronized in Real Time
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                  Equip cashiers with an intuitive POS register that handles barcode lookups, split tender (Cash, Card, QR), cash shift drawer reconciliations, and thermal receipts.
                </p>

                <div className="space-y-2.5 pt-1">
                  {[
                    "Barcode scanner support with millisecond SKU lookup",
                    "Split tender: Cash, QR payment, and Card on a single receipt",
                    "Shift opening/closing cash drawer balancing with audit log",
                    "Automatic stock deduction preventing storefront overselling",
                  ].map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-700 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-[#0A8A00] shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <a
                    href="/register"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#003399] text-white text-xs font-bold shadow-xs hover:bg-[#002B80] transition-colors"
                  >
                    <span>Explore POS Terminal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Interactive POS Terminal Mockup */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#003399] text-white">
                        <Calculator className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-extrabold text-zinc-950">POS Terminal 01 (Flagship Store)</p>
                        <p className="text-[10px] text-zinc-500">Cashier: Tanvir Ahmed • Shift Active</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-[#0A8A00]">
                      Live Register
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-500">
                    <Barcode className="h-4 w-4 text-[#003399]" />
                    <span className="font-mono text-[11px]">SKU: BLZ-TLR-01 • Barcode Scanned</span>
                    <span className="ml-auto text-[10px] bg-zinc-200 px-1.5 py-0.5 rounded font-bold text-zinc-700">
                      F2 Search
                    </span>
                  </div>

                  <div className="divide-y divide-zinc-100 text-xs">
                    <div className="py-2 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-zinc-900">Premium Tailored Blazer (L)</p>
                        <p className="text-[10px] text-zinc-400">Qty: 1 × $185.00</p>
                      </div>
                      <p className="font-bold text-zinc-950">$185.00</p>
                    </div>
                    <div className="py-2 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-zinc-900">Classic Linen Oxford Shirt (M)</p>
                        <p className="text-[10px] text-zinc-400">Qty: 1 × $95.00</p>
                      </div>
                      <p className="font-bold text-zinc-950">$95.00</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1 text-xs">
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal</span>
                      <span>$280.00</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Store Promo Discount</span>
                      <span>-$30.00</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-zinc-200 text-sm font-extrabold text-zinc-950">
                      <span>Total Payable</span>
                      <span className="text-[#003399]">$250.00</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentType("card");
                        setReceiptPrinted(true);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                        paymentType === "card"
                          ? "border-[#003399] bg-blue-50/60 text-[#003399] shadow-2xs"
                          : "border-zinc-200 bg-white text-zinc-700"
                      )}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Card POS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentType("cash");
                        setReceiptPrinted(true);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                        paymentType === "cash"
                          ? "border-[#003399] bg-blue-50/60 text-[#003399] shadow-2xs"
                          : "border-zinc-200 bg-white text-zinc-700"
                      )}
                    >
                      <Banknote className="h-4 w-4" />
                      <span>Cash Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentType("qr");
                        setReceiptPrinted(true);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                        paymentType === "qr"
                          ? "border-[#E2136E] bg-pink-50 text-[#E2136E] shadow-2xs"
                          : "border-zinc-200 bg-white text-zinc-700"
                      )}
                    >
                      <QrCode className="h-4 w-4" />
                      <span>bKash / QR</span>
                    </button>
                  </div>

                  {receiptPrinted && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-[#0A8A00] font-bold animate-in fade-in duration-200">
                      <span className="flex items-center gap-1.5">
                        <Printer className="h-3.5 w-3.5" />
                        Thermal Receipt #BL-POS-4912 Printed
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Auto Stock Synced
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MULTI-WAREHOUSE INVENTORY */}
          {activeTab === "inventory" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-5 space-y-5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  INVENTORY & WAREHOUSING
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight leading-tight">
                  Multi-Warehouse Stock Ledger & True FIFO Costing
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                  Know exact stock distribution across retail outlets and fulfillment hubs. Track true landed costs and prevent stockouts with automated reorder triggers.
                </p>

                <div className="space-y-2.5 pt-1">
                  {[
                    "Multi-location stock transfers with full audit trail",
                    "FIFO/LIFO true landed cost calculation for accurate margins",
                    "Automated low-stock alerts and purchase order (PO) generation",
                    "Damaged goods, waste, and shrinkage write-off tracking",
                  ].map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-700 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-[#0A8A00] shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <a
                    href="/register"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#003399] text-white text-xs font-bold shadow-xs hover:bg-[#002B80] transition-colors"
                  >
                    <span>Manage Inventory</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Interactive Warehouse Mockup */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/70 p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Warehouse className="h-4 w-4 text-[#003399]" />
                      <span className="font-extrabold text-zinc-950">Multi-Warehouse Inventory Ledger</span>
                    </div>

                    <div className="flex gap-1">
                      {[
                        { id: "hubA", label: "Central Hub A" },
                        { id: "dhanmondi", label: "Dhanmondi Outlet" },
                        { id: "ctg", label: "Chittagong Hub" },
                      ].map((hub) => (
                        <button
                          key={hub.id}
                          type="button"
                          onClick={() => setSelectedHub(hub.id as any)}
                          className={cn(
                            "px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer",
                            selectedHub === hub.id
                              ? "bg-[#003399] text-white shadow-2xs"
                              : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                          )}
                        >
                          {hub.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-2xs text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-zinc-100 bg-zinc-50 text-[10px] font-bold uppercase text-zinc-500">
                          <th className="py-2.5 px-3.5">Product SKU</th>
                          <th className="py-2.5 px-3.5">Stock Level</th>
                          <th className="py-2.5 px-3.5">FIFO Cost</th>
                          <th className="py-2.5 px-3.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {warehouseData[selectedHub].map((item, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                            <td className="py-3 px-3.5">
                              <p className="font-bold text-zinc-900">{item.name}</p>
                              <p className="font-mono text-[10px] text-zinc-400">{item.sku}</p>
                            </td>
                            <td className="py-3 px-3.5 font-bold text-zinc-950">
                              {item.stock} units
                            </td>
                            <td className="py-3 px-3.5 font-mono text-zinc-600">
                              {item.cost}
                            </td>
                            <td className="py-3 px-3.5 text-right">
                              {item.alert ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                                  Low Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0A8A00] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="h-3 w-3 text-[#0A8A00]" />
                                  In Stock
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs text-zinc-700">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#003399]" />
                      <span className="font-bold text-[#003399]">PO #482 Inbound:</span>
                      <span className="text-zinc-600">500 units received into Central Hub A</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      Auto-Adjusted
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DOUBLE-ENTRY FINANCE */}
          {activeTab === "finance" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-5 space-y-5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  FINANCE & DOUBLE-ENTRY ACCOUNTING
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight leading-tight">
                  Audit-Ready Financial Statements & Real-Time P&L
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                  Eliminate spreadsheet bookkeeping. Sales, refunds, and supplier expenses automatically generate balanced double-entry journal entries with real-time gross and net profit statements.
                </p>

                <div className="space-y-2.5 pt-1">
                  {[
                    "Automated debit/credit journal postings for every transaction",
                    "Real-time Income Statement (P&L) based on true landed COGS",
                    "Categorized expense management with receipt attachments",
                    "Courier remittance reconciliation and bank account tracking",
                  ].map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-700 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-[#0A8A00] shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <a
                    href="/register"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#003399] text-white text-xs font-bold shadow-xs hover:bg-[#002B80] transition-colors"
                  >
                    <span>View Financial Engine</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Interactive Finance Mockup */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#003399] text-white">
                        <Landmark className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-extrabold text-zinc-950">Income Statement (P&L Summary)</p>
                        <p className="text-[10px] text-zinc-500">Auto-Generated • Real-Time Landed Cost</p>
                      </div>
                    </div>

                    <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5">
                      <button
                        type="button"
                        onClick={() => setFinanceView("pnl")}
                        className={cn(
                          "px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer",
                          financeView === "pnl" ? "bg-white text-zinc-950 shadow-2xs" : "text-zinc-500"
                        )}
                      >
                        P&L Statement
                      </button>
                      <button
                        type="button"
                        onClick={() => setFinanceView("journal")}
                        className={cn(
                          "px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer",
                          financeView === "journal" ? "bg-white text-zinc-950 shadow-2xs" : "text-zinc-500"
                        )}
                      >
                        Journal Ledger
                      </button>
                    </div>
                  </div>

                  {financeView === "pnl" ? (
                    <div className="space-y-3 text-xs animate-in fade-in duration-200">
                      <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                        <div className="flex justify-between font-bold text-zinc-900">
                          <span>Gross Sales Revenue</span>
                          <span>$128,450.00</span>
                        </div>
                        <div className="flex justify-between text-zinc-600 pl-3 border-l-2 border-zinc-300">
                          <span>- Cost of Goods Sold (COGS)</span>
                          <span className="font-mono">$70,905.00</span>
                        </div>
                        <div className="flex justify-between pt-1.5 border-t border-zinc-200 font-extrabold text-[#003399]">
                          <span>= Gross Profit Margin (44.8%)</span>
                          <span>$57,545.00</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                        <div className="flex justify-between text-zinc-600 pl-3 border-l-2 border-zinc-300">
                          <span>- Operating Expenses (Rent, Payroll, Marketing)</span>
                          <span className="font-mono">$16,200.00</span>
                        </div>
                        <div className="flex justify-between pt-1.5 border-t border-zinc-200 text-sm font-black text-[#0A8A00]">
                          <span>= Net Business Profit</span>
                          <span className="text-base">$41,345.00</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-zinc-200 overflow-hidden text-xs animate-in fade-in duration-200">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-zinc-100 bg-zinc-50 text-[10px] font-bold uppercase text-zinc-500">
                            <th className="py-2 px-3">Account Code & Title</th>
                            <th className="py-2 px-3 text-right">Debit (Dr)</th>
                            <th className="py-2 px-3 text-right">Credit (Cr)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
                          <tr>
                            <td className="py-2.5 px-3">1010 - Stripe Merchant Clearing</td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-700">$185.00</td>
                            <td className="py-2.5 px-3 text-right text-zinc-400">—</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 pl-6 text-zinc-600">4010 - Sales Revenue (Online)</td>
                            <td className="py-2.5 px-3 text-right text-zinc-400">—</td>
                            <td className="py-2.5 px-3 text-right font-bold text-blue-700">$185.00</td>
                          </tr>
                          <tr className="bg-zinc-50/50">
                            <td className="py-2.5 px-3">5010 - Cost of Goods Sold (COGS)</td>
                            <td className="py-2.5 px-3 text-right font-bold text-amber-700">$82.00</td>
                            <td className="py-2.5 px-3 text-right text-zinc-400">—</td>
                          </tr>
                          <tr className="bg-zinc-50/50">
                            <td className="py-2.5 px-3 pl-6 text-zinc-600">1050 - Inventory Asset</td>
                            <td className="py-2.5 px-3 text-right text-zinc-400">—</td>
                            <td className="py-2.5 px-3 text-right font-bold text-amber-700">$82.00</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-[#0A8A00] font-bold">
                    <span className="flex items-center gap-1.5">
                      <Scale className="h-4 w-4" />
                      Double-Entry General Ledger Active
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      100% Balanced
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: HRM & PAYROLL */}
          {activeTab === "hrm" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-5 space-y-5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  PEOPLE & AUDITED PAYROLL
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight leading-tight">
                  Staff Attendance, Shift Rules & 1-Click Payroll
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                  Manage employee profiles, shift schedules, late deductions, and leave approvals seamlessly. Generate audited monthly payslips and payment vouchers in 1 click.
                </p>

                <div className="space-y-2.5 pt-1">
                  {[
                    "Employee directory with role-based access permissions",
                    "Automated overtime, late penalty rules, and leave approvals",
                    "1-Click payroll calculation with downloadable PDF payslips",
                    "Employee self-service portal for leave requests and vouchers",
                  ].map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-700 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-[#0A8A00] shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <a
                    href="/register"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#003399] text-white text-xs font-bold shadow-xs hover:bg-[#002B80] transition-colors"
                  >
                    <span>Manage Team</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Interactive HRM Mockup */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/70 p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#003399]" />
                      <span className="font-extrabold text-zinc-950">HRM Command & Payroll Summary</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-[10px] font-bold text-purple-700">
                      Audit-Verified Payroll
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
                      <span className="text-[10px] text-zinc-500 font-semibold">Active Staff</span>
                      <p className="text-base font-extrabold text-zinc-950">18 Seats</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
                      <span className="text-[10px] text-zinc-500 font-semibold">On-Time Rate</span>
                      <p className="text-base font-extrabold text-[#0A8A00]">96.4%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
                      <span className="text-[10px] text-zinc-500 font-semibold">Monthly Payroll</span>
                      <p className="text-base font-extrabold text-[#003399]">$24,850</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-2xs text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-zinc-100 bg-zinc-50 text-[10px] font-bold uppercase text-zinc-500">
                          <th className="py-2.5 px-3.5">Staff Member</th>
                          <th className="py-2.5 px-3.5">Attendance</th>
                          <th className="py-2.5 px-3.5">Net Salary</th>
                          <th className="py-2.5 px-3.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {employees.map((emp, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                            <td className="py-3 px-3.5">
                              <p className="font-bold text-zinc-900">{emp.name}</p>
                              <p className="text-[10px] text-zinc-400">{emp.role}</p>
                            </td>
                            <td className="py-3 px-3.5 font-bold text-zinc-700">
                              {emp.attendance}
                            </td>
                            <td className="py-3 px-3.5 font-mono font-bold text-zinc-950">
                              {emp.salary}
                            </td>
                            <td className="py-3 px-3.5 text-right">
                              <span
                                className={cn(
                                  "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                  emp.status === "Present"
                                    ? "text-[#0A8A00] bg-emerald-50 border-emerald-200"
                                    : "text-amber-700 bg-amber-50 border-amber-200"
                                )}
                              >
                                {emp.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-purple-900 font-bold">
                      <FileText className="h-4 w-4 text-purple-700" />
                      <span>Payslips Dispatched (#PS-2026-09)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPayslipDispatched(true)}
                      className="px-3 py-1.5 rounded-lg bg-purple-700 text-white text-[11px] font-bold hover:bg-purple-800 transition-colors cursor-pointer shadow-2xs"
                    >
                      {payslipDispatched ? "Dispatched ✓" : "Send Payslips"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BI & ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-5 space-y-5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  EXECUTIVE BUSINESS INTELLIGENCE
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight leading-tight">
                  Real-Time Enterprise Analytics & Margin Velocity
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                  Track sales velocity, customer acquisition, true net margins, and warehouse turnover rates with interactive live visualizations.
                </p>

                <div className="space-y-2.5 pt-1">
                  {[
                    "Live revenue & gross profit progression curves",
                    "Per-product velocity & category revenue drivers",
                    "Customer lifetime value & cohort retention metrics",
                    "Custom CSV and PDF executive report exports",
                  ].map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-700 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-[#0A8A00] shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <a
                    href="/register"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#003399] text-white text-xs font-bold shadow-xs hover:bg-[#002B80] transition-colors"
                  >
                    <span>Launch BI Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Interactive Analytics Mockup */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3 text-xs">
                    <span className="font-extrabold text-zinc-950">Analytics Command Center</span>
                    <div className="flex items-center gap-1 rounded-lg border border-zinc-200/90 bg-zinc-50 p-0.5">
                      {(["7D", "30D", "90D", "1Y"] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setAnalyticsPeriod(p)}
                          className={cn(
                            "px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer",
                            analyticsPeriod === p ? "bg-white text-zinc-950 shadow-2xs" : "text-zinc-500"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Gross Sales</span>
                      <p className="text-base font-black text-zinc-950">
                        ${analyticsKpis[analyticsPeriod].gross.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-[#0A8A00] font-bold">{analyticsKpis[analyticsPeriod].growth}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Orders</span>
                      <p className="text-base font-black text-zinc-950">
                        {analyticsKpis[analyticsPeriod].orders.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-blue-600 font-bold">+12% volume</p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Margin</span>
                      <p className="text-base font-black text-[#003399]">
                        {analyticsKpis[analyticsPeriod].margin}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-semibold">Landed FIFO</p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Leading Sector</span>
                      <p className="text-base font-black text-zinc-950">Apparel</p>
                      <p className="text-[10px] text-purple-600 font-bold">54% of sales</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/40 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs pb-1">
                      <span className="font-extrabold text-zinc-950">Sales Growth Curve</span>
                      <span className="text-[11px] font-bold text-[#003399]">{analyticsPeriod} Period</span>
                    </div>
                    <AnimatedChart
                      data={analyticsChartData[analyticsPeriod]}
                      height={135}
                      color="#003399"
                      fillOpacity={0.15}
                      valuePrefix="$"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
