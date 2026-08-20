"use client";

import { landingContainer } from "./landing-ui";
import { ShieldCheck, Lock, Key, Database, FileCheck, CheckCircle2 } from "lucide-react";

export function SecuritySection() {
  const SECURITY_ITEMS = [
    {
      title: "Role-Based Access Control",
      desc: "Assign staff granular permissions as Store Managers, Order Processors, or Billing Admins without sharing root credentials.",
      icon: Key,
    },
    {
      title: "Encrypted Sessions & SSL",
      desc: "End-to-end HTTPS/TLS encryption across all public storefronts and administrative API endpoints.",
      icon: Lock,
    },
    {
      title: "Automated Cloud Backups",
      desc: "Point-in-time database snapshotting protects your product catalogs, media assets, and historical order receipts.",
      icon: Database,
    },
    {
      title: "Merchant Audit Logs",
      desc: "Full traceability of all staff actions, price adjustments, settings changes, and order status updates.",
      icon: FileCheck,
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            ENTERPRISE SECURITY & COMPLIANCE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Your business data stays yours.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Designed from the ground up for data isolation, role-based protection, and uninterrupted uptime.
          </p>
        </div>

        {/* 4 Security Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {SECURITY_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-zinc-200/80 bg-zinc-50/40 hover:bg-white hover:shadow-lg hover:border-zinc-300 transition-all space-y-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-2xs text-zinc-900">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900">{item.title}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
