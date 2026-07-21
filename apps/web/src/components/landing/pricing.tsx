"use client";

import Link from "next/link";
import { Check, CircleX, Loader2, Sparkles } from "lucide-react";
import { useGetPublicPlansQuery } from "@/redux/api/public-plan-api";
import type { Plan } from "@/redux/api/store-api";
import { SectionHeading } from "./section-heading";
import { cn } from "@/lib/utils";

const labels: Record<string, string> = {
  productVariants: "Product variants", inventory: "Inventory", advancedInventory: "Advanced inventory", digitalProducts: "Digital products", subscriptions: "Subscriptions", bookings: "Bookings", giftCards: "Gift cards", coupons: "Coupons", reviews: "Reviews", blog: "Blog", cms: "CMS", pageBuilder: "Visual builder", dragDropBuilder: "Drag & drop builder", themeEditor: "Theme editor", advancedAnalytics: "Advanced analytics", seo: "SEO tools", aiContent: "AI content", customDomain: "Custom domain", subdomain: "Store subdomain", whiteLabel: "White label", apiAccess: "API access", webhooks: "Webhooks", staffManagement: "Staff management", marketplace: "Marketplace", pos: "POS", wholesale: "Wholesale", dropshipping: "Dropshipping", shipping: "Shipping", localPickup: "Local pickup", abandonedCart: "Abandoned cart", emailMarketing: "Email marketing", smsMarketing: "SMS marketing", pushNotification: "Push notifications", liveChat: "Live chat", fileManager: "File manager", mediaLibrary: "Media library", bulkImport: "Bulk import", bulkExport: "Bulk export", csvImport: "CSV import", csvExport: "CSV export", multiCurrency: "Multi-currency", multiLanguage: "Multi-language", taxEngine: "Tax engine", invoiceGenerator: "Invoices", customCheckout: "Custom checkout", loyaltyPoints: "Loyalty points", referralSystem: "Referral system", backupRestore: "Backup & restore", auditLogs: "Audit logs", reports: "Reports",
};

const limitLabels: Record<string, { label: string; suffix?: string }> = {
  products: { label: "Products" }, storage: { label: "Storage", suffix: " MB" }, staff: { label: "Staff seats" }, pages: { label: "Pages" }, mediaUploads: { label: "Media uploads" }, orders: { label: "Orders" }, customers: { label: "Customers" }, builderPages: { label: "Builder pages" }, customDomains: { label: "Custom domains" }, apiKeys: { label: "API keys" }, analyticsReports: { label: "Analytics reports" }, activeThemes: { label: "Themes" }, blogs: { label: "Blog posts" }, integrations: { label: "Integrations" }, webhooks: { label: "Webhooks" }, warehouses: { label: "Warehouses" }, coupons: { label: "Coupons" }, shippingZones: { label: "Shipping zones" }, productVariants: { label: "Product variants" }, productImages: { label: "Images / product" }, categories: { label: "Categories" }, collections: { label: "Collections" }, brands: { label: "Brands" }, reports: { label: "Reports" },
};

function formatPrice(plan: Plan, yearly = false) {
  const amount = yearly ? (plan.pricing?.yearly ?? plan.priceYearly ?? 0) : (plan.pricing?.monthly ?? plan.priceBDT);
  if (plan.isCustomPrice) return "Custom";
  if (!amount) return "Free";
  return new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(amount);
}

function enabled(plan: Plan) {
  const toggles = Object.entries(plan.featureToggles ?? {}).filter(([, value]) => value).map(([key]) => labels[key] ?? key);
  return [...new Set([...(plan.features ?? []).filter(Boolean), ...toggles])];
}

function limits(plan: Plan) {
  return Object.entries(plan.limits ?? {}).filter(([key, value]) => limitLabels[key] && typeof value === "number" && value > 0).map(([key, value]) => `${value}${limitLabels[key].suffix ?? ""} ${limitLabels[key].label}`);
}

function cta(plan: Plan) {
  if (plan.isCustomPrice) return { label: "Contact Sales", href: "/contact" };
  if (plan.trialDays > 0) return { label: "Start Free Trial", href: "/register" };
  return { label: "Get Started", href: "/register" };
}

