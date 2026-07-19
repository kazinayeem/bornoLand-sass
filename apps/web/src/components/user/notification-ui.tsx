import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Bell, Box, CheckCircle2, CreditCard, FileText, HardDrive, Receipt, RefreshCw, ShieldAlert, UserPlus } from "lucide-react";

const styles: Record<string, { icon: LucideIcon; label: string; className: string }> = {
  new_order: { icon: Box, label: "New order", className: "bg-blue-50 text-blue-600" },
  payment_received: { icon: CreditCard, label: "Payment received", className: "bg-emerald-50 text-emerald-600" },
  payment_approved: { icon: CheckCircle2, label: "Payment approved", className: "bg-emerald-50 text-emerald-600" },
  payment_submitted: { icon: CreditCard, label: "Payment submitted", className: "bg-blue-50 text-blue-600" },
  payment_rejected: { icon: AlertTriangle, label: "Payment rejected", className: "bg-red-50 text-red-600" },
  subscription_renewed: { icon: RefreshCw, label: "Subscription renewed", className: "bg-violet-50 text-violet-600" },
  storage_almost_full: { icon: HardDrive, label: "Storage alert", className: "bg-amber-50 text-amber-600" },
  staff_invitation: { icon: UserPlus, label: "Staff invitation", className: "bg-indigo-50 text-indigo-600" },
  invoice_generated: { icon: FileText, label: "Invoice generated", className: "bg-cyan-50 text-cyan-600" },
  security_alert: { icon: ShieldAlert, label: "Security alert", className: "bg-red-50 text-red-600" },
  system_update: { icon: Bell, label: "System update", className: "bg-zinc-100 text-zinc-600" },
  subscription_expiring: { icon: Receipt, label: "Subscription", className: "bg-amber-50 text-amber-600" },
  subscription_expired: { icon: AlertTriangle, label: "Subscription expired", className: "bg-red-50 text-red-600" },
};

export function getNotificationStyle(type: string) {
  return styles[type] ?? { icon: Bell, label: type.replace(/_/g, " "), className: "bg-zinc-100 text-zinc-600" };
}

export function timeAgo(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 45) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}
