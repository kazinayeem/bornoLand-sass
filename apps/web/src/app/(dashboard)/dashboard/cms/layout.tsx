"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, Truck, RotateCcw, Ruler, Mail, Shield, FileText, Info, MessageSquare } from "lucide-react";

const tabs = [
  { href: "/dashboard/cms/faq", label: "FAQ", icon: HelpCircle },
  { href: "/dashboard/cms/shipping-info", label: "Shipping", icon: Truck },
  { href: "/dashboard/cms/returns", label: "Returns", icon: RotateCcw },
  { href: "/dashboard/cms/size-guide", label: "Size Guide", icon: Ruler },
  { href: "/dashboard/cms/contact-us", label: "Contact", icon: Mail },
  { href: "/dashboard/cms/privacy-policy", label: "Privacy", icon: Shield },
  { href: "/dashboard/cms/terms-conditions", label: "Terms", icon: FileText },
  { href: "/dashboard/cms/about-us", label: "About", icon: Info },
  { href: "/dashboard/cms/faqs", label: "FAQ Items", icon: MessageSquare },
];

export default function CmsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="border-b border-zinc-200">
        <div className="flex gap-4 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
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
