"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Gift, Percent } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type PromoPopupProps = {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  couponCode?: string;
  showOnExit?: boolean;
  showOnScroll?: number;
  delay?: number;
  frequency?: "once" | "session" | "always";
};

export function PromoPopup({
  title = "Get 10% Off!",
  subtitle = "Subscribe to our newsletter and get 10% off your first order",
  buttonText = "Claim Offer",
  imageUrl = "",
  backgroundColor = "#ffffff",
  textColor = "#18181b",
  couponCode = "WELCOME10",
  showOnExit = false,
  showOnScroll,
  delay = 5,
  frequency = "once",
}: PromoPopupProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
    if (frequency === "once") localStorage.setItem("popup_dismissed", "true");
    if (frequency === "session") sessionStorage.setItem("popup_dismissed", "true");
  }, [frequency]);

  const getStorageKey = () => {
    if (frequency === "once") return localStorage.getItem("popup_dismissed");
    if (frequency === "session") return sessionStorage.getItem("popup_dismissed");
    return null;
  };

  useEffect(() => {
    if (getStorageKey()) return;
    const timer = setTimeout(() => { if (!dismissed) setVisible(true); }, delay * 1000);
    return () => clearTimeout(timer);
  }, [delay, dismissed]);

  useEffect(() => {
    if (!showOnExit || getStorageKey()) return;
    const handler = (e: MouseEvent) => {
      if (e.clientY <= 0 && !dismissed) setVisible(true);
    };
    document.addEventListener("mouseleave", handler);
    return () => document.removeEventListener("mouseleave", handler);
  }, [showOnExit, dismissed]);

  useEffect(() => {
    if (!showOnScroll || getStorageKey()) return;
    const handler = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent >= showOnScroll && !dismissed) setVisible(true);
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, [showOnScroll, dismissed]);

  const handleCopyCoupon = () => {
    if (couponCode) {
      navigator.clipboard.writeText(couponCode);
      dismiss();
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}>
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl" style={{ backgroundColor }}>
            <button onClick={dismiss} className="absolute right-4 top-4 z-10 rounded-full bg-black/10 p-1.5 backdrop-blur-sm hover:bg-black/20">
              <X className="h-4 w-4" style={{ color: textColor }} />
            </button>

            {imageUrl && (
              <div className="aspect-[16/9] w-full overflow-hidden">
                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
            )}

            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-white">
                <Gift className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: textColor }}>{title}</h2>
              <p className="mt-2 text-sm opacity-60" style={{ color: textColor }}>{subtitle}</p>

              {couponCode && (
                <button onClick={handleCopyCoupon}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-zinc-100 px-6 py-3 text-lg font-bold tracking-wider transition hover:bg-zinc-200"
                  style={{ color: textColor }}>
                  <Percent className="h-4 w-4" /> {couponCode}
                </button>
              )}

              <button onClick={handleCopyCoupon}
                className="mt-4 w-full rounded-2xl bg-zinc-900 py-3 text-sm font-semibold text-white transition hover:opacity-90">
                {buttonText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
