"use client";

import { landingContainer } from "./landing-ui";
import {
  ShoppingCart,
  CreditCard,
  Boxes,
  Bell,
  Truck,
  ArrowDown,
  CheckCircle2,
} from "lucide-react";

export function StoryAutomation() {
  const WORKFLOW = [
    {
      step: "০১",
      title: "নতুন অর্ডার এসেছে",
      desc: "গ্রাহক আপনার অনলাইন শপে সহজ চেকআউটের মাধ্যমে অর্ডার প্লেস করেছে।",
      icon: ShoppingCart,
    },
    {
      step: "০২",
      title: "পেমেন্ট সফল হয়েছে",
      desc: "বিকাশ বা নগদের TrxID ও ক্যাশ অন ডেলিভারির তথ্য সিস্টেম সাথে সাথে ভেরিফাই করেছে।",
      icon: CreditCard,
    },
    {
      step: "০৩",
      title: "স্টক অটোমেটিক আপডেট",
      desc: "বিক্রি হওয়া পণ্যের ইনভেন্টরি স্টক স্বয়ংক্রিয়ভাবে হিসাব থেকে কমে গেছে।",
      icon: Boxes,
    },
    {
      step: "০৪",
      title: "অটো SMS ও PDF ইনভয়েস",
      desc: "গ্রাহকের মোবাইলে SMS অ্যালার্ট ও সাথে সাথে পিডিএফ ইনভয়েস জেনারেট হয়েছে।",
      icon: Bell,
    },
    {
      step: "০৫",
      title: "কুরিয়ারের পিকআপ কনফার্মড",
      desc: "পাঠাও বা স্টেডফাস্টের পিকআপ রিকোয়েস্ট অটোমেটিক সিস্টেমে বুক হয়ে গেছে।",
      icon: Truck,
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            অটোমেশন ও অ্যাক্টিভিটি
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            আপনি ব্যস্ত থাকলেও ব্যবসা চলবে।
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            অর্ডার, কাস্টমার ও ব্যবসার গুরুত্বপূর্ণ কাজগুলো সহজভাবে ম্যানেজ করুন—যেখান থেকেই হোক।
          </p>
        </div>

        {/* Vertical Connected Workflow */}
        <div className="max-w-2xl mx-auto space-y-3">
          {WORKFLOW.map((w, idx) => {
            const Icon = w.icon;
            const isLast = idx === WORKFLOW.length - 1;
            return (
              <div key={idx} className="space-y-3">
                <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/50 p-5 shadow-xs flex items-center justify-between gap-4 hover:bg-white hover:border-emerald-500/80 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white font-bold text-xs shrink-0 shadow-2xs">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-zinc-400">ধাপ {w.step}</span>
                        <span className="text-zinc-300">·</span>
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-950">{w.title}</h4>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{w.desc}</p>
                    </div>
                  </div>

                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> সম্পন্ন
                  </span>
                </div>

                {!isLast && (
                  <div className="flex justify-center py-0.5">
                    <div className="h-5 w-0.5 bg-zinc-300 relative flex items-center justify-center">
                      <ArrowDown className="h-3 w-3 text-zinc-400 -mb-2" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
