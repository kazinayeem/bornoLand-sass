"use client";

import { landingContainer } from "./landing-ui";
import { Globe, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export function CustomDomain() {
  return (
    <section className="py-20 sm:py-28 bg-zinc-50/50 border-b border-zinc-200/80">
      <div className={landingContainer}>
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Header */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              BRANDED DOMAIN ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
              Your brand. Your domain.
            </h2>
            <p className="max-w-2xl mx-auto text-base text-zinc-600 leading-relaxed font-normal">
              Connect your own custom apex domain or subdomain in 3 simple steps. Automatic SSL certificates and edge DNS routing included on all plans.
            </p>
          </div>

          {/* Transformation Visual */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 sm:p-10 shadow-xl space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 text-center space-y-1 w-full sm:w-64">
                <span className="text-[10px] uppercase font-bold text-zinc-400">DEFAULT SUBDOMAIN</span>
                <p className="font-mono text-sm font-bold text-zinc-700">techgear.bornoland.store</p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white shrink-0">
                <ArrowRight className="h-5 w-5" />
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 text-center space-y-1 w-full sm:w-64">
                <span className="text-[10px] uppercase font-bold text-emerald-600">VERIFIED CUSTOM DOMAIN</span>
                <p className="font-mono text-sm font-bold text-emerald-950">www.techgear.com</p>
              </div>
            </div>

            {/* 3 Step Setup Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-xs pt-4 border-t border-zinc-100">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400">STEP 01</span>
                <p className="font-bold text-zinc-900">Add Your Domain</p>
                <p className="text-zinc-500">Enter your purchased domain name in store settings.</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400">STEP 02</span>
                <p className="font-bold text-zinc-900">Configure DNS Records</p>
                <p className="text-zinc-500">Add our CNAME and A records in your registrar dashboard.</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400">STEP 03</span>
                <p className="font-bold text-zinc-900">Go Live with SSL</p>
                <p className="text-zinc-500">Automatic Let&apos;s Encrypt SSL provisioned in seconds.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
