"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowLeft, ShieldCheck, Zap, Store, Layers, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { LanguageSwitcher } from "@/components/user/language-switcher";

type AuthShellProps = {
  children: ReactNode;
  variant?: "login" | "register" | "recovery";
};

export function AuthShell({ children, variant = "login" }: AuthShellProps) {
  const { language } = useLanguage();
  const isBn = false;

  const highlights = [
    {
      icon: Store,
      title: isBn ? "কানেক্টেড কমার্স ও পিওএস" : "Connected Commerce & POS",
      desc: isBn ? "এক ডাটাবেসেই অনলাইন স্টোরফ্রন্ট এবং খুচরা দোকানের পিওএস।" : "Unified online storefront and retail POS in one real-time database.",
    },
    {
      icon: Layers,
      title: isBn ? "মাল্টি-ওয়্যারহাউস ও ট্রু কস্ট" : "Multi-Warehouse & True Cost",
      desc: isBn ? "সঠিক স্টক ব্যালেন্স ও FIFO ভিত্তিক পণ্য ক্রয় মূল্য হিসাব।" : "Accurate location-based inventory and landed FIFO valuation.",
    },
    {
      icon: ShieldCheck,
      title: isBn ? "অ্যাকাউন্টিং ও প্যারোল ইন্টিগ্রেশন" : "Accounting & Payroll Integration",
      desc: isBn ? "স্বয়ংক্রিয় ডাবল-এন্ট্রি লেজার পোস্টিং ও কর্মীদের অডিটেড পে-স্লিপ।" : "Automated double-entry journals and audit-ready team payroll.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-zinc-50/80 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#003399] text-white shadow-xs group-hover:bg-[#002B80] transition-colors">
              <Image
                src="/logo.png"
                alt="BornoLand"
                width={20}
                height={20}
                className="h-5 w-5 object-contain brightness-0 invert"
              />
            </div>
            <span className="text-base font-black tracking-tight text-zinc-950 dark:text-white">
              Borno<span className="text-[#003399] dark:text-[#FFDA1A]">Land</span>
            </span>
          </Link>

          {/* Right Controls: Language Switcher & Home link */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-bold text-zinc-700 shadow-2xs hover:bg-zinc-50 hover:text-zinc-950 transition-colors dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isBn ? "হোমে ফিরে যান" : "Back to Home"}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid w-full items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Left Value Proposition (Desktop) */}
            <aside className="hidden lg:block lg:col-span-6 xl:col-span-7 space-y-6 min-w-0 pr-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-extrabold text-[#003399] uppercase tracking-wider">
                <Zap className="h-3 w-3" />
                <span>{isBn ? "বিজনেস অপারেটিং সিস্টেম" : "Business Operating System"}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.15] text-balance">
                {variant === "register"
                  ? isBn
                    ? "একটি প্ল্যাটফর্ম থেকেই আপনার পুরো ব্যবসা শুরু ও পরিচালনা করুন।"
                    : "Build and scale your entire enterprise from one powerful platform."
                  : variant === "recovery"
                  ? isBn
                    ? "আপনার অ্যাকাউন্টে পুনরায় প্রবেশের জন্য পাসওয়ার্ড রিসেট করুন।"
                    : "Reset your password to securely regain access to your workspace."
                  : isBn
                  ? "সাইন ইন করুন এবং আত্মবিশ্বাসের সাথে আপনার ব্যবসা পরিচালনা করুন।"
                  : "Sign in and manage your business operations with confidence."}
              </h1>

              <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl font-normal">
                {isBn
                  ? "অনলাইন স্টোরফ্রন্ট, রিটেল পিওএস, মাল্টি-ওয়্যারহাউস স্টক, ডাবল-এন্ট্রি অ্যাকাউন্টিং ও কর্মী বেতন—সবকিছু এক সেন্ট্রাল সিস্টেমে।"
                  : "Unify your storefront, retail POS, multi-warehouse stock, double-entry accounting, and team payroll in one seamless cloud workspace."}
              </p>

              {/* Feature Value Highlights */}
              <div className="space-y-4 pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
                {highlights.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#003399] dark:bg-blue-950 dark:text-blue-400">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.title}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Right Form Container (Desktop & Mobile) */}
            <div className="w-full lg:col-span-6 xl:col-span-5 max-w-md mx-auto min-w-0">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200/60 py-4 text-center text-xs text-zinc-400 dark:border-zinc-800">
        <p>© {new Date().getFullYear()} BornoLand. {isBn ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved."}</p>
      </footer>
    </div>
  );
}
