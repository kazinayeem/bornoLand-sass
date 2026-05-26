"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { Store, FileText, ArrowRight } from "lucide-react";
import { HelpCircle, Truck, RotateCcw, Ruler, Mail, Shield, Info } from "lucide-react";
import { getStoreDisplayDomain } from "@/utils/domain";

const pageIcons: Record<string, typeof HelpCircle> = {
  faq: HelpCircle,
  "shipping-info": Truck,
  returns: RotateCcw,
  "size-guide": Ruler,
  "contact-us": Mail,
  "privacy-policy": Shield,
  "terms-conditions": FileText,
  "about-us": Info,
};

const pageLabels: Record<string, string> = {
  faq: "FAQ",
  "shipping-info": "Shipping Info",
  returns: "Returns Policy",
  "size-guide": "Size Guide",
  "contact-us": "Contact Us",
  "privacy-policy": "Privacy Policy",
  "terms-conditions": "Terms & Conditions",
  "about-us": "About Us",
};

export default function CmsPage() {
  const { data: storesData, isLoading: storesLoading } = useGetMyStoresQuery();
  const stores = storesData?.data?.stores ?? [];
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const store = stores.find((s) => s._id === selectedStoreId);

  if (!selectedStoreId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">CMS</h2>
          <p className="mt-1 text-sm text-zinc-500">Manage your store content pages and FAQs.</p>
        </div>
        {storesLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-50 p-5" />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-zinc-200 bg-white p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
              <Store className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-zinc-900">No stores yet</h3>
            <p className="mt-2 text-sm text-zinc-500">Create a store to manage CMS content.</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((s, i) => (
              <motion.button
                key={s._id}
                onClick={() => setSelectedStoreId(s._id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 text-left transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-green-500/10 to-transparent" />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 text-lg font-bold text-white shadow-sm">
                  {s.name[0]}
                </div>
                <h3 className="mt-3 font-semibold text-zinc-900">{s.name}</h3>
                <p className="text-xs text-zinc-400">{getStoreDisplayDomain(s.subdomain, s.slug)}</p>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">CMS</h2>
            <span className="rounded-lg bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-600">{store?.name}</span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">Select a page to edit its content.</p>
        </div>
        <button
          onClick={() => setSelectedStoreId("")}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
        >
          <Store className="h-4 w-4" /> Change Store
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(pageLabels).map(([slug, label], i) => {
          const Icon = pageIcons[slug] ?? FileText;
          return (
            <Link key={slug} href={`/dashboard/cms/${slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group cursor-pointer rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-300 transition-colors group-hover:text-blue-500" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-zinc-900">{label}</h3>
                <p className="mt-1 text-xs text-zinc-400">/{slug}</p>
              </motion.div>
            </Link>
          );
        })}
        <Link href="/dashboard/cms/faqs">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group cursor-pointer rounded-2xl border border-zinc-200 border-dashed bg-white p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <HelpCircle className="h-5 w-5 text-purple-600" />
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-300 transition-colors group-hover:text-purple-500" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-zinc-900">FAQ Items</h3>
            <p className="mt-1 text-xs text-zinc-400">Manage Q&A entries</p>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
