"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Blocks,
  Bot,
  Building2,
  Check,
  CreditCard,
  Globe2,
  Layers3,
  LayoutDashboard,
  LineChart,
  LockKeyhole,
  Palette,
  Play,
  Rocket,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Truck,
  Users,
  WandSparkles,
  Zap
} from "lucide-react";

const trustedBrands = ["NovaMart", "Gridline", "Luma", "Saffron", "Orbit"];

const keyMetrics = [
  { value: "24h", label: "fastest setup to launch" },
  { value: "99.9%", label: "store uptime target" },
  { value: "1", label: "platform for SaaS + ecommerce" },
  { value: "∞", label: "store growth ceiling" }
];

const features = [
  { title: "Multi-tenant SaaS architecture", description: "Isolate stores, users, billing, and data cleanly across every tenant.", icon: Layers3 },
  { title: "Custom subdomains", description: "Give every store a branded URL with simple subdomains or connected custom domains.", icon: Globe2 },
  { title: "AI-powered store builder", description: "Generate polished storefronts and sections in minutes with guided AI workflows.", icon: Bot },
  { title: "Drag & drop homepage editor", description: "Rearrange blocks, banners, and product sections with visual editing controls.", icon: Blocks },
  { title: "Dynamic themes", description: "Ship premium storefront styles that adapt beautifully to mobile and desktop.", icon: Palette },
  { title: "Ecommerce dashboard", description: "Track orders, products, revenue, and store performance from one command center.", icon: LayoutDashboard },
  { title: "Product management", description: "Manage inventory, categories, media, variants, and pricing with ease.", icon: ShoppingBag },
  { title: "Analytics dashboard", description: "See conversion, order, traffic, and growth metrics in a readable dashboard.", icon: LineChart },
  { title: "Payment integration", description: "Connect checkout and payment methods that fit local and global selling.", icon: CreditCard },
  { title: "Delivery management", description: "Set delivery charges, locations, and fulfillment rules per store.", icon: Truck },
  { title: "Mobile responsive stores", description: "Every storefront is built to feel fast and polished on phones and tablets.", icon: Store },
  { title: "Fast performance", description: "Lean UI patterns and optimized storefront rendering keep experiences snappy.", icon: Zap }
];

const builderHighlights = [
  "Drag and drop blocks in seconds",
  "Preview your store while editing",
  "Customize colors, layout, and typography",
  "Shopify-style editing without code"
];

const ecommerceFeatures = [
  "Product management",
  "Checkout system",
  "Cart system",
  "Order management",
  "Delivery charges",
  "Payment methods",
  "Customer accounts"
];

const tenantFeatures = [
  "Multiple stores per account",
  "Custom domains per store",
  "Independent billing and plans",
  "Separate themes and layouts",
  "Separate products and catalog data"
];

const aiFeatures = [
  "AI homepage generation",
  "AI product descriptions",
  "AI design assistant",
  "Smart analytics insights",
  "AI content generation"
];

const whyChoose = [
  "Fast setup with premium starter flows",
  "No coding needed to launch and iterate",
  "AI-first workflow for modern teams",
  "Multi-store management from one dashboard",
  "Built for Bangladesh ecommerce operations",
  "Modern SaaS infrastructure with room to scale"
];

const testimonials = [
  {
    name: "Ayesha Rahman",
    role: "Ecommerce founder",
    quote: "BornoLand feels like the missing layer between a store idea and a production-ready SaaS commerce brand."
  },
  {
    name: "Tanvir Hossain",
    role: "Small business owner",
    quote: "We launched a polished storefront, switched themes, and managed orders without needing a developer."
  },
  {
    name: "Mina Chowdhury",
    role: "Startup creator",
    quote: "The multi-tenant setup and AI builder make it easy to scale beyond a single store."
  }
];

const faqs = [
  {
    question: "How does multi-tenant support work?",
    answer: "Each user can create isolated stores with separate settings, products, themes, billing, and custom domains under one platform account."
  },
  {
    question: "Does BornoLand support payments and billing?",
    answer: "Yes. The platform is designed around store billing, pricing tiers, payment methods, and checkout flows that can scale with your business."
  },
  {
    question: "Can I connect a custom domain?",
    answer: "Absolutely. Stores can run on free subdomains or be mapped to custom domains for a fully branded ecommerce presence."
  },
  {
    question: "What does the AI builder actually do?",
    answer: "It helps generate homepage sections, product copy, store layouts, and content suggestions so teams can launch much faster."
  },
  {
    question: "How does pricing and store limits work?",
    answer: "Plans are structured around store counts, product limits, and feature tiers so teams can start small and upgrade as they grow."
  },
  {
    question: "Is this built for Bangladesh ecommerce businesses?",
    answer: "Yes. The platform is positioned for Bangladesh-first ecommerce workflows while staying modern enough for global SaaS growth."
  }
];

