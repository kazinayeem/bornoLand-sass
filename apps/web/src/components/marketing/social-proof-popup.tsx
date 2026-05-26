"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const names = ["Sarah J.", "Mike R.", "Emily L.", "Alex K.", "Jessica M.", "David W.", "Emma T.", "James P."];
const products = ["Wireless Headphones", "Running Shoes", "Yoga Mat", "Coffee Maker", "Smart Watch", "Phone Case"];
const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego"];

export function SocialProofPopup({ enabled = true, interval = 8000 }: { enabled?: boolean; interval?: number }) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState({ name: "", product: "", city: "", time: "" });

  useEffect(() => {
    if (!enabled) return;
    const show = () => {
      setCurrent({
        name: names[Math.floor(Math.random() * names.length)],
        product: products[Math.floor(Math.random() * products.length)],
        city: cities[Math.floor(Math.random() * cities.length)],
        time: `${Math.floor(Math.random() * 15) + 1}m ago`,
      });
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    };
    show();
    const id = setInterval(show, interval);
    return () => clearInterval(id);
  }, [enabled, interval]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ opacity: 0, x: -100, y: 20 }} animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100 }} transition={{ type: "spring", damping: 20 }}
          className="fixed bottom-20 left-4 z-50 max-w-xs rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <ShoppingBag className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-900">
                {current.name} bought <span className="font-semibold">{current.product}</span>
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-400">{current.city} · {current.time}</p>
            </div>
            <button onClick={() => setVisible(false)} className="shrink-0 rounded p-0.5 text-zinc-300 hover:text-zinc-500">
              <X className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
