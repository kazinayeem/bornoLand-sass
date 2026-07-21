"use client";

import { motion } from "framer-motion";
import { Smartphone, ShoppingBag, BarChart3, MessageSquare, Package, Bell } from "lucide-react";
import { SectionHeading } from "./section-heading";

const features = [
  { icon: ShoppingBag, title: "Manage Orders" },
  { icon: Package, title: "Manage Products" },
  { icon: BarChart3, title: "View Analytics" },
  { icon: MessageSquare, title: "Customer Messages" },
  { icon: Bell, title: "Inventory Updates" },
];

export function MobileApp() {
  return (
    <section className="relative bg-apple-canvas-parchment px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeading
              align="left"
              eyebrow="Mobile App"
              title="Manage Your Store On The Go"
              description="iOS and Android apps with full store management capabilities."
            />

            <div className="mt-6 space-y-3">
              {features.map((f) => (
                <div key={f.title} className="flex items-center gap-3 rounded-xl border border-apple-divider-soft bg-apple-canvas p-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-apple-canvas-parchment">
                    <f.icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-apple-ink-muted-80">{f.title}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white">
                <Smartphone className="h-4 w-4" /> Google Play
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-apple-hairline bg-apple-canvas px-4 py-2.5 text-xs font-semibold text-apple-ink-muted-80">
                <Smartphone className="h-4 w-4" /> App Store
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="mx-auto max-w-[280px]">
              <div className="overflow-hidden rounded-[2.5rem] border-[3px] border-apple-hairline bg-apple-canvas">
                <div className="bg-apple-primary p-4 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold opacity-80">9:41</span>
                    <Bell className="h-4 w-4 opacity-80" />
                  </div>
                  <p className="text-lg font-bold">৳48,200</p>
                  <p className="text-xs text-white/70">Total Revenue This Month</p>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { label: "New Orders", value: "12", color: "bg-blue-500" },
                    { label: "Low Stock", value: "4", color: "bg-amber-500" },
                    { label: "Messages", value: "8", color: "bg-violet-500" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-xl bg-apple-canvas-parchment px-3.5 py-3">
                      <span className="text-xs font-medium text-apple-ink-muted-80">{item.label}</span>
                      <span className={`${item.color} px-2 py-0.5 rounded-full text-[10px] font-bold text-white`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
