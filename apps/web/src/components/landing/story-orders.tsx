"use client";

import { landingContainer } from "./landing-ui";
import { LiveIndicator } from "./live-indicator";
import { CheckCircle2, Clock, PackageCheck, Truck, RefreshCw, XCircle } from "lucide-react";

export function StoryOrders() {
  const ORDER_STATUSES = [
    { label: "নতুন", icon: Clock, color: "bg-blue-50 text-blue-700 border-blue-200" },
    { label: "কনফার্মড", icon: CheckCircle2, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { label: "প্যাকেজিং", icon: PackageCheck, color: "bg-amber-50 text-amber-700 border-amber-200" },
    { label: "পাঠানো হয়েছে", icon: Truck, color: "bg-purple-50 text-purple-700 border-purple-200" },
    { label: "ডেলিভারি সম্পন্ন", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { label: "বাতিল", icon: XCircle, color: "bg-rose-50 text-rose-700 border-rose-200" },
  ];

  const STREAMING_ORDERS = [
    {
      id: "ORD-1048",
      customer: "মোহাম্মদ রফিকুল ইসলাম",
      items: "Premium Cotton Panjabi (×২)",
      total: "৳৩,৭০০",
      payment: "বিকাশ পেমেন্ট সম্পন্ন",
      time: "এইমাত্র",
      status: "কনফার্মড",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "ORD-1047",
      customer: "তানভীর আহমেদ",
      items: "Wireless Earbuds Pro",
      total: "৳২,৪৫০",
      payment: "ক্যাশ অন ডেলিভারি",
      time: "৩ মিনিট আগে",
      status: "প্যাকেজিং",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      id: "ORD-1046",
      customer: "ফারহানা ইয়াসমিন",
      items: "Classic Silk Saree",
      total: "৳৪,৮৫০",
      payment: "নগদ পেমেন্ট সম্পন্ন",
      time: "৭ মিনিট আগে",
      status: "পাঠানো হয়েছে",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
  ];

  return (
    <section id="orders" className="py-20 sm:py-24 bg-white border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <div className="flex justify-center mb-1">
            <LiveIndicator label="লাইভ" sublabel="রিয়েল-টাইম অর্ডার স্ট্রিম" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            অর্ডার আসবে, আপনি শুধু ম্যানেজ করবেন।
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            নতুন অর্ডার থেকে শুরু করে ডেলিভারি সম্পন্ন হওয়া পর্যন্ত প্রতিটি ধাপ এক নজরে ট্র্যাক করুন।
          </p>
        </div>

        {/* Status Pipeline Chips */}
        <div className="max-w-4xl mx-auto mb-8 flex flex-wrap items-center justify-center gap-2">
          {ORDER_STATUSES.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${st.color}`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{st.label}</span>
              </div>
            );
          })}
        </div>

        {/* Live Orders Container */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-zinc-200/90 bg-zinc-50/40 p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200/60 pb-3 text-xs">
            <span className="font-bold text-zinc-900 flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 text-blue-600 animate-spin" />
              লাইভ অর্ডার ম্যানেজমেন্ট ড্যাশবোর্ড
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">গত ১ ঘণ্টায় ১২টি নতুন অর্ডার</span>
          </div>

          <div className="space-y-3">
            {STREAMING_ORDERS.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-white border border-zinc-200/70 shadow-2xs flex items-center justify-between gap-4 text-xs hover:border-blue-300 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-900">{order.id}</span>
                    <span className="text-zinc-300">·</span>
                    <span className="font-semibold text-zinc-800">{order.customer}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">{order.items}</p>
                </div>

                <div className="text-right space-y-1">
                  <p className="font-extrabold text-zinc-950 text-sm">{order.total}</p>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${order.badgeColor}`}>
                      {order.payment}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">{order.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
