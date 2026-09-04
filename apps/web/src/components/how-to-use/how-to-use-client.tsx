"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserPlus,
  Building2,
  Store,
  Settings,
  PackagePlus,
  Tags,
  Boxes,
  ShoppingBag,
  QrCode,
  Users,
  Fingerprint,
  FileText,
  ShieldCheck,
  CreditCard,
  Globe,
  Rocket,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StepItem {
  number: number;
  id: string;
  title: string;
  icon: typeof UserPlus;
  shortExplanation: string;
  instructions: string[];
  docSlug: string;
  docTitle: string;
  tips?: string;
  visualPreview?: {
    type: "badge" | "code" | "mockup";
    label: string;
    details: string;
  };
}

const STEPS: StepItem[] = [
  {
    number: 1,
    id: "create-account",
    title: "Create an Account",
    icon: UserPlus,
    shortExplanation:
      "Register your master owner account to establish identity, password recovery, and security credentials.",
    instructions: [
      "Navigate to the registration page (/register) on your desktop or tablet.",
      "Enter your full name, primary work email address, and a strong password.",
      "Verify your email address via the confirmation link sent to your inbox.",
      "Optionally add your phone number for instant SMS alerts regarding mission-critical events.",
    ],
    docSlug: "getting-started",
    docTitle: "Getting Started Guide",
    tips: "Use an official business email so team members recognize company invites.",
  },
  {
    number: 2,
    id: "create-workspace",
    title: "Create Your Workspace",
    icon: Building2,
    shortExplanation:
      "A Workspace holds your overarching organization data, chart of accounts, and team memberships.",
    instructions: [
      "Upon first login, the onboarding wizard will prompt you to name your Workspace (e.g. 'Apex Retail BD').",
      "Choose your default operating currency (BDT ৳) and timezone (Asia/Dhaka).",
      "Upload your company logo to appear on invoices, thermal receipts, and team invites.",
    ],
    docSlug: "account-workspace",
    docTitle: "Workspace Management Documentation",
  },
  {
    number: 3,
    id: "create-store",
    title: "Create a Store or Outlet",
    icon: Store,
    shortExplanation:
      "Stores represent customer-facing sales channels, physical showroom branches, or online storefronts.",
    instructions: [
      "Click '+ Create Store' in your workspace navigation bar.",
      "Provide a store title (e.g. 'Banani Flagship Outlet' or 'Online D2C Shop').",
      "Select an initial subdomain (e.g. 'banani.bornoland.com'). You can link a custom domain later.",
      "Choose whether this store will operate with physical POS registers, online checkout, or both.",
    ],
    docSlug: "stores",
    docTitle: "Store Creation Documentation",
  },
  {
    number: 4,
    id: "configure-settings",
    title: "Configure Store Settings",
    icon: Settings,
    shortExplanation:
      "Fine-tune delivery fees, local taxes, operational hours, and contact info for customers.",
    instructions: [
      "Open Store Settings > General to set your WhatsApp support line and official return policy.",
      "Under Shipping & Delivery, set flat courier fees (e.g. ৳ 80 inside Dhaka, ৳ 150 outside Dhaka).",
      "Under Payment Settings, toggle Cash on Delivery (COD) and connect bKash/Nagad merchant credentials.",
    ],
    docSlug: "stores",
    docTitle: "Store Settings Documentation",
  },
  {
    number: 5,
    id: "add-products",
    title: "Add Your Products",
    icon: PackagePlus,
    shortExplanation:
      "Populate your catalog with single products, multi-size apparel variants, SKUs, and imagery.",
    instructions: [
      "Click 'Products' in the sidebar and select '+ New Product'.",
      "Fill in the product title, rich description, and upload high-resolution product photos.",
      "If you sell apparel or footwear, add variant options (e.g. Size: S/M/L, Color: Navy/Black).",
      "Enter the Retail Price, Cost of Goods (COGS), and optional Wholesale Price.",
    ],
    docSlug: "products",
    docTitle: "Product Catalog Documentation",
    tips: "Add barcode strings to every variant to enable 1-second scanning at the POS register.",
  },
  {
    number: 6,
    id: "add-categories",
    title: "Organize Categories & Brands",
    icon: Tags,
    shortExplanation:
      "Structure your taxonomy so customers and POS cashiers can filter items quickly.",
    instructions: [
      "Navigate to 'Categories' under your store dashboard.",
      "Create top-level parent categories (e.g. 'Men', 'Women', 'Electronics').",
      "Nest subcategories (e.g. 'Men > Casual Shirts') and assign brand names for easy merchandising.",
    ],
    docSlug: "products",
    docTitle: "Category Organization Documentation",
  },
  {
    number: 7,
    id: "configure-inventory",
    title: "Configure Multi-Warehouse Inventory",
    icon: Boxes,
    shortExplanation:
      "Establish initial stock counts per location, set low-stock thresholds, and assign warehouses.",
    instructions: [
      "Go to 'Inventory > Warehouses' to declare your main storage facility and outlet backrooms.",
      "Use the 'Stock Adjustment' tool or upload a CSV to set opening quantities per SKU.",
      "Define minimum safe stock levels so BornoLand warns you before items sell out.",
    ],
    docSlug: "inventory",
    docTitle: "Inventory Control Documentation",
  },
  {
    number: 8,
    id: "receive-orders",
    title: "Receive & Fulfill Orders",
    icon: ShoppingBag,
    shortExplanation:
      "Process incoming sales, dispatch with 1-click courier integrations, and generate A4 invoices.",
    instructions: [
      "When a customer orders online, your dashboard shows an instant notification.",
      "Open the order, confirm items and delivery address, then click 'Create Shipment'.",
      "Select your integrated courier (Pathao, Steadfast, RedX) to fetch an instant tracking barcode.",
      "Print the customer invoice and packing slip with one click.",
    ],
    docSlug: "orders",
    docTitle: "Order Fulfillment Documentation",
  },
  {
    number: 9,
    id: "use-pos",
    title: "Use the Point of Sale (POS) Register",
    icon: QrCode,
    shortExplanation:
      "Launch cashier checkout on tablet or desktop with laser scanning, offline mode, and bKash QR.",
    instructions: [
      "Open the POS Terminal from your store sidebar and click 'Start Cashier Shift'.",
      "Enter your starting cash float in the register drawer.",
      "Scan item barcodes with a handheld laser or tap category quick buttons.",
      "Select the payment method: Cash, Card, or dynamic bKash QR Code, and print the thermal receipt.",
    ],
    docSlug: "pos",
    docTitle: "Point of Sale Documentation",
    tips: "POS runs completely offline if broadband drops, auto-syncing sales when reconnected.",
  },
  {
    number: 10,
    id: "add-employees",
    title: "Add Employees & Store Staff",
    icon: Users,
    shortExplanation:
      "Maintain staff records, assign designations, and link employees to specific store branches.",
    instructions: [
      "Navigate to 'HRM > Employees' and click '+ Add Employee'.",
      "Enter the employee's National ID (NID), emergency contact, joining date, and designation.",
      "Assign their primary store location (e.g. 'Banani Outlet') and base monthly salary.",
    ],
    docSlug: "hrm",
    docTitle: "HRM Directory Documentation",
  },
  {
    number: 11,
    id: "configure-hrm",
    title: "Configure Attendance & Shift Rules",
    icon: Fingerprint,
    shortExplanation:
      "Connect biometric fingerprint scanners, define work shifts, and handle leave requests.",
    instructions: [
      "Set up work shifts under 'HRM > Shifts' (e.g. Morning: 10:00 AM – 6:00 PM).",
      "Link your ZKTeco or compatible biometric timeclock device, or enable mobile GPS check-in.",
      "Staff can submit leave requests directly; managers review and approve in 1 click.",
    ],
    docSlug: "hrm",
    docTitle: "Attendance & Shifts Documentation",
  },
  {
    number: 12,
    id: "configure-payroll",
    title: "Configure & Run Automated Payroll",
    icon: FileText,
    shortExplanation:
      "Generate monthly salary sheets with allowances, tax withholdings, bonuses, and digital payslips.",
    instructions: [
      "At month-end, open 'HRM > Payroll' and click 'Generate Monthly Payroll'.",
      "BornoLand automatically pulls biometric attendance logs to calculate exact payable days.",
      "Review allowances (House Rent, Conveyance) and deductions (Provident Fund, Advance Salary).",
      "Approve the payroll run and download the BEFTN bank disbursal sheet and PDF payslips.",
    ],
    docSlug: "payroll",
    docTitle: "Payroll Processing Documentation",
  },
  {
    number: 13,
    id: "manage-permissions",
    title: "Manage Role-Based Permissions",
    icon: ShieldCheck,
    shortExplanation:
      "Enforce least-privilege security so cashiers cannot view cost margins or general ledgers.",
    instructions: [
      "Go to 'Workspace Settings > Team & Permissions'.",
      "Assign pre-built roles (Store Manager, Cashier, Accountant) or create custom permission sets.",
      "Lock cashiers strictly to their assigned register terminal.",
    ],
    docSlug: "team-permissions",
    docTitle: "Permissions & Security Documentation",
  },
  {
    number: 14,
    id: "configure-billing",
    title: "Configure Plan & Billing",
    icon: CreditCard,
    shortExplanation:
      "Select your subscription tier (Starter, Business, Professional) and pay in BDT via cards or bKash.",
    instructions: [
      "Navigate to 'Workspace Settings > Billing & Plans'.",
      "Review your tier limits (stores, staff seats, register outlets).",
      "Switch to Annual billing to save 20%, and enter payment details securely.",
    ],
    docSlug: "plans-billing",
    docTitle: "Plans & Billing Documentation",
  },
  {
    number: 15,
    id: "connect-domain",
    title: "Connect Your Custom Domain",
    icon: Globe,
    shortExplanation:
      "Brand your online store with your own custom .com or .com.bd domain with zero-config SSL.",
    instructions: [
      "Go to 'Store Settings > Domains' and enter your domain name (e.g. 'mybrand.com').",
      "In your domain registrar (e.g. GoDaddy, Namecheap), create an A record pointing to BornoLand IP.",
      "Click 'Verify Domain'. BornoLand automatically generates an SSL certificate within minutes.",
    ],
    docSlug: "domains",
    docTitle: "Custom Domains Documentation",
  },
  {
    number: 16,
    id: "publish-store",
    title: "Publish & Launch Your Enterprise",
    icon: Rocket,
    shortExplanation:
      "Test end-to-end checkout, activate POS terminals on retail floors, and start selling.",
    instructions: [
      "Perform a test order on your live storefront to verify courier and payment gateway routing.",
      "Ensure cash drawers and barcode printers are tested on your physical register stations.",
      "Toggle your store status from 'Draft' to 'Live' and welcome your first customers!",
    ],
    docSlug: "store-builder",
    docTitle: "Storefront Publishing Documentation",
  },
];

