"use client";

import { landingContainer } from "./landing-ui";
import {
  Globe,
  Package,
  Boxes,
  ShoppingCart,
  CreditCard,
  Truck,
  Users,
  FileSpreadsheet,
  LineChart,
} from "lucide-react";

export function StoryTransformation() {
  const ECOSYSTEM = [
    { label: "অনলাইন স্টোর", sub: "কোডিং ছাড়া নিজস্ব শপ", icon: Globe },
    { label: "পণ্য ম্যানেজমেন্ট", sub: "ছবি, দাম ও ক্যাটাগরি", icon: Package },
    { label: "অর্ডার ম্যানেজমেন্ট", sub: "লাইভ স্ট্যাটাস ট্র্যাকিং", icon: ShoppingCart },
    { label: "কাস্টমার ম্যানেজমেন্ট", sub: "অর্ডার হিস্ট্রি ও ডাটা", icon: Users },
    { label: "পেমেন্ট সিস্টেম", sub: "বিকাশ, নগদ ও COD", icon: CreditCard },
    { label: "ডেলিভারি", sub: "কুরিয়ার ইন্টিগ্রেশন", icon: Truck },
    { label: "স্টক কন্ট্রোল", sub: "অটো লো-স্টক অ্যালার্ট", icon: Boxes },
    { label: "ইনভয়েস ও রিপোর্ট", sub: "অটো PDF ইনভয়েস", icon: FileSpreadsheet },
    { label: "সেলস অ্যানালিটিক্স", sub: "দৈনিক আয়ের হিসাব", icon: LineChart },
  ];

  return (
    <section id="features" className="py-20 sm:py-24 bg-zinc-50/50 border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            অল-ইন-ওয়ান সিস্টেম
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            আপনার পুরো ব্যবসা, এক জায়গায়।
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            আলাদা আলাদা পেপার বা সফটওয়্যার ছেড়ে একটি মাত্র ড্যাশবোর্ডে পুরো স্টোর ও অর্ডার সামলান।
          </p>
        </div>

        {/* 9 Connected Category Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ECOSYSTEM.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group rounded-2xl border border-zinc-200/80 bg-white p-5 space-y-3 shadow-2xs hover:border-blue-500 hover:shadow-md transition-all flex items-center gap-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-950 group-hover:text-blue-600 transition-colors">
                    {item.label}
                  </h4>
                  <p className="text-xs text-zinc-500 font-medium">{item.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
