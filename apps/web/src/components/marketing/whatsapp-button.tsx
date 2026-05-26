"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

type WhatsAppButtonProps = {
  phone?: string;
  message?: string;
  position?: "left" | "right";
  enabled?: boolean;
};

export function WhatsAppButton({
  phone = "1234567890",
  message = "Hi! I have a question about your products.",
  position = "right",
  enabled = true,
}: WhatsAppButtonProps) {
  if (!enabled) return null;

  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const posClass = position === "right" ? "right-4" : "left-4";

  return (
    <motion.a href={href} target="_blank" rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`fixed bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:bg-emerald-600 ${posClass}`}>
      <MessageCircle className="h-6 w-6" />
    </motion.a>
  );
}
