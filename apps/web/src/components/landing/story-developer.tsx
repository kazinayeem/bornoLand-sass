"use client";

import { landingContainer } from "./landing-ui";
import { Code2, Webhook } from "lucide-react";

export function StoryDeveloper() {
  return (
    <section id="developer" className="py-20 sm:py-24 bg-zinc-950 text-white border-b border-zinc-800 scroll-mt-20">
      <div className={landingContainer}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Copy */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-800">
                উন্নত ফিচার ও ইন্টিগ্রেশন
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                আরও বেশি নিয়ন্ত্রণ চান?
              </h2>
              <p className="text-base text-zinc-400 leading-relaxed font-normal">
                আপনার ব্যবসা বড় হলে আরও উন্নত কাস্টমাইজেশন ও ইন্টিগ্রেশনের সুবিধা নিন।
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <Code2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-white text-sm">REST API অ্যাক্সেস</p>
                  <p className="text-zinc-400">পণ্য, স্টক, অর্ডার ও ইনভয়েস প্রোগ্রাম্যাটিকভাবে কানেক্ট করার সুবিধা।</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <Webhook className="h-5 w-5 text-blue-400 shrink-0" />
                <div>
                  <p className="font-bold text-white text-sm">রিয়েল-টাইম ওয়েবহুক (Webhooks)</p>
                  <p className="text-zinc-400">নতুন অর্ডার বা পেমেন্ট নিশ্চিত হলেই সাথে সাথে ইভেন্ট নোটিফিকেশন।</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Code Mockup */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 shadow-2xl overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 bg-zinc-950 text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-zinc-400">POST /api/v1/orders</span>
                </div>
                <span className="text-emerald-400 font-bold text-[10px]">201 CREATED</span>
              </div>

              <div className="p-5 text-zinc-300 space-y-2 overflow-x-auto text-[11px] leading-relaxed">
                <p className="text-zinc-500">// প্রোগ্রামাটিক অর্ডার প্রসেসিং API</p>
                <p><span className="text-purple-400">curl</span> -X POST https://api.bornoland.com/orders \</p>
                <p className="pl-4">-H <span className="text-emerald-300">&quot;Authorization: Bearer sec_tok_live&quot;</span> \</p>
                <p className="pl-4">-H <span className="text-emerald-300">&quot;Content-Type: application/json&quot;</span> \</p>
                <p className="pl-4">-d <span className="text-amber-300">&apos;&#123;</span></p>
                <p className="pl-8"><span className="text-blue-300">&quot;storeId&quot;</span>: <span className="text-emerald-300">&quot;mybrand_shop_01&quot;</span>,</p>
                <p className="pl-8"><span className="text-blue-300">&quot;items&quot;</span>: [&#123; <span className="text-blue-300">&quot;sku&quot;</span>: <span className="text-emerald-300">&quot;PNJ-COT-01&quot;</span>, <span className="text-blue-300">&quot;qty&quot;</span>: 2 &#125;],</p>
                <p className="pl-8"><span className="text-blue-300">&quot;paymentMethod&quot;</span>: <span className="text-emerald-300">&quot;bkash&quot;</span></p>
                <p className="pl-4"><span className="text-amber-300">&#125;&apos;</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
