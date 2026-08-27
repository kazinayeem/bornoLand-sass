"use client";

import { landingContainer } from "./landing-ui";
import { Package, CheckCircle2, AlertTriangle } from "lucide-react";

export function StoryProducts() {
  const PRODUCTS = [
    {
      name: "Premium Cotton Panjabi",
      sku: "PNJ-COT-01",
      category: "ফ্যাশন ও লাইফস্টাইল",
      stock: "৪৫ টি স্টক",
      price: "৳১,৮৫০",
      status: "সক্রিয়",
      isLowStock: false,
    },
    {
      name: "Classic T-Shirt",
      sku: "TSH-CLS-02",
      category: "ক্যাজুয়াল ওয়্যার",
      stock: "৮২ টি স্টক",
      price: "৳৭৫০",
      status: "সক্রিয়",
      isLowStock: false,
    },
    {
      name: "Leather Wallet",
      sku: "WLT-LTH-03",
      category: "এক্সেসরিজ",
      stock: "১৮ টি স্টক",
      price: "৳১,২০০",
      status: "কম স্টক",
      isLowStock: true,
    },
    {
      name: "Wireless Earbuds Pro",
      sku: "EBD-WRL-04",
      category: "ইলেক্ট্রনিক্স",
      stock: "৩৪ টি স্টক",
      price: "৳২,৪৫০",
      status: "সক্রিয়",
      isLowStock: false,
    },
  ];

  return (
    <section id="products" className="py-20 sm:py-24 bg-zinc-50/50 border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            পণ্য ক্যাটালগ
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            পণ্য যোগ করুন, বিক্রি শুরু করুন।
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            পণ্যের ছবি, দাম, স্টক ও বিস্তারিত তথ্য এক জায়গা থেকেই সহজে ম্যানেজ করুন।
          </p>
        </div>

        {/* Large Product Management Interface */}
        <div className="max-w-5xl mx-auto rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4 text-xs">
            <div className="flex items-center gap-2 font-bold text-zinc-900">
              <Package className="h-4 w-4 text-blue-600" />
              <span>পণ্য ক্যাটালগ ড্যাশবোর্ড</span>
            </div>
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px] font-bold">
              লাইভ সিঙ্ক চালু
            </span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60 text-[10px] font-bold uppercase text-zinc-400">
                  <th className="py-3 px-4">পণ্যের নাম</th>
                  <th className="py-3 px-4">SKU কোড</th>
                  <th className="py-3 px-4">ক্যাটাগরি</th>
                  <th className="py-3 px-4">ইনভেন্টরি স্টক</th>
                  <th className="py-3 px-4">বিক্রয় মূল্য</th>
                  <th className="py-3 px-4 text-right">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {PRODUCTS.map((p, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-zinc-900">{p.name}</td>
                    <td className="py-3.5 px-4 font-mono text-zinc-500 text-[11px]">{p.sku}</td>
                    <td className="py-3.5 px-4 text-zinc-600">{p.category}</td>
                    <td className={`py-3.5 px-4 font-semibold ${p.isLowStock ? "text-amber-600" : "text-emerald-600"}`}>
                      {p.stock}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-zinc-950">{p.price}</td>
                    <td className="py-3.5 px-4 text-right">
                      {p.isLowStock ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          <AlertTriangle className="h-3 w-3 text-amber-600" /> {p.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {p.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