function PlanCard({ plan }: { plan: Plan }) {
  const planFeatures = enabled(plan);
  const planLimits = limits(plan);
  const action = cta(plan);
  return <article className={cn("relative flex h-full flex-col rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl", plan.isRecommended ? "border-blue-300 ring-2 ring-blue-500/15" : "border-zinc-200") }>
    <div className="absolute -top-3 left-5 flex gap-2">{plan.isRecommended && <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold text-white shadow">Recommended</span>}{plan.isPopular && <span className="rounded-full bg-violet-600 px-3 py-1 text-[10px] font-bold text-white shadow">Most popular</span>}</div>
    <h3 className="text-lg font-bold text-apple-ink">{plan.name}</h3><p className="mt-2 min-h-10 text-sm leading-5 text-apple-ink-muted-48">{plan.description || "A flexible plan for building and growing your store."}</p>
    <div className="mt-6 flex items-baseline gap-1"><span className="text-3xl font-bold tracking-tight text-apple-ink">{formatPrice(plan)}</span>{!plan.isCustomPrice && formatPrice(plan) !== "Free" && <span className="text-xs text-apple-ink-muted-48">/ month</span>}</div>
    {(plan.pricing?.yearly || plan.priceYearly) ? <p className="mt-1 text-xs text-apple-ink-muted-48">Yearly: {formatPrice(plan, true)}</p> : null}
    {plan.trialDays > 0 && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">{plan.trialDays}-day free trial</p>}
    <Link href={action.href} className={cn("mt-6 rounded-xl px-4 py-3 text-center text-sm font-semibold transition", plan.isRecommended ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-zinc-200 text-zinc-800 hover:bg-apple-canvas-parchment")}>{action.label}</Link>
    <div className="mt-6 border-t border-zinc-100 pt-5"><p className="text-[11px] font-bold uppercase tracking-wider text-apple-ink-muted-48">Included features</p><ul className="mt-3 space-y-2">{planFeatures.length ? planFeatures.map((feature) => <li key={feature} className="flex gap-2 text-xs text-apple-ink-muted-80"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />{feature}</li>) : <li className="text-xs text-apple-ink-muted-48">Configured by your plan administrator.</li>}</ul></div>
    {planLimits.length > 0 && <div className="mt-5 border-t border-zinc-100 pt-5"><p className="text-[11px] font-bold uppercase tracking-wider text-apple-ink-muted-48">Plan limits</p><ul className="mt-3 space-y-2">{planLimits.map((limit) => <li key={limit} className="text-xs text-apple-ink-muted-80">{limit}</li>)}</ul></div>}
  </article>;
}

export function Pricing() {
  const { data, isLoading, isError } = useGetPublicPlansQuery(undefined, { pollingInterval: 60_000, refetchOnFocus: true, refetchOnReconnect: true });
  const plans = data?.data?.plans ?? [];
  const featureRows = [...new Set(plans.flatMap((plan) => [...enabled(plan), ...limits(plan)]))];
  return <section id="pricing" className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8"><div className="mx-auto max-w-7xl"><SectionHeading eyebrow="Pricing" title="Plans that grow with your business" description="Every price, feature, trial, and limit is configured by BornoLand administrators and shown here in real time." />
    {isLoading ? <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><PricingSkeleton /><PricingSkeleton /><PricingSkeleton /></div> : isError ? <div className="mx-auto mt-12 max-w-lg rounded-3xl border border-red-100 bg-red-50 p-8 text-center"><CircleX className="mx-auto h-8 w-8 text-red-500" /><h3 className="mt-3 font-semibold text-apple-ink">Pricing is temporarily unavailable</h3><p className="mt-1 text-sm text-apple-ink-muted-48">Please refresh the page or contact our team for current plan details.</p></div> : plans.length === 0 ? <div className="mx-auto mt-12 max-w-lg rounded-3xl border border-zinc-200 bg-apple-canvas-parchment p-9 text-center"><Sparkles className="mx-auto h-8 w-8 text-blue-600" /><h3 className="mt-3 text-lg font-semibold text-apple-ink">New plans are coming soon</h3><p className="mt-1 text-sm text-apple-ink-muted-48">Our team is preparing the right options for your store.</p></div> : <><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{plans.map((plan) => <PlanCard key={plan._id} plan={plan} />)}</div><div className="mt-14 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"><div className="border-b border-zinc-100 px-6 py-5"><h3 className="font-semibold text-apple-ink">Compare plan capabilities</h3><p className="mt-1 text-xs text-apple-ink-muted-48">Generated from the active plan configurations.</p></div><div className="overflow-x-auto"><table className="min-w-[720px] w-full text-left text-xs"><thead className="bg-apple-canvas-parchment"><tr><th className="px-6 py-3 font-semibold text-apple-ink-muted-48">Feature or limit</th>{plans.map((plan) => <th key={plan._id} className={cn("px-4 py-3 font-semibold", plan.isRecommended ? "bg-blue-50 text-blue-700" : "text-apple-ink-muted-48")}>{plan.name}</th>)}</tr></thead><tbody>{featureRows.map((feature) => <tr key={feature} className="border-t border-zinc-100"><th className="px-6 py-3 font-medium text-zinc-800">{feature}</th>{plans.map((plan) => { const available = enabled(plan).includes(feature) || limits(plan).includes(feature); return <td key={plan._id} className={cn("px-4 py-3", plan.isRecommended && "bg-blue-50/40")}>{available ? <Check className="h-4 w-4 text-emerald-600" /> : <CircleX className="h-4 w-4 text-zinc-300" />}</td> })}</tr>)}</tbody></table></div></div></>}
  </div></section>;
}

function PricingSkeleton() { return <div className="h-[440px] animate-pulse rounded-3xl border border-zinc-200 bg-apple-canvas-parchment p-6"><div className="h-5 w-24 rounded bg-zinc-200" /><div className="mt-4 h-10 w-36 rounded bg-zinc-200" /><div className="mt-8 space-y-3">{[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-3 rounded bg-zinc-200" />)}</div></div>; }
