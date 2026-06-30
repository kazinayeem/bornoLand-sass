"use client";

import Link from "next/link";
import {
  Globe,
  LayoutTemplate,
  Package,
  ShoppingCart,
  Settings,
  Sparkles,
  Wallet,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const platformModules = [
  {
    href: "/admin/dashboard/plans",
    title: "Plans & Plan Builder",
    description: "All subscription configuration — pricing, storage, limits, features, trial.",
    icon: Sparkles,
    color: "from-blue-500 to-indigo-600",
  },
  {
    href: "/admin/dashboard/payments",
    title: "Payments",
    description: "Revenue, subscription payments, and platform payment methods.",
    icon: Wallet,
    color: "from-emerald-500 to-teal-600",
  },
  {
    href: "/admin/dashboard/settings",
    title: "Platform settings",
    description: "Global trial, currency, storage, email, security, and maintenance.",
    icon: Settings,
    color: "from-zinc-600 to-zinc-800",
  },
];

const catalogModules = [
  { href: "/admin/dashboard/templates", title: "Themes", description: "Storefront templates.", icon: LayoutTemplate },
  { href: "/admin/dashboard/products", title: "Products", description: "Cross-store catalog.", icon: Package },
  { href: "/admin/dashboard/orders", title: "Orders", description: "Platform orders.", icon: ShoppingCart },
];

export default function PlatformPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Platform"
        description="Global operations hub. Plan-specific settings live in Plan Builder."
        badge={
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <Globe className="h-3 w-3" />
            Live
          </span>
        }
      />

      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm text-blue-900">
        Feature catalog, storage quotas, and trial limits per plan are configured in{" "}
        <Link href="/admin/dashboard/plans" className="font-semibold underline">
          Plans → Plan Builder
        </Link>
        . This page is for platform-wide tools only.
      </div>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">Core</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {platformModules.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${mod.color} text-white`}>
                <mod.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-zinc-900 group-hover:text-blue-700">{mod.title}</h3>
              <p className="mt-1 text-sm text-zinc-500">{mod.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">Catalog</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {catalogModules.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                <mod.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-zinc-900">{mod.title}</h3>
                <p className="text-xs text-zinc-500">{mod.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
