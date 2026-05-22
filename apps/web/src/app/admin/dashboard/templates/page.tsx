"use client";

import { motion } from "framer-motion";
import { LayoutTemplate, Plus, Eye, Edit, Copy } from "lucide-react";

const templates = [
  { id: 1, name: "SaaS Hero", category: "Landing Page", used: 342, rating: 4.8, status: "published", image: "SH" },
  { id: 2, name: "Startup Launch", category: "Landing Page", used: 218, rating: 4.6, status: "published", image: "SL" },
  { id: 3, name: "E-Commerce Pro", category: "Sales Page", used: 156, rating: 4.7, status: "published", image: "EP" },
  { id: 4, name: "Portfolio Dark", category: "Portfolio", used: 89, rating: 4.5, status: "published", image: "PD" },
  { id: 5, name: "Webinar Signup", category: "Lead Gen", used: 134, rating: 4.4, status: "draft", image: "WS" },
  { id: 6, name: "Product Hunt", category: "Launch", used: 67, rating: 4.9, status: "published", image: "PH" }
];

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Templates</h2>
          <p className="mt-1 text-sm text-zinc-500">Manage landing page templates available to tenants.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          <Plus className="h-4 w-4" /> New Template
        </button>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((tmpl, i) => (
          <motion.div key={tmpl.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="group rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="flex aspect-[16/9] items-center justify-center rounded-t-2xl bg-gradient-to-br from-blue-600 to-indigo-700">
              <span className="text-4xl font-bold text-white/80">{tmpl.image}</span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-900">{tmpl.name}</h3>
                  <p className="text-xs text-zinc-500">{tmpl.category}</p>
                </div>
                <span className={["rounded-full px-2.5 py-0.5 text-xs font-medium", tmpl.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"].join(" ")}>
                  {tmpl.status}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3">
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span>⭐ {tmpl.rating}</span>
                  <span>Used {tmpl.used}x</span>
                </div>
                <div className="flex gap-1">
                  <button className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-blue-50 hover:text-blue-600"><Eye className="h-4 w-4" /></button>
                  <button className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"><Edit className="h-4 w-4" /></button>
                  <button className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"><Copy className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
