"use client";

import { landingContainer } from "./landing-ui";
import {
  Store,
  PackagePlus,
  ShoppingCart,
  Users,
  Sparkles,
} from "lucide-react";

export function StoryGrowth() {
  const STAGES = [
    {
      stage: "ধাপ ০১",
      title: "আরও পণ্য যোগ করুন",
      unlocked: "প্রথম ২৫টি পণ্য দিয়ে শুরু করে হাজার হাজার ক্যাটাগরি ও পণ্য অবাধে আপলোড করুন।",
      icon: PackagePlus,
    },
    {
      stage: "ধাপ ০২",
      title: "আরও অর্ডার নিন",
      unlocked: "দৈনিক ১০টি থেকে শত শত অর্ডার কোনো ঝামেলা ছাড়াই স্বয়ংক্রিয়ভাবে গ্রহণ ও প্রসেস করুন।",
      icon: ShoppingCart,
    },
    {
      stage: "ধাপ ০৩",
      title: "আরও কাস্টমার পান",
      unlocked: "গ্রাহকদের সমস্ত অর্ডার হিস্ট্রি, ফোন নম্বর ও ইমেইল সংরক্ষণ করে কাস্টমার ধরে রাখুন।",
      icon: Users,
    },
    {
      stage: "ধাপ ০৪",
      title: "বিক্রি ও রিপোর্ট বুঝুন",
      unlocked: "ব্যবসায়ের প্রতিটি স্তরের লাভ-ক্ষতি, গ্রোথ ও বিক্রি নিয়ে স্পষ্ট সিদ্ধান্ত নিন।",
      icon: Store,
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            ব্যবসার প্রসারণ
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            আজ ছোট, কাল আরও বড়।
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            আপনার ব্যবসা যত বড় হবে, আপনার প্ল্যাটফর্মও তত সহজে আপনার সাথে বড় হবে।
          </p>
        </div>

        {/* Growth Stages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {STAGES.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-zinc-200/90 bg-zinc-50/40 hover:bg-white hover:shadow-lg hover:border-blue-500/80 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-zinc-400">
                      {s.stage}
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-zinc-950">{s.title}</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">{s.unlocked}</p>
                </div>

                <div className="pt-3 border-t border-zinc-200/60 text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> শতভাগ স্কেলযোগ্য
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