const storeShowcases = [
  {
    name: "Fashion Store",
    tag: "Premium Template",
    accent: "from-rose-500 to-orange-400",
    description: "Editorial layouts, featured collections, and high-conversion product storytelling.",
    metrics: ["28% repeat buyers", "4.9 rating", "2-day launch"]
  },
  {
    name: "Beauty Studio",
    tag: "AI Assisted",
    accent: "from-fuchsia-500 to-pink-400",
    description: "Soft visuals, routine bundles, and conversion-focused checkout flows.",
    metrics: ["3x faster setup", "Mobile-first", "Custom domain"]
  },
  {
    name: "Electronics Shop",
    tag: "Scale Ready",
    accent: "from-sky-500 to-cyan-400",
    description: "Performance-heavy storefronts with product grids, specs, and trust layers.",
    metrics: ["128 SKUs", "Advanced filters", "Live analytics"]
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: "৳1000",
    note: "per month",
    description: "Best for solo founders and early-stage stores.",
    features: ["1 Store", "50 Products", "Free subdomain", "Basic analytics", "Mobile responsive theme", "Checkout system"],
    cta: "Start Free Trial",
    highlighted: false
  },
  {
    name: "Business",
    price: "৳2000",
    note: "per month",
    description: "For growing brands that need multiple storefronts and AI tools.",
    features: ["5 Stores", "Unlimited products", "Advanced analytics", "Premium themes", "AI tools", "Custom branding", "Priority support"],
    cta: "Most Popular",
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "৳5000",
    note: "per month",
    description: "For teams that want scale, governance, and dedicated support.",
    features: ["Unlimited stores", "Advanced AI tools", "Team management", "API access", "Dedicated support", "Enterprise analytics"],
    cta: "Contact Sales",
    highlighted: false
  }
];

const builderTabs = ["Fashion", "Beauty", "Electronics"] as const;

const builderPreview = {
  Fashion: {
    title: "Modern apparel storefront",
    headline: "Drop new collections with editorial polish.",
    color: "from-zinc-900 via-zinc-800 to-zinc-700",
    chips: ["Hero banner", "Featured products", "Sale badge"]
  },
  Beauty: {
    title: "Beauty and wellness brand",
    headline: "Build a calm storefront with guided routines and bundles.",
    color: "from-rose-500 via-fuchsia-500 to-purple-500",
    chips: ["Routine cards", "Bundles", "Before-after"]
  },
  Electronics: {
    title: "Product-heavy catalog",
    headline: "Show specs, categories, and trust signals at a glance.",
    color: "from-sky-500 via-cyan-500 to-emerald-500",
    chips: ["Specs table", "Filters", "Warranty"]
  }
} as const;

const sectionFade: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } }
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark"
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
}) {
  return (
    <div className={`space-y-4 ${align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.35em] ${tone === "light" ? "text-zinc-400" : "text-zinc-500"}`}>{eyebrow}</p>
      <h2 className={`text-balance text-3xl font-semibold tracking-tight md:text-5xl ${tone === "light" ? "text-white" : "text-zinc-950"}`} style={{ fontFamily: "var(--font-space-grotesk)" }}>
        {title}
      </h2>
      <p className={`text-pretty text-base leading-7 md:text-lg ${tone === "light" ? "text-zinc-300" : "text-zinc-600"}`}>{description}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.24)] backdrop-blur">
      <div className="text-2xl font-semibold tracking-tight text-zinc-950" style={{ fontFamily: "var(--font-space-grotesk)" }}>
        {value}
      </div>
      <p className="mt-1 text-sm text-zinc-600">{label}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: typeof Layers3; title: string; description: string }) {
  return (
    <motion.article
      variants={sectionFade}
      className="group rounded-[1.75rem] border border-white/10 bg-white/95 p-6 shadow-[0_22px_60px_-35px_rgba(15,23,42,0.18)] transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_30px_90px_-35px_rgba(15,23,42,0.28)]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#0f172a,_#2563eb)] text-white transition duration-300 group-hover:scale-105 group-hover:rotate-3">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-zinc-950" style={{ fontFamily: "var(--font-space-grotesk)" }}>
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-zinc-600">{description}</p>
    </motion.article>
  );
}

