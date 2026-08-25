"use client";

import { landingContainer } from "./landing-ui";
import { Star, Store, Sparkles, ShoppingBag, Award } from "lucide-react";

export function StorySocialProof() {
  const STATS = [
    { label: "সক্রিয় অনলাইন শপ", val: "৫০০+", icon: Store },
    { label: "পণ্য ক্যাটালগ", val: "১০,০০০+", icon: Sparkles },
    { label: "অর্ডার প্রসেসড", val: "৫০,০০০+", icon: ShoppingBag },
    { label: "কাস্টমার রেটিং", val: "৪.৯ / ৫", icon: Award },
  ];

  return (
    <section className="py-20 sm:py-24 bg-zinc-50/50 border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            উদ্যোক্তাদের অভিজ্ঞতা
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            বাংলার উদ্যোক্তারা তাদের ব্যবসা চালাচ্ছেন আরও সহজে।
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            ফেসবুক ও ইনস্টাগ্রাম বিক্রেতা, বুটিক ব্র্যান্ড ও নতুন উদ্যোক্তারা BornoLand ব্যবহার করে আত্মবিশ্বাসের সাথে ব্যবসা চালাচ্ছেন।
          </p>
        </div>

        {/* Compact Trust Metrics Strip */}
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {STATS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs text-center space-y-1 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-center gap-1.5 text-zinc-950 font-extrabold text-2xl">
                  <Icon className="h-4 w-4 text-blue-600" />
                  <span>{s.val}</span>
                </div>
                <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Large Featured Testimonial */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-zinc-200/90 bg-white p-8 sm:p-12 shadow-xl space-y-6">
          <div className="flex gap-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400" />
            ))}
          </div>

          <p className="text-xl sm:text-2xl font-semibold text-zinc-950 leading-relaxed">
            &ldquo;এক বিকেলেই আমার অনলাইন দোকান চালু করেছি। পেমেন্ট, বিকাশ, কুরিয়ার পিকআপ আর বিল্ডার—সব এক জায়গায় থাকায় আর পাঁচটা আলাদা টুল নিয়ে দৌড়াদৌড়ি করতে হয় না।&rdquo;
          </p>

          <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
            <div>
              <p className="text-base font-bold text-zinc-950">সারা আহমেদ</p>
              <p className="text-xs text-zinc-500">
                প্রতিষ্ঠাতা · <span className="font-semibold text-zinc-900">অরা লাইফস্টাইল বুটিক</span>
              </p>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
              ভেরিফায়েড মার্চেন্ট
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
