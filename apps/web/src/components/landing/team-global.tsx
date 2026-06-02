"use client";

import { motion } from "framer-motion";
import { Globe2, Store, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { SectionHeading } from "./section-heading";

const gridCells = Array.from({ length: 64 }, (_, i) => i);

const team = [
  { name: "Mohammad Ali", role: "Founder & CEO", avatar: "MA", color: "bg-blue-600" },
  { name: "Sarah Rahman", role: "CTO", avatar: "SR", color: "bg-violet-600" },
  { name: "Kabir Hossain", role: "Lead Designer", avatar: "KH", color: "bg-emerald-600" },
  { name: "Nadia Islam", role: "Head of Product", avatar: "NI", color: "bg-amber-600" },
];

const globalStats = [
  { icon: Store, value: "500+", label: "Stores" },
  { icon: Package, value: "10K+", label: "Products" },
  { icon: ShoppingCart, value: "50K+", label: "Orders" },
  { icon: Globe2, value: "12+", label: "Countries" },
  { icon: TrendingUp, value: "৳2M+", label: "Revenue" },
];

export function TeamGlobal() {
  return (
    <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Team */}
        <SectionHeading
          eyebrow="Our Team"
          title="Built By Experienced Founders"
          description="Meet the team behind BornoLand — passionate about empowering entrepreneurs."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 mb-16 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {team.map((member) => (
            <div key={member.name} className="rounded-2xl border border-zinc-200/60 bg-white p-4 text-center shadow-sm transition-all hover:shadow-md">
              <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${member.color} text-lg font-bold text-white shadow-sm`}>
                {member.avatar}
              </div>
              <h4 className="text-sm font-bold text-zinc-900">{member.name}</h4>
              <p className="text-xs text-zinc-500">{member.role}</p>
            </div>
          ))}
        </motion.div>

        {/* Global Reach */}
        <SectionHeading
          eyebrow="Global Reach"
          title="Powering Businesses Worldwide"
          description="BornoLand is trusted by store owners across multiple countries."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          {/* World Map Visual */}
          <div className="relative mb-8 overflow-hidden rounded-[2rem] border border-zinc-200/60 bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-center">
              <div className="grid grid-cols-8 gap-1.5 w-full max-w-2xl">
                {gridCells.map((cell, i) => {
                  const row = Math.floor(i / 8);
                  const col = i % 8;
                  const isLand =
                    (row >= 2 && row <= 5 && col >= 1 && col <= 3) || // Americas
                    (row >= 1 && row <= 3 && col >= 3 && col <= 5) || // Europe
                    (row >= 3 && row <= 5 && col >= 4 && col <= 6) || // Asia
                    (row >= 4 && row <= 5 && col >= 2 && col <= 3); // Africa
                  const opacity = 0.6 + (cell % 31) / 100;
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-sm transition-all ${
                        isLand
                          ? "bg-gradient-to-br from-blue-400 to-indigo-500"
                          : "bg-blue-100/30"
                      }`}
                      style={{ opacity: isLand ? opacity : undefined }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {globalStats.map((s) => (
              <div key={s.label} className="rounded-xl border border-zinc-200/60 bg-white p-3.5 text-center shadow-sm">
                <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                  <s.icon className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <p className="font-[family-name:var(--font-space-grotesk)] text-base font-bold text-zinc-900">{s.value}</p>
                <p className="text-[11px] text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