function PlayButton() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 text-white">
      <Play className="ml-0.5 h-3.5 w-3.5 fill-white" />
    </span>
  );
}

function FloatingCard({ title, value, note, accent = "bg-zinc-950" }: { title: string; value: string; note: string; accent?: string }) {
  return (
    <div className="w-44 rounded-[1.5rem] border border-white/70 bg-white/90 p-4 shadow-[0_20px_45px_-20px_rgba(15,23,42,0.3)] backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500">{title}</p>
        <span className={`h-2.5 w-2.5 rounded-full ${accent}`} />
      </div>
      <p className="mt-3 text-2xl font-semibold text-zinc-950" style={{ fontFamily: "var(--font-space-grotesk)" }}>{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{note}</p>
    </div>
  );
}

function MiniCard({ title, value, icon: Icon }: { title: string; value: string; icon: typeof BarChart3 }) {
  return (
    <div className="rounded-[1.5rem] border border-zinc-200 bg-white p-4 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">{title}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-zinc-950 text-white">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold text-zinc-950" style={{ fontFamily: "var(--font-space-grotesk)" }}>{value}</p>
    </div>
  );
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <ul className="mt-4 space-y-3 text-sm text-zinc-600">
        {items.map((item) => (
          <li key={item}>
            <a href="#" className="transition hover:text-zinc-950">{item}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HomePage() {
  const [selectedTab, setSelectedTab] = useState<(typeof builderTabs)[number]>("Fashion");
  const selectedPreview = builderPreview[selectedTab];

  return (
    <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.1),_transparent_28%),linear-gradient(180deg,_#ffffff_0%,_#f4f7fb_45%,_#eef2ff_100%)]">
      <div className="absolute inset-x-0 top-0 -z-10 h-[42rem] bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(255,255,255,0))]" />
      <div className="absolute left-[-8rem] top-32 -z-10 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="absolute right-[-6rem] top-72 -z-10 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />

      <header className="sticky top-4 z-50 mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-full border border-white/70 bg-white/70 px-4 py-3 shadow-[0_20px_80px_-25px_rgba(15,23,42,0.3)] backdrop-blur-xl lg:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#0f172a,_#2563eb)] text-white shadow-lg shadow-blue-950/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">BornoLand</p>
            <p className="text-xs text-zinc-500">AI-powered commerce infrastructure</p>
          </div>
        </div>

        <nav className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-2 py-1 text-sm text-zinc-600 md:flex">
          <a href="#features" className="rounded-full px-4 py-2 transition hover:bg-zinc-950 hover:text-white">Features</a>
          <a href="#builder" className="rounded-full px-4 py-2 transition hover:bg-zinc-950 hover:text-white">Builder</a>
          <a href="#pricing" className="rounded-full px-4 py-2 transition hover:bg-zinc-950 hover:text-white">Pricing</a>
          <a href="#faq" className="rounded-full px-4 py-2 transition hover:bg-zinc-950 hover:text-white">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50 sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-zinc-950/10 transition hover:-translate-y-0.5 hover:bg-zinc-800"
          >
            Start Free Trial
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-28 pt-12 lg:px-8 lg:pb-40 lg:pt-16">
        <div className="grid gap-20 lg:grid-cols-[1.03fr_0.97fr] lg:items-center">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-10">
            <motion.div variants={sectionFade} className="inline-flex items-center gap-2 rounded-full border border-cyan-200/80 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700 shadow-[0_12px_40px_-20px_rgba(14,165,233,0.6)] backdrop-blur">
              <Zap className="h-3.5 w-3.5" /> AI-Powered Multi-Tenant Ecommerce Platform
            </motion.div>

            <motion.div variants={sectionFade} className="space-y-7">
              <h1 className="max-w-3xl text-balance text-5xl font-semibold tracking-tight text-zinc-950 sm:text-6xl lg:text-[4.8rem] lg:leading-[0.95]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Build Your Ecommerce Brand Faster With AI-Powered Storefronts
              </h1>
              <p className="max-w-xl text-pretty text-base leading-8 text-zinc-600 md:text-lg">
                BornoLand helps entrepreneurs launch beautiful online stores with custom domains, AI-powered builders,
                multi-tenant SaaS architecture, analytics, payments, and modern ecommerce tools - all in one platform.
              </p>
            </motion.div>

            <motion.div variants={sectionFade} className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,_#0f172a,_#2563eb)] px-7 py-3.5 text-sm font-medium text-white shadow-[0_18px_50px_-22px_rgba(37,99,235,0.7)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-20px_rgba(37,99,235,0.8)]"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#builder"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white/90 px-7 py-3.5 text-sm font-medium text-zinc-900 shadow-[0_12px_40px_-22px_rgba(15,23,42,0.32)] transition hover:-translate-y-0.5 hover:bg-white"
              >
                <PlayButton />
                Watch Demo
              </a>
            </motion.div>

            <motion.div variants={sectionFade} className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.22)] backdrop-blur">
                <p className="text-sm font-medium text-zinc-500">Why founders choose BornoLand</p>
                <p className="mt-3 text-sm leading-7 text-zinc-600">
                  Launch multiple stores, keep billing isolated, and give every tenant a branded storefront without building the infrastructure from scratch.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-indigo-100 bg-[linear-gradient(135deg,_rgba(224,231,255,0.95),_rgba(236,254,255,0.9))] p-6 shadow-[0_20px_60px_-40px_rgba(79,70,229,0.24)]">
                <p className="text-sm font-medium text-indigo-800">Built for conversion</p>
                <p className="mt-3 text-sm leading-7 text-indigo-950/75">
                  Shopify-style storefront editing, AI content generation, and high-clarity pricing help teams sell faster with less friction.
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -left-6 top-10 hidden md:block">
              <FloatingCard title="Revenue" value="৳128,400" note="+28.4% this month" />
            </div>
            <div className="absolute -right-4 top-40 hidden md:block">
              <FloatingCard title="Orders" value="642" note="124 pending" accent="bg-cyan-500" />
            </div>

            <div className="relative overflow-hidden rounded-[2.4rem] border border-white/70 bg-white/85 p-4 shadow-[0_40px_120px_-45px_rgba(15,23,42,0.32)] backdrop-blur md:p-6">
              <div className="absolute inset-x-8 top-8 -z-10 h-32 rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.35),_transparent_68%)] blur-2xl" />
              <div className="absolute -right-10 bottom-6 -z-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,_rgba(168,85,247,0.28),_transparent_65%)] blur-2xl" />
              <div className="rounded-[1.9rem] border border-zinc-200/80 bg-[linear-gradient(180deg,_#0f172a,_#020617)] p-5 text-white shadow-[0_30px_90px_-35px_rgba(15,23,42,0.5)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">Store Builder</p>
                    <h3 className="mt-2 text-2xl font-semibold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                      Live ecommerce preview
                    </h3>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-zinc-300 backdrop-blur">Published</div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[1.6rem] bg-white/6 p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between text-sm text-zinc-300">
                      <span>Storefront performance</span>
                      <span>91 score</span>
                    </div>
                    <div className="mt-5 grid h-44 grid-cols-6 items-end gap-2">
                      {[52, 66, 54, 82, 70, 92].map((height, index) => (
                        <motion.div
                          key={height}
                          initial={{ scaleY: 0.6, opacity: 0 }}
                          animate={{ scaleY: 1, opacity: 1 }}
                          transition={{ delay: index * 0.06, duration: 0.5 }}
                          className="origin-bottom rounded-full bg-[linear-gradient(180deg,_rgba(34,211,238,1),_rgba(99,102,241,1))] shadow-[0_0_30px_rgba(56,189,248,0.25)]"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.6rem] border border-white/10 bg-white p-4 text-zinc-950 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
                      <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Store snapshot</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold" style={{ fontFamily: "var(--font-space-grotesk)" }}>Borno Style Co.</p>
                          <p className="text-sm text-zinc-500">bornostyle.bornoland.com</p>
                        </div>
                        <div className="rounded-2xl bg-zinc-950 px-3 py-2 text-sm text-white">Live</div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <MiniCard title="Product views" value="42.8k" icon={BarChart3} />
                      <MiniCard title="Conversion" value="4.7%" icon={ShoppingCart} />
                    </div>

                    <div className="rounded-[1.6rem] border border-white/10 bg-white p-4 text-zinc-950 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-zinc-500">Builder blocks</p>
                        <Sparkles className="h-4 w-4 text-cyan-500" />
                      </div>
                      <div className="mt-3 grid gap-2">
                        {["Hero", "Featured products", "Trust bar", "Testimonials"].map((item) => (
                          <div key={item} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">{item}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-28 lg:px-8">
        <motion.div variants={sectionFade} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="rounded-[2.25rem] border border-white/70 bg-white/75 px-6 py-8 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.25)] backdrop-blur-xl lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">Trusted by modern creators and ecommerce startups</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {trustedBrands.map((brand) => (
                  <div key={brand} className="rounded-full border border-white/80 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.24)]">{brand}</div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {keyMetrics.map((metric) => (
                <StatCard key={metric.label} value={metric.value} label={metric.label} />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 pb-28 lg:px-8">
        <div className="rounded-[3rem] bg-[linear-gradient(180deg,_#020617,_#0f172a_46%,_#111827)] px-6 py-16 text-white shadow-[0_35px_120px_-55px_rgba(15,23,42,0.45)] lg:px-8 lg:py-20">
          <div className="space-y-12">
            <SectionHeading
              eyebrow="Features"
              title="Everything you need to run a premium ecommerce SaaS"
              description="BornoLand combines storefront building, multi-tenant SaaS structure, checkout flows, and growth tooling into a single modern platform."
              tone="light"
            />
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid auto-rows-[minmax(0,1fr)] gap-5 md:grid-cols-2 xl:grid-cols-4">
              {features.map((feature, index) => (
                <div key={feature.title} className={index === 0 || index === 2 ? "xl:col-span-2" : ""}>
                  <FeatureCard icon={feature.icon} title={feature.title} description={feature.description} />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section id="builder" className="mx-auto max-w-7xl px-6 pb-28 lg:px-8">
        <div className="grid gap-8 rounded-[2.5rem] border border-zinc-200 bg-white/85 p-6 shadow-[0_35px_120px_-55px_rgba(15,23,42,0.28)] backdrop-blur lg:grid-cols-[0.92fr_1.08fr] lg:p-8">
          <motion.div variants={sectionFade} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="space-y-6 lg:sticky lg:top-28 self-start">
            <SectionHeading
              eyebrow="Store Builder"
              title="Design your store visually"
              description="Use a Shopify-style editor to drag, drop, preview, and customize your store with a real-time frontend feel."
            />
            <div className="space-y-4">
              {builderHighlights.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[1.4rem] border border-zinc-200 bg-white px-4 py-4 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.24)]">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#0f172a,_#2563eb)] text-white">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm leading-6 text-zinc-700">{item}</p>
                </div>
              ))}
            </div>
            <div className="rounded-[1.75rem] border border-indigo-100 bg-[linear-gradient(135deg,_rgba(238,242,255,0.95),_rgba(236,254,255,0.82))] p-5 shadow-[0_18px_45px_-28px_rgba(79,70,229,0.26)]">
              <p className="text-sm font-semibold text-indigo-900">Visual editing made simple</p>
              <p className="mt-2 text-sm leading-7 text-indigo-950/75">
                Create landing sections, swap themes, and control store branding from a clean, intuitive interface designed for speed.
              </p>
            </div>
          </motion.div>

          <motion.div variants={sectionFade} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="rounded-[2rem] border border-zinc-200 bg-[linear-gradient(180deg,_#0f172a,_#020617)] p-4 text-white shadow-[0_30px_100px_-50px_rgba(15,23,42,0.4)] md:p-6">
            <div className="flex flex-wrap gap-2">
              {builderTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedTab === tab ? "bg-white text-zinc-950 shadow-lg shadow-black/20" : "bg-white/8 text-zinc-300 hover:bg-white/12"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className={`rounded-[1.9rem] bg-gradient-to-br ${selectedPreview.color} p-5 shadow-2xl shadow-black/20`}>
                <p className="text-xs uppercase tracking-[0.35em] text-white/75">{selectedPreview.title}</p>
                <h3 className="mt-4 max-w-sm text-2xl font-semibold leading-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {selectedPreview.headline}
                </h3>
                <div className="mt-8 space-y-3 rounded-[1.5rem] bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur">
                  {selectedPreview.chips.map((chip) => (
                    <div key={chip} className="rounded-2xl bg-white/12 px-4 py-3 text-sm text-white/90 shadow-[0_10px_20px_-16px_rgba(255,255,255,0.45)]">{chip}</div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.6rem] bg-white p-5 text-zinc-950 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.26)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Theme controls</p>
                      <p className="mt-1 text-lg font-semibold" style={{ fontFamily: "var(--font-space-grotesk)" }}>Real-time customization</p>
                    </div>
                    <WandSparkles className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      ["Typography", "Space Grotesk"],
                      ["Layout", "Editorial"],
                      ["Colors", "Zinc + Cyan"],
                      ["Spacing", "Large"]
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-zinc-200 bg-[linear-gradient(180deg,_#ffffff,_#f8fafc)] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">{label}</p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(135deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.03))] p-5 text-white/90 shadow-[0_18px_50px_-35px_rgba(255,255,255,0.12)]">
                  <div className="flex items-center gap-2 text-sm font-medium text-cyan-300">
                    <Rocket className="h-4 w-4" /> Shopify-style editing, but built for multi-tenant SaaS
                  </div>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">
                    Every section is designed to feel like a living storefront so merchants can ship pages, test offers, and iterate without breaking the brand system.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-28 lg:px-8">
        <div className="grid gap-8 rounded-[2.5rem] bg-[linear-gradient(180deg,_#ffffff,_#f8fafc)] p-6 shadow-[0_28px_100px_-55px_rgba(15,23,42,0.22)] lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
          <motion.div variants={sectionFade} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="space-y-6">
            <SectionHeading
              eyebrow="Ecommerce"
              title="Built for the full commerce lifecycle"
              description="From product management to checkout and delivery, BornoLand gives merchants the operational tools they need every day."
            />
            <div className="rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.18)]">
              <div className="grid gap-3 sm:grid-cols-2">
                {ecommerceFeatures.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-[linear-gradient(180deg,_#ffffff,_#f8fafc)] px-4 py-3 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.24)]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#0f172a,_#2563eb)] text-white">
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-zinc-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={sectionFade} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { title: "Store-wide product management", icon: ShoppingBag, description: "Keep inventory, pricing, variants, and media organized across every store." },
              { title: "Checkout and cart systems", icon: ShoppingCart, description: "Offer smooth cart journeys and flexible checkout experiences." },
              { title: "Order management", icon: Building2, description: "Track fulfillment states, order queues, and customer actions at a glance." },
              { title: "Delivery charges", icon: Truck, description: "Set delivery logic, fees, and fulfillment rules that fit each store." },
              { title: "Payment methods", icon: CreditCard, description: "Support payment options that help merchants convert with confidence." },
              { title: "Customer accounts", icon: Users, description: "Let shoppers sign in, track orders, and return to the brand later." }
            ].map((feature) => (
              <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} description={feature.description} />
            ))}
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="grid gap-8 rounded-[2.25rem] border border-zinc-200 bg-white p-6 shadow-[0_35px_120px_-55px_rgba(15,23,42,0.28)] lg:grid-cols-[1fr_1fr] lg:p-8">
          <motion.div variants={sectionFade} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="space-y-6">
            <SectionHeading
              eyebrow="Multi-Tenant System"
              title="One account, many storefronts"
              description="BornoLand is structured so each customer can manage multiple stores while keeping branding, billing, and product data separate."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {tenantFeatures.map((item) => (
                <div key={item} className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                    <LockKeyhole className="h-4 w-4" />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-zinc-700">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={sectionFade} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="rounded-[2rem] bg-[linear-gradient(180deg,_#0f172a,_#020617)] p-6 text-white shadow-[0_30px_100px_-50px_rgba(15,23,42,0.35)]">
            <div className="grid gap-4 md:grid-cols-[1fr_0.85fr]">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">Tenant flow</p>
                <div className="mt-5 space-y-3">
                  {[
                    "User account",
                    "Multiple stores",
                    "Independent billing",
                    "Separate themes and products"
                  ].map((item, index) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-950">0{index + 1}</div>
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-sm text-zinc-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-[1.75rem] bg-white p-5 text-zinc-950 shadow-xl">
                  <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">Tenant isolation</p>
                  <p className="mt-3 text-lg font-semibold" style={{ fontFamily: "var(--font-space-grotesk)" }}>Each tenant feels like its own product.</p>
                  <p className="mt-3 text-sm leading-7 text-zinc-600">
                    Stores are separated at the data, theme, and operational layer so brands can scale safely inside the same platform.
                  </p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-cyan-300">
                    <Globe2 className="h-4 w-4" /> Custom domains, isolated data, and clear tenant boundaries
                  </div>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">
                    The platform is designed to support multiple storefronts per customer while keeping every experience branded and operationally distinct.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <motion.div variants={sectionFade} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="space-y-6">
            <SectionHeading
              eyebrow="AI Features"
              title="AI turns blank stores into launch-ready storefronts"
              description="Use intelligent automation to generate pages, write copy, and uncover opportunities without slowing down your team."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {aiFeatures.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.2)]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-50 text-cyan-700">
                    <Bot className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-zinc-700">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={sectionFade} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.24)]">
            <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,_#ecfeff,_#eef2ff_55%,_#ffffff)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-700">AI workflow</p>
              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_0.8fr]">
                <div className="rounded-[1.5rem] border border-cyan-100 bg-white p-4 shadow-sm">
                  <p className="text-sm font-medium text-zinc-500">Generate</p>
                  <p className="mt-2 text-lg font-semibold text-zinc-950" style={{ fontFamily: "var(--font-space-grotesk)" }}>Homepage sections, product copy, and campaign content</p>
                </div>
                <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-950 p-4 text-white">
                  <p className="text-sm text-zinc-300">Smart analytics</p>
                  <p className="mt-2 text-3xl font-semibold" style={{ fontFamily: "var(--font-space-grotesk)" }}>+31%</p>
                  <p className="mt-1 text-sm text-zinc-400">conversion lift after AI-assisted edits</p>
                </div>
              </div>
              <div className="mt-4 rounded-[1.5rem] border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">AI design assistant</p>
                    <p className="text-sm text-zinc-600">Suggests layout, visuals, and copy based on your store category.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="showcase" className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="space-y-10">
          <SectionHeading
            eyebrow="Live Store Showcase"
            title="Demo storefronts that make the platform feel real"
            description="Switch between templates and preview how different businesses can use the same system with different looks, offers, and sales flows."
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {storeShowcases.map((store) => (
              <motion.article key={store.name} variants={sectionFade} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_25px_70px_-45px_rgba(15,23,42,0.22)]">
                <div className={`h-40 bg-gradient-to-br ${store.accent} p-5 text-white`}>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/75">{store.tag}</p>
                  <p className="mt-10 max-w-[14rem] text-2xl font-semibold leading-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>{store.name}</p>
                </div>
                <div className="space-y-4 p-5">
                  <p className="text-sm leading-7 text-zinc-600">{store.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {store.metrics.map((metric) => (
                      <span key={metric} className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600">{metric}</span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="grid gap-6 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_30px_100px_-55px_rgba(15,23,42,0.28)] lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">Templates</p>
              <div className="mt-4 space-y-3">
                {storeShowcases.map((store) => {
                  const tab = store.name.startsWith("Fashion") ? "Fashion" : store.name.startsWith("Beauty") ? "Beauty" : "Electronics";

                  return (
                    <button
                      key={store.name}
                      onClick={() => setSelectedTab(tab)}
                      className={`w-full rounded-[1.5rem] border px-4 py-4 text-left transition ${selectedTab === tab ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium">{store.name}</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <p className="mt-1 text-xs uppercase tracking-[0.3em] opacity-70">{store.tag}</p>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-zinc-200 bg-[linear-gradient(180deg,_#f8fafc,_#eef2ff)] p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Current preview</p>
              <div className="mt-4 rounded-[1.5rem] bg-white p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.2)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">{selectedPreview.title}</p>
                    <p className="mt-2 text-xl font-semibold text-zinc-950" style={{ fontFamily: "var(--font-space-grotesk)" }}>{selectedPreview.headline}</p>
                  </div>
                  <div className="rounded-2xl bg-zinc-950 px-3 py-2 text-sm text-white">Shop Now</div>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <p className="text-xs text-zinc-400">Products</p>
                        <p className="mt-2 text-lg font-semibold text-zinc-950">128</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <p className="text-xs text-zinc-400">Orders</p>
                        <p className="mt-2 text-lg font-semibold text-zinc-950">64</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <p className="text-xs text-zinc-400">Traffic</p>
                        <p className="mt-2 text-lg font-semibold text-zinc-950">18.2k</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <p className="text-xs text-zinc-400">Revenue</p>
                        <p className="mt-2 text-lg font-semibold text-zinc-950">৳92k</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-950 p-4 text-white">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Conversion signals</p>
                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl bg-white/6 px-4 py-3 text-sm">Fast checkout</div>
                      <div className="rounded-2xl bg-white/6 px-4 py-3 text-sm">Trust badges</div>
                      <div className="rounded-2xl bg-white/6 px-4 py-3 text-sm">AI-generated copy</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="space-y-12">
          <SectionHeading
            eyebrow="Pricing"
            title="Simple plans that scale with store growth"
            description="Start with a lean plan, then unlock more stores, advanced analytics, and AI capabilities as your business expands."
            align="center"
          />

          <div className="grid gap-6 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <motion.article
                key={plan.name}
                variants={sectionFade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className={`rounded-[2rem] border p-6 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.24)] ${plan.highlighted ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-xs uppercase tracking-[0.35em] ${plan.highlighted ? "text-zinc-400" : "text-zinc-500"}`}>{plan.name}</p>
                    <div className="mt-3 flex items-end gap-2">
                      <p className="text-4xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>{plan.price}</p>
                      <span className={`pb-1 text-sm ${plan.highlighted ? "text-zinc-400" : "text-zinc-500"}`}>{plan.note}</span>
                    </div>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold ${plan.highlighted ? "bg-white text-zinc-950" : "bg-zinc-950 text-white"}`}>{plan.cta}</div>
                </div>

                <p className={`mt-4 text-sm leading-7 ${plan.highlighted ? "text-zinc-300" : "text-zinc-600"}`}>{plan.description}</p>

                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${plan.highlighted ? "bg-white/5" : "bg-zinc-50"}`}>
                      <Check className={`h-4 w-4 ${plan.highlighted ? "text-cyan-300" : "text-emerald-500"}`} />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={plan.name === "Enterprise" ? "/contact" : "/register"}
                  className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${plan.highlighted ? "bg-white text-zinc-950 hover:bg-zinc-100" : "bg-zinc-950 text-white hover:bg-zinc-800"}`}
                >
                  {plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="grid gap-8 rounded-[2.25rem] border border-zinc-200 bg-white p-6 shadow-[0_35px_120px_-55px_rgba(15,23,42,0.28)] lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
          <SectionHeading
            eyebrow="Why Choose BornoLand"
            title="Built for founders who want speed and structure"
            description="BornoLand gives teams the clarity of a SaaS system and the flexibility of a premium ecommerce builder."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {whyChoose.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-4">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white">
                  <Check className="h-4 w-4" />
                </div>
                <p className="text-sm leading-6 text-zinc-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="space-y-10">
          <SectionHeading
            eyebrow="Testimonials"
            title="Loved by founders, makers, and small businesses"
            description="Teams use BornoLand to move faster, look more premium, and launch storefronts that feel built for growth."
            align="center"
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {testimonials.map((item) => (
              <motion.article key={item.name} variants={sectionFade} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_22px_60px_-40px_rgba(15,23,42,0.22)]">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={index}>★</span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-7 text-zinc-600">“{item.quote}”</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-950 text-sm font-semibold text-white">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-950">{item.name}</p>
                    <p className="text-xs text-zinc-500">{item.role}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="grid gap-8 rounded-[2.25rem] border border-zinc-200 bg-white p-6 shadow-[0_35px_120px_-55px_rgba(15,23,42,0.28)] lg:grid-cols-[0.85fr_1.15fr] lg:p-8">
          <SectionHeading
            eyebrow="FAQ"
            title="Clear answers before the first demo"
            description="Answer the practical questions founders ask when evaluating multi-tenant ecommerce software."
          />
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-5 transition open:bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-semibold text-zinc-950">
                  <span className="pr-4">{faq.question}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 transition group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm leading-7 text-zinc-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-[linear-gradient(135deg,_#0f172a,_#1e293b_45%,_#0f172a)] p-8 text-white shadow-[0_35px_120px_-55px_rgba(15,23,42,0.4)] md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">Final CTA</p>
              <h2 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight md:text-6xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Start Building Your Ecommerce Brand Today
              </h2>
              <p className="max-w-xl text-pretty text-base leading-8 text-zinc-300 md:text-lg">
                Launch a modern storefront, generate content with AI, and run multiple stores on a platform designed to feel premium from day one.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-medium text-zinc-950 transition hover:-translate-y-0.5 hover:bg-zinc-100">
                  Create Free Store
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-white/10">
                  Contact Sales
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard value="3 min" label="to create a store" />
              <StatCard value="AI" label="driven content generation" />
              <StatCard value="Multi-tenant" label="architecture out of the box" />
              <StatCard value="Bangladesh" label="first ecommerce focus" />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-white/80">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">BornoLand</p>
                <p className="text-sm text-zinc-500">Premium AI-powered ecommerce infrastructure</p>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-7 text-zinc-600">
              Build multi-tenant ecommerce experiences with storefront editing, AI tools, analytics, payments, and scalable SaaS architecture.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              {[
                ["x.com", "https://x.com"],
                ["LinkedIn", "https://www.linkedin.com"],
                ["Instagram", "https://www.instagram.com"],
                ["Email", "mailto:hello@bornoland.com"]
              ].map(([label, href]) => (
                <Link key={label} href={href} className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-100">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <FooterColumn title="Product" items={["Features", "Builder", "Templates", "Analytics"]} />
            <FooterColumn title="Company" items={["Pricing", "Documentation", "API", "Contact"]} />
            <FooterColumn title="Resources" items={["Dashboard", "Login", "Register", "Support"]} />
            <FooterColumn title="Legal" items={["Privacy", "Terms", "Cookies", "Billing"]} />
          </div>
        </div>
      </footer>
    </main>
  );
}