"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";
import { ChevronDown } from "lucide-react";
import { useLandingLocale } from "./landing-locale";

export function StoryFAQ() {
  const { locale, t } = useLandingLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = t.faq?.items && t.faq.items.length > 0 ? t.faq.items : [
    {
      q: "আমি কীভাবে আমার অনলাইন দোকান শুরু করব?",
      a: "ফ্রি সাইন আপ করুন, দোকানের নাম দিন, বিল্ডারে হোমপেজ সাজান, পণ্য যোগ করুন ও পেমেন্ট কানেক্ট করুন—সাধারণত ৩০ মিনিটের মধ্যেই আপনার অনলাইন শপ বিক্রি শুরুর জন্য রেডি হয়ে যাবে।",
    },
    {
      q: "কোডিং জানা কি দরকার?",
      a: "একদমই না। কোনো কোডিং জ্ঞান বা ডোমেইন-টেক অভিজ্ঞতা ছাড়াই ড্র্যাগ অ্যান্ড ড্রপ ভিজ্যুয়াল বিল্ডারের মাধ্যমে নিজের মতো করে দোকান তৈরি ও ডিজাইন করতে পারবেন।",
    },
    {
      q: "আমি কি নিজের ডোমেইন ব্যবহার করতে পারব?",
      a: "হ্যাঁ। আপনার কেনা যেকোনো কাস্টম ডোমেইন (যেমন: www.yourbrand.com) সহজেই কানেক্ট করতে পারবেন। স্বয়ংক্রিয় ফ্রি SSL সিকিউরিটি সার্টিফিকেট অন্তর্ভুক্ত থাকবে।",
    },
    {
      q: "পেমেন্ট কীভাবে নেব?",
      a: "বিকাশ, নগদ, রকেট, ডেবিট/ক্রেডিট কার্ড এবং ক্যাশ অন ডেলিভারি (COD) পেমেন্ট সুবিধা সরাসরি আপনার চেকআউটে যুক্ত থাকবে।",
    },
    {
      q: "অর্ডার কীভাবে ম্যানেজ করব?",
      a: "একটি মাত্র সেন্ট্রাল ড্যাশবোর্ড থেকেই লাইভ অর্ডার দেখতে পাবেন, অটোমেটিক গ্রাহকের কাছে SMS পাঠাতে পারবেন এবং পাঠাও বা স্টেডফাস্টের কুরিয়ার বুকিং করতে পারবেন।",
    },
    {
      q: "আমি কি পরে আমার প্ল্যান পরিবর্তন করতে পারব?",
      a: "হ্যাঁ। আপনার দোকানের দরকার অনুযায়ী যেকোনো সময় ড্যাশবোর্ড থেকেই নিজের প্ল্যান আপগ্রেড বা পরিবর্তন করে নিতে পারবেন।",
    },
    {
      q: "মোবাইল থেকে কি দোকান ম্যানেজ করা যাবে?",
      a: "হ্যাঁ! মোবাইল, ট্যাবলেট বা ল্যাপটপ—যেকোনো ডিভাইসের ব্রাউজার থেকে আপনার পুরো দোকান, পণ্য ও অর্ডার সহজেই সামলাতে পারবেন।",
    },
  ];

  return (
    <section id="faq" className="py-20 sm:py-24 bg-zinc-50/50 border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-start">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {t.faq?.eyebrow || (locale === "bn" ? "সাধারণ প্রশ্ন উত্তর" : "FAQ")}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
              {t.faq?.title || (locale === "bn" ? "সাধারণ কিছু প্রশ্ন" : "Questions, answered")}
            </h2>
            <p className="text-base text-zinc-600 leading-relaxed font-normal">
              {t.faq?.description || (locale === "bn" ? "অনলাইন দোকান শুরু করা এবং পরিচালনা করা নিয়ে সচরাচর যে বিষয়গুলো জানতে চাওয়া হয়।" : "Short answers to the things people ask first.")}
            </p>
          </div>

          {/* Right Column: Accordion */}
          <div className="lg:col-span-7 divide-y divide-zinc-200/70">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              const contentId = `faq-answer-${idx}`;
              return (
                <div key={idx} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    className="flex w-full items-center justify-between text-left py-2 gap-4 text-sm sm:text-base font-bold text-zinc-950 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg px-1"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div
                      id={contentId}
                      className="pt-2 pb-2 text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal"
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
