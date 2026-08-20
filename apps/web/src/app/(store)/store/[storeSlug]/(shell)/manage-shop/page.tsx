"use client";

import Link from "next/link";
import { useStorePage, StorePageCard } from "@/components/store-dashboard/store-page";
import {
  Store,
  Globe,
  FileText,
  Truck,
  CreditCard,
  Search,
  MessageSquare,
  Share2,
  ShieldAlert,
  Sliders,
  Bell,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function ManageShopPage() {
  const { store, storeId, isLoading } = useStorePage();

  if (isLoading || !store) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }

  const slug = store.slug;

  const items = [
    {
      title: "Shop Settings",
      description: "General shop configurations customize your shop's core settings for a seamless experience.",
      href: `/store/${slug}/settings`,
      icon: Store,
    },
    {
      title: "Shop Domain",
      description: "Manage your shop's core configurations, including domain setup and general settings.",
      href: `/store/${slug}/settings`,
      icon: Globe,
    },
    {
      title: "Shop Policy",
      description: "Define and customize policies for your shop, including returns, refunds, and customer service guidelines.",
      href: `/store/${slug}/cms`,
      icon: FileText,
    },
    {
      title: "Delivery Support",
      description: "Manage your shop's delivery settings to ensure smooth and efficient order fulfillment.",
      href: `/store/${slug}/settings`,
      icon: Truck,
    },
    {
      title: "Payment Gateway",
      description: "Integrate and manage payment options to provide customers with secure and flexible transaction methods.",
      href: `/store/${slug}/settings`,
      icon: CreditCard,
    },
    {
      title: "SEO & Marketing Integrations",
      description: "Enhance your shop's visibility by Google Tag Manager, Facebook Pixel, TikTok Pixel, and SEO tools.",
      href: `/store/${slug}/marketing`,
      icon: Search,
      badge: "NEW",
    },
    {
      title: "SMS Support",
      description: "Enable SMS notifications and support to keep your customers informed with real-time updates.",
      href: `/store/${slug}/settings`,
      icon: Bell,
    },
    {
      title: "Chat Support",
      description: "Provide instant communication and assistance to customers with chat support system.",
      href: `/store/${slug}/customer-messages`,
      icon: MessageSquare,
    },
    {
      title: "Social Links",
      description: "Connect your shop with social media platforms to enhance visibility and engagement.",
      href: `/store/${slug}/settings`,
      icon: Share2,
    },
    {
      title: "Blocklist",
      description: "Block abusive visitors by IP address, IP range, device, phone, or email to stop fraud.",
      href: `/store/${slug}/settings`,
      icon: ShieldAlert,
      badge: "NEW",
    },
    {
      title: "Order Limits",
      description: "Limit repeat and duplicate orders, choose how they are handled and review protected attempts.",
      href: `/store/${slug}/settings`,
      icon: Sliders,
      badge: "NEW",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-apple-ink">Manage Shop</h1>
        <p className="text-sm text-apple-ink-muted-48">Set up and customize your shop to ensure a smooth and efficient experience.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group relative flex flex-col justify-between rounded-2xl border border-apple-hairline bg-white p-5 shadow-sm transition-all hover:border-violet-300 hover:shadow-md active:scale-[0.99]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                  <item.icon className="h-5 w-5" />
                </div>
                {item.badge && (
                  <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-apple-ink group-hover:text-violet-600">{item.title}</h3>
              <p className="text-xs text-apple-ink-muted-48 leading-relaxed">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
