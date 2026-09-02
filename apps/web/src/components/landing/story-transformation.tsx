"use client";

import { useState } from "react";
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
  ArrowRight,
  Calculator,
  Landmark,
  Target,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export function StoryTransformation() {
  const [activeDomain, setActiveDomain] = useState<"commerce" | "operations" | "people" | "finance" | "growth">("commerce");

  const DOMAINS = {
    commerce: {
      title: "Commerce & Storefront",
      sub: "অনলাইন স্টোর, ড্র্যাগ & ড্রপ বিল্ডার, ক্যাটালগ ও চেকআউট",
      color: "border-blue-500 bg-blue-50/40 text-[#003399]",
      items: [
        { label: "ভিজ্যুয়াল স্টোর বিল্ডার", desc: "কোডিং ছাড়া নিজস্ব শপ ও সেকশন ডিজাইন" },
        { label: "পণ্য ও ভ্যারিয়েন্ট ক্যাটালগ", desc: "SKU, বারকোড, ক্রয়মূল্য ও বিক্রয়মূল্য" },
        { label: "স্মার্ট পেমেন্ট ও ডেলিভারি", desc: "বিকাশ, নগদ, কার্ড ও ইনস্ট্যান্ট কুরিয়ার ট্র্যাকিং" },
      ],
    },
    operations: {
      title: "Operations & POS",
      sub: "পিওএস টার্মিনাল, মাল্টি-ওয়্যারহাউস, পিও ও ওয়েস্ট ট্র্যাকার",
      color: "border-amber-500 bg-amber-50/40 text-amber-800",
      items: [
        { label: "কানেক্টেড পিওএস টার্মিনাল", desc: "ক্যাশ ড্রয়ার ব্যালেন্স ও শিফট রিকনসিলিয়েশন" },
        { label: "মাল্টি-ওয়্যারহাউস স্টক", desc: "লোকেশন ভিত্তিক রিয়েল-টাইম স্টক লেজার" },
        { label: "সাপ্লায়ার ক্রয় আদেশ (PO)", desc: "সাপ্লায়ার থেকে স্টক গ্রহণ ও ক্রয়মূল্য ট্র্যাকিং" },
      ],
    },
    people: {
      title: "People & HRM",
      sub: "কর্মী হাজিরা, ছুটি ব্যবস্থাপনা ও অডিটেড প্যারোল ইঞ্জিন",
      color: "border-purple-500 bg-purple-50/40 text-purple-800",
      items: [
        { label: "হাজিরা ও শিফট ট্র্যাকিং", desc: "দেরিতে আসা, অতিরিক্ত সময় ও ছুটির অটো হিসাব" },
        { label: "মাসিক প্যারোল ক্যালকুলেশন", desc: "অটো পে-স্লিপ (#PS-YYYYMM-XXXX) ও ভাউচার" },
        { label: "কর্মীদের সেলফ-সার্ভিস পোর্টাল", desc: "ছুটির আবেদন ও পে-স্লিপ ডাউনলোড সুবিধা" },
      ],
    },
    finance: {
      title: "Finance & Accounting",
      sub: "ডাবল-এন্ট্রি লেজার, ট্রায়াল ব্যালেন্স ও রিয়েল-টাইম লাভ-ক্ষতি (P&L)",
      color: "border-emerald-500 bg-emerald-50/40 text-emerald-800",
      items: [
        { label: "ব্যালেন্সড জেনারেল জার্নাল", desc: "প্রতিটি ট্রানজেকশনে Σ ডেবিট = Σ ক্রেডিট নিয়ম কার্যকর" },
        { label: "রিয়েল-টাইম P&L ও ব্যালেন্স শিট", desc: "রেভিনিউ - COGS - ব্যয় = নেট অপারেটিং প্রফিট" },
        { label: "স্বয়ংক্রিয় ব্যয় ও রাজস্ব পোস্টিং", desc: "অর্ডার ও ক্রয়ের সাথে সরাসরি লেজার ইন্টিগ্রেশন" },
      ],
    },
    growth: {
      title: "Growth & CRM",
      sub: "সিআরএম ডিল পাইপলাইন, কাস্টমার ৩৬০ ও সাপোর্ট ডেস্ক",
      color: "border-rose-500 bg-rose-50/40 text-rose-800",
      items: [
        { label: "কানবান ডিল পাইপলাইন", desc: "লিড থেকে ক্লোজড সেল পর্যন্ত প্রতিটি স্টেজ ট্র্যাকিং" },
        { label: "কাস্টমার ৩৬০ প্রোফাইল", desc: "লাইফটাইম ভ্যালু (LTV) ও পার্সোনালাইজড অফার" },
        { label: "সেন্ট্রাল সাপোর্ট টিকিট ডেস্ক", desc: "দ্রুততম কাস্টমার সাপোর্ট ও কনভার্সেশন থ্রেড" },
      ],
    },
  };

  const BUSINESS_FLOW = [
    { step: "১. ক্রয় (PO)", desc: "সাপ্লায়ার থেকে পণ্য গ্রহণ ও ট্রু কস্ট নির্ধারণ" },
    { step: "২. ইনভেন্টরি", desc: "ওয়্যারহাউস স্টক বৃদ্ধি ও লেজার আপডেট" },
    { step: "৩. বিক্রয় (POS/Web)", desc: "ইনস্ট্যান্ট স্টক সমন্বয় ও পেমেন্ট রিসিভ" },
    { step: "৪. COGS ও লাভ", desc: "প্রকৃত খরচের ভিত্তিতে নিট লাভ হিসাব" },
    { step: "৫. অ্যাকাউন্টিং", desc: "ডাবল-এন্ট্রি লেজারে স্বয়ংক্রিয় এন্ট্রি" },
    { step: "৬. কাস্টমার লয়ালটি", desc: "সিআরএম ও অটোমেশনের মাধ্যমে পুনরাবৃত্ত বিক্রয়" },
  ];

  return (
    <section id="platform-architecture" className="py-20 sm:py-24 bg-[#F5F5F5] border-b border-[#DFDFDF] scroll-mt-20">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#003399] bg-[#003399]/10 px-3 py-1 rounded-[4px] border border-[#003399]/20">
            এক প্ল্যাটফর্মে সম্পূর্ণ সমাধান
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#111111]">
            আপনার ব্যবসা কাজ করবে একটি মাত্র সিস্টেম হিসেবে।
          </h2>
          <p className="text-base sm:text-lg text-[#484848] leading-relaxed font-normal">
            আলাদা আলাদা সফটওয়্যার বাদ দিয়ে একটি সেন্ট্রাল ডাটা মডেলে আপনার পণ্য, কাস্টমার, স্টক, কর্মী ও অর্থায়ন পরিচালনা করুন।
          </p>
        </div>

        {/* Interactive Architecture Domain Selector */}
        <div className="max-w-5xl mx-auto bg-white rounded-[12px] border border-[#DFDFDF] p-6 shadow-[0_4px_16px_rgba(17,17,17,0.06)] mb-14">
          <div className="flex flex-wrap items-center justify-center gap-2 pb-5 border-b border-[#DFDFDF]">
            {(["commerce", "operations", "people", "finance", "growth"] as const).map((key) => {
              const isActive = activeDomain === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveDomain(key)}
                  className={`px-4 py-2 rounded-[4px] text-xs font-bold capitalize transition-all ${
                    isActive
                      ? "bg-[#003399] text-white shadow-xs"
                      : "bg-[#F5F5F5] text-[#484848] hover:bg-zinc-200"
                  }`}
                >
                  {DOMAINS[key].title}
                </button>
              );
            })}
          </div>

          <div className="pt-6 space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-[#111111]">{DOMAINS[activeDomain].title}</h3>
              <p className="text-xs text-[#767676]">{DOMAINS[activeDomain].sub}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
              {DOMAINS[activeDomain].items.map((item, idx) => (
                <div key={idx} className="p-4 rounded-[4px] bg-[#F5F5F5] border border-[#DFDFDF] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#003399] font-bold text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0A8A00]" />
                    <span>{item.label}</span>
                  </div>
                  <p className="text-xs text-[#484848] pl-6 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* One Business, One System Flow Visual */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-[#111111]">
              নিরবচ্ছিন্ন বিজনেস ডেটা ফ্লো (End-to-End Business Lifecycle)
            </h3>
            <p className="text-xs sm:text-sm text-[#767676] mt-1">
              একবার ডাটা এন্ট্রি হবে, প্রতিটি মডিউল স্বয়ংক্রিয়ভাবে আপডেট হবে
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {BUSINESS_FLOW.map((flow, i) => (
              <div
                key={i}
                className="relative rounded-[4px] border border-[#DFDFDF] bg-white p-3.5 space-y-1 text-center shadow-2xs hover:border-[#003399] transition-all"
              >
                <span className="text-[10px] font-bold text-[#003399] uppercase tracking-wider block">
                  {flow.step}
                </span>
                <p className="text-xs text-[#484848] leading-snug">{flow.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
