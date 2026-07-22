import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Box,
  CheckCircle2,
  CreditCard,
  Gift,
  Heart,
  MessageSquareQuote,
  Percent,
  ShieldAlert,
  Truck,
} from "lucide-react";

const TYPE_STYLES: Record<string, { icon: LucideIcon; label: string; className: string }> = {
  order: { icon: Box, label: "Order", className: "bg-blue-50 text-blue-600" },
  payment: { icon: CreditCard, label: "Payment", className: "bg-emerald-50 text-emerald-600" },
  shipping: { icon: Truck, label: "Shipping", className: "bg-cyan-50 text-cyan-600" },
  security: { icon: ShieldAlert, label: "Security", className: "bg-red-50 text-red-600" },
  promotion: { icon: Gift, label: "Promotion", className: "bg-violet-50 text-violet-600" },
  system: { icon: Bell, label: "System", className: "bg-zinc-100 text-zinc-700" },
  wishlist: { icon: Heart, label: "Wishlist", className: "bg-pink-50 text-pink-600" },
  review: { icon: MessageSquareQuote, label: "Review", className: "bg-amber-50 text-amber-700" },
  coupon: { icon: Percent, label: "Coupon", className: "bg-lime-50 text-lime-700" },
};

export function getCustomerNotificationStyle(type: string, _icon?: string) {
  return TYPE_STYLES[type] ?? { icon: Bell, label: type, className: "bg-zinc-100 text-zinc-700" };
}

export function formatNotificationTimeAgo(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 45) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 172800) return "Yesterday";
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}
