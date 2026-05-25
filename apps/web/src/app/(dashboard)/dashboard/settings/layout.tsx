"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, CreditCard, Truck } from "lucide-react";

const tabs = [
  { href: "/dashboard/settings", label: "General", icon: Settings },
  { href: "/dashboard/settings/payment", label: "Payment Methods", icon: CreditCard },
  { href: "/dashboard/settings/delivery", label: "Delivery Zones", icon: Truck },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="border-b border-zinc-200">
        <div className="flex gap-4 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                  active
                    ? "border-zinc-900 text-zinc-900"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
