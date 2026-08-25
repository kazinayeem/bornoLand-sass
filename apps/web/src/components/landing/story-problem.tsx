"use client";

import { landingContainer } from "./landing-ui";
import {
  MessageSquareX,
  PackageX,
  UserX,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function StoryProblem() {
  const PROBLEMS = [
    {
      title: "অর্ডার হারিয়ে যাচ্ছে",
      description: "ফেসবুক ও ইনস্টাগ্রাম ইনবক্সের শত শত মেসেজের ভিড়ে গ্রাহকের গুরুত্বপূর্ণ অর্ডার মিস হয়ে যায়।",
      icon: MessageSquareX,
      tag: "অর্ডার ট্র্যাকিং নাই",
    },
    {
      title: "স্টক ঠিকমতো ম্যানেজ হচ্ছে না",
      description: "কোন পণ্য কতটি অবশিষ্ঠ আছে বা স্টক শেষ হয়ে গেল কিনা—তা না জানা থাকলে খাতা বা স্প্রেডশিটে ভুল হয়।",
      icon: PackageX,
      tag: "ইনভেন্টরি এলোমেলো",
    },
    {
      title: "কাস্টমারের তথ্য খুঁজে পাওয়া কঠিন",
      description: "গ্রাহকের ডেলিভারি ঠিকানা, ফোন নম্বর ও পূর্বের অর্ডারের হিস্ট্রি বারবার মেসেজে খুঁজতে সময় নষ্ট হয়।",
      icon: UserX,
      tag: "কাস্টমার হিস্ট্রি নাই",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-24 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            সমস্যা ও সমাধান
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight">
            অনলাইন ব্যবসা চালাতে এতগুলো টুল কেন?
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            পণ্য, অর্ডার, কাস্টমার, পেমেন্ট আর ডেলিভারি—সব আলাদা জায়গায় থাকলে ব্যবসা সামলানো কঠিন হয়ে যায়।
          </p>
        </div>

        {/* Visual Storytelling Comparison */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: 3 Painful Problems */}
          <div className="lg:col-span-7 rounded-3xl border border-rose-200/80 bg-rose-50/20 p-6 sm:p-7 space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-700">
                <AlertCircle className="h-4 w-4" />
                <span>আলাদা আলাদা পেপার ও মেসেঞ্জারের ঝামেলা</span>
              </div>
              <span className="text-[10px] text-rose-600 font-bold bg-rose-100/80 px-2 py-0.5 rounded-full">
                সতর্কতা
              </span>
            </div>

            <div className="space-y-3">
              {PROBLEMS.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-rose-100 shadow-2xs flex items-start gap-3.5 transition-all hover:border-rose-300"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-zinc-900 text-sm">{p.title}</h4>
                        <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
                          {p.tag}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed font-normal">{p.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Bornoland One OS Solution */}
          <div className="lg:col-span-5 rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 p-6 sm:p-7 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span>BORNO LAND সমাধান</span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                  ১০০% সহজ
                </span>
              </div>

              <div className="rounded-2xl bg-white border border-blue-100 p-5 shadow-sm space-y-3.5 text-xs">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                  <Sparkles className="h-4 w-4" />
                  <span>একটি প্ল্যাটফর্মেই সব কাজ</span>
                </div>
                <h4 className="font-bold text-zinc-950 text-base leading-snug">
                  গ্রাহক অর্ডার করবে, পেমেন্ট ও ডেলিভারি হবে স্বয়ংক্রিয়ভাবে।
                </h4>
                <p className="text-zinc-600 leading-relaxed text-xs">
                  আপনার দোকানে অর্ডার আসার সাথে সাথেই বিকাশ বা ক্যাশ অন ডেলিভারি নিশ্চিত হবে, স্টক আপডেট হবে এবং ইনভয়েস সাথে সাথে গ্রাহকের কাছে পৌঁছে যাবে।
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-blue-100/80 flex items-center justify-between text-xs font-semibold text-blue-700">
              <span>প্রতি সপ্তাহে ১০+ ঘণ্টা সময় বাঁচান</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