export function HowToUseClient() {
  const [activeStepId, setActiveStepId] = useState<string>(STEPS[0].id);

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#181c20] font-sans antialiased py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ebeef4] rounded-full text-xs font-semibold text-[#1664d9] mb-3 border border-[#dfe3e8]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step-by-Step Onboarding Playbook</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#181c20]">
            How to Use BornoLand
          </h1>
          <p className="text-sm sm:text-base text-[#424754] mt-3 leading-relaxed">
            Follow our proven 16-step setup blueprint to launch your online store, set up physical retail POS registers, organize multi-warehouse stock, and automate payroll.
          </p>
        </div>

        {/* 2-Column Grid: Left Sticky Navigator & Right Steps Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Step Navigator (Sticky) */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24 bg-white p-5 rounded-2xl border border-[#dfe3e8] shadow-2xs space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#727785] pb-2 border-b border-[#f1f4fa]">
                16 Setup Milestones
              </div>
              <nav className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
                {STEPS.map((step) => {
                  const isActive = activeStepId === step.id;
                  return (
                    <a
                      key={step.id}
                      href={`#${step.id}`}
                      onClick={() => setActiveStepId(step.id)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all",
                        isActive
                          ? "bg-[#1664d9] text-white font-bold shadow-2xs"
                          : "text-[#424754] hover:bg-[#f1f4fa] hover:text-[#181c20] font-medium"
                      )}
                    >
                      <span
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                          isActive
                            ? "bg-white text-[#1664d9]"
                            : "bg-[#ebeef4] text-[#424754]"
                        )}
                      >
                        {step.number}
                      </span>
                      <span className="truncate">{step.title}</span>
                    </a>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-[#f1f4fa]">
                <Link
                  href="/docs"
                  className="w-full py-2 bg-[#f1f4fa] hover:bg-[#e5e8ee] text-[#1664d9] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Explore Full Documentation</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Steps Content Column */}
          <main className="lg:col-span-8 space-y-8">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const nextStep = idx < STEPS.length - 1 ? STEPS[idx + 1] : null;

              return (
                <section
                  key={step.id}
                  id={step.id}
                  className="scroll-mt-24 bg-white p-6 sm:p-8 rounded-2xl border border-[#dfe3e8] shadow-sm relative overflow-hidden group"
                >
                  {/* Step Badge */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1664d9]/10 text-[#1664d9] flex items-center justify-center font-bold shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#1664d9]">
                          Step {step.number} of 16
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#181c20]">
                          {step.title}
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* Short Explanation */}
                  <p className="text-sm text-[#424754] leading-relaxed mb-6 font-medium">
                    {step.shortExplanation}
                  </p>

                  {/* Instructions List */}
                  <div className="bg-[#f7f9ff] p-5 rounded-xl border border-[#dfe3e8]/70 space-y-3 mb-6">
                    <div className="text-xs font-bold text-[#181c20] uppercase tracking-wider">
                      Action Steps
                    </div>
                    <ul className="space-y-2.5">
                      {step.instructions.map((inst, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-2.5 text-xs text-[#181c20]">
                          <CheckCircle2 className="w-4 h-4 text-[#006e2a] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{inst}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pro Tip Callout */}
                  {step.tips && (
                    <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-950 mb-6">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold block mb-0.5">Pro Tip:</strong>
                        <span>{step.tips}</span>
                      </div>
                    </div>
                  )}

                  {/* Footer Bar: Doc Link & Next Step Button */}
                  <div className="pt-4 border-t border-[#f1f4fa] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <Link
                      href={`/docs/${step.docSlug}`}
                      className="text-[#1664d9] font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Read {step.docTitle}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {nextStep && (
                      <a
                        href={`#${nextStep.id}`}
                        onClick={() => setActiveStepId(nextStep.id)}
                        className="inline-flex items-center gap-1 text-[#424754] font-medium hover:text-[#181c20]"
                      >
                        <span>Next: {nextStep.title}</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </section>
              );
            })}

            {/* Completion CTA */}
            <div className="p-8 bg-[#0F172A] text-white rounded-2xl text-center space-y-4">
              <Sparkles className="w-8 h-8 text-[#8ffa9b] mx-auto" />
              <h3 className="text-xl sm:text-2xl font-bold">
                Ready to Launch Your Business Operating System?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                Start your 7-day free trial today. No credit card required. Set up your workspace in under 3 minutes.
              </p>
              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1664d9] hover:bg-[#004caf] text-white rounded-xl text-sm font-bold shadow-md transition-all"
                >
                  <span>Start Free 7-Day Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
