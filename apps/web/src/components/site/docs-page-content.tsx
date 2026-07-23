"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  KeyRound,
  Download,
  Settings2,
  Code2,
  Lightbulb,
  Boxes,
  ShieldCheck,
  Rocket,
  Wrench,
  ArrowRight,
  Menu,
} from "lucide-react";
import { SitePageHero } from "@/components/site/site-page-hero";
import { SiteCtaBanner } from "@/components/site/site-cta-banner";
import { landingContainer } from "@/components/landing/landing-ui";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type DocSection = {
  id: string;
  title: string;
  icon: typeof BookOpen;
  summary: string;
  body: string[];
  code?: { label: string; language: string; content: string };
  alert?: { variant: "default" | "destructive" | "success"; title: string; description: string };
};

const DOC_SECTIONS: DocSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    summary: "Create a workspace, launch your first store, and publish in minutes.",
    body: [
      "BornoLand is an ecommerce SaaS platform for merchants who need a professional storefront, local payments, inventory control, and a clean admin experience.",
      "Sign up at the register page, verify your email, then create a store with a unique subdomain. Choose a template, add a few products, connect a payment method, and publish when you are ready.",
      "Use the in-app checklist on the dashboard home to track domain, SSL, shipping, and policy pages before you drive traffic.",
    ],
    code: {
      label: "Example store URL",
      language: "text",
      content: "https://your-brand.bornoland.com\nhttps://www.yourdomain.com  # after custom domain + SSL",
    },
    alert: {
      variant: "default",
      title: "Tip",
      description:
        "Complete payments and shipping before sharing your store link. Customers who hit an incomplete checkout rarely return.",
    },
  },
  {
    id: "authentication",
    title: "Authentication",
    icon: KeyRound,
    summary: "Secure dashboard logins and API access with the right credentials.",
    body: [
      "Merchant users authenticate to the dashboard with email and password. Enable two-factor authentication for Owners and Admins under Account security.",
      "Server-side integrations authenticate with API keys. Create keys in Developer settings, assign least-privilege scopes, and rotate them on a schedule.",
      "Never embed secret API keys in storefront JavaScript or mobile apps. Use backend services or edge functions that keep secrets off the client.",
    ],
    code: {
      label: "Bearer token request",
      language: "bash",
      content:
        'curl -X GET "https://api.bornoland.com/v1/products" \\\n  -H "Authorization: Bearer bl_live_xxxxxxxx" \\\n  -H "X-Store-Id: store_abc123" \\\n  -H "Content-Type: application/json"',
    },
    alert: {
      variant: "destructive",
      title: "Warning",
      description:
        "If a key is exposed in a public repo or chat, revoke it immediately and generate a replacement before continuing sync jobs.",
    },
  },
  {
    id: "installation",
    title: "Installation",
    icon: Download,
    summary: "Install SDKs and CLI helpers for custom storefronts and sync jobs.",
    body: [
      "Most merchants do not need a local install — the hosted builder and dashboard are enough to run a store.",
      "Developers can install the official client for Node.js when building admin tools, ERP sync, or headless experiences against the BornoLand API.",
      "Pin SDK versions in production and review changelog notes before upgrading major releases.",
    ],
    code: {
      label: "Install the Node SDK",
      language: "bash",
      content: "npm install @bornoland/sdk\n# or\npnpm add @bornoland/sdk",
    },
  },
  {
    id: "configuration",
    title: "Configuration",
    icon: Settings2,
    summary: "Configure store locale, currency, taxes, shipping, and notifications.",
    body: [
      "Open Store settings to set display currency, default language (English or Bangla), and timezone for order timestamps.",
      "Define shipping zones for Dhaka, other metro areas, and nationwide courier rates. Attach COD rules by city or order total when needed.",
      "Configure email and SMS notifications for order confirmation, shipping updates, and low-stock alerts so your team reacts quickly.",
    ],
    code: {
      label: "Environment variables (server)",
      language: "env",
      content:
        "BORNOLAND_API_KEY=bl_live_xxxxxxxx\nBORNOLAND_STORE_ID=store_abc123\nBORNOLAND_WEBHOOK_SECRET=whsec_xxxxxxxx",
    },
    alert: {
      variant: "success",
      title: "Recommended",
      description:
        "Store secrets in your host’s environment manager (or a vault). Never commit .env files with live keys.",
    },
  },
  {
    id: "api",
    title: "API",
    icon: Code2,
    summary: "REST endpoints for products, inventory, orders, and customers.",
    body: [
      "The production API base URL is https://api.bornoland.com/v1. All requests require HTTPS and a valid Authorization header.",
      "Common resources include /products, /variants, /inventory, /orders, and /customers. List endpoints support pagination with limit and cursor parameters.",
      "Idempotency keys are supported on create/update order operations so retries from your workers do not duplicate side effects.",
    ],
    code: {
      label: "Create a product",
      language: "bash",
      content:
        'curl -X POST "https://api.bornoland.com/v1/products" \\\n  -H "Authorization: Bearer bl_live_xxxxxxxx" \\\n  -H "X-Store-Id: store_abc123" \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "title": "Classic Cotton Panjabi",\n    "sku": "PAN-NAVY-M",\n    "price": 1890,\n    "currency": "BDT",\n    "inventory": 40\n  }\'',
    },
    alert: {
      variant: "default",
      title: "Rate limits",
      description:
        "Respect published rate limits. Burst sync jobs should use exponential backoff and batch updates where possible.",
    },
  },
  {
    id: "examples",
    title: "Examples",
    icon: Lightbulb,
    summary: "Copy-ready patterns for common merchant and developer workflows.",
    body: [
      "Sync nightly inventory from a warehouse CSV into BornoLand variants using SKU as the stable key.",
      "Listen for order.paid webhooks to push packing slips into your courier portal automatically.",
      "Build a custom PDP that reads published product data from the API while checkout still runs on the BornoLand storefront.",
    ],
    code: {
      label: "Minimal Node example",
      language: "ts",
      content:
        'import { BornoLand } from "@bornoland/sdk";\n\nconst client = new BornoLand({\n  apiKey: process.env.BORNOLAND_API_KEY!,\n  storeId: process.env.BORNOLAND_STORE_ID!,\n});\n\nconst products = await client.products.list({ limit: 20 });\nconsole.log(products.data.map((p) => p.title));',
    },
  },
  {
    id: "sdk",
    title: "SDK",
    icon: Boxes,
    summary: "Typed helpers for authentication, resources, and webhook verification.",
    body: [
      "The official SDK wraps pagination, error mapping, and request retries so your integration code stays readable.",
      "Use the webhook verifier utility with your endpoint secret to validate signatures before mutating order state.",
      "Report SDK issues with version numbers and minimal reproduction steps so we can ship fixes quickly.",
    ],
    code: {
      label: "Verify a webhook",
      language: "ts",
      content:
        'import { verifyWebhook } from "@bornoland/sdk/webhooks";\n\nconst ok = verifyWebhook({\n  payload: rawBody,\n  signature: req.headers["x-bornoland-signature"],\n  secret: process.env.BORNOLAND_WEBHOOK_SECRET!,\n});\n\nif (!ok) throw new Error("Invalid webhook signature");',
    },
  },
  {
    id: "best-practices",
    title: "Best Practices",
    icon: ShieldCheck,
    summary: "Operational habits that keep stores fast, secure, and conversion-ready.",
    body: [
      "Compress product images and prefer modern formats for mobile shoppers on variable networks.",
      "Keep COD confirmation workflows tight in high-return categories to protect margin and courier capacity.",
      "Separate read-only and write API keys. Rotate secrets after contractor access ends.",
      "Document your fulfillment SLAs on the storefront so customers know when to expect delivery outside Dhaka.",
    ],
    alert: {
      variant: "default",
      title: "Conversion note",
      description:
        "Show payment methods and delivery estimates early on product pages — surprises at checkout are a top abandonment cause.",
    },
  },
  {
    id: "deployment",
    title: "Deployment",
    icon: Rocket,
    summary: "Go live safely with domains, SSL, and staged publish workflows.",
    body: [
      "Connect a custom domain from Store → Domains, then wait for DNS propagation. SSL is provisioned automatically once records validate.",
      "Use draft/publish on pages and theme changes so you can preview before customers see updates.",
      "For API-backed apps, deploy behind HTTPS, configure webhook endpoints that return 2xx quickly, and process heavy work asynchronously.",
    ],
    code: {
      label: "DNS records (example)",
      language: "text",
      content:
        "Type  Host   Value\nA     @      <BornoLand IP from dashboard>\nCNAME www    your-brand.bornoland.com",
    },
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: Wrench,
    summary: "Fix common setup, payment, and API issues before opening a ticket.",
    body: [
      "Payments not appearing: confirm gateway credentials, ensure the method is enabled for your currency, and complete a test order in a staging store when available.",
      "401 API errors: check key scope, store ID header, and whether the key was revoked. Create a fresh key if unsure.",
      "Domain still pending: verify A/CNAME records exactly, wait for TTL expiry, and avoid proxied DNS modes that block certificate issuance.",
      "If problems persist, email support@bornoland.com with store subdomain, timestamps, and screenshots.",
    ],
    alert: {
      variant: "destructive",
      title: "Still stuck?",
      description:
        "Include the request ID from API error responses when contacting support — it shortens investigation time significantly.",
    },
  },
];

const QUICK_LINKS = [
  { label: "Create API key", href: "#authentication" },
  { label: "Products API", href: "#api" },
  { label: "Install SDK", href: "#installation" },
  { label: "Webhooks", href: "#sdk" },
  { label: "Go live checklist", href: "#deployment" },
  { label: "FAQ", href: "/faq" },
];

export function DocsPageContent() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(DOC_SECTIONS[0].id);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DOC_SECTIONS;
    return DOC_SECTIONS.filter((section) => {
      const haystack = [
        section.title,
        section.summary,
        ...section.body,
        section.code?.content ?? "",
        section.alert?.title ?? "",
        section.alert?.description ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  const navSections = query.trim() ? filtered : DOC_SECTIONS;

  return (
    <>
      <SitePageHero
        eyebrow="Documentation"
        title="Build and run stores on BornoLand"
        description="Guides for merchants and developers — authentication, configuration, API reference patterns, SDKs, deployment, and troubleshooting."
        primaryCta={{ label: "Open dashboard", href: "/login" }}
        secondaryCta={{ label: "Browse FAQ", href: "/faq", variant: "outline" }}
        align="left"
      >
        <div className="relative mx-auto max-w-xl sm:mx-0">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search docs…"
            aria-label="Search documentation"
            className="border-border bg-card pl-11 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
          />
        </div>
      </SitePageHero>

      <section className="pb-8 pt-4 sm:pb-12 sm:pt-6">
        <div className={landingContainer}>
          <div className="mb-8 flex flex-wrap gap-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="inline-flex items-center gap-1 rounded-pill border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
              >
                {link.label}
                <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
            ))}
          </div>

          <div className="lg:hidden mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-between rounded-pill"
              onClick={() => setMobileNavOpen((o) => !o)}
              aria-expanded={mobileNavOpen}
              aria-controls="docs-mobile-nav"
            >
              <span className="inline-flex items-center gap-2">
                <Menu className="h-4 w-4" aria-hidden />
                Docs sections
              </span>
              <Badge variant="primary">{navSections.length}</Badge>
            </Button>
            <AnimatePresence>
              {mobileNavOpen ? (
                <motion.nav
                  id="docs-mobile-nav"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 overflow-hidden rounded-apple-xl border border-border bg-card"
                  aria-label="Documentation sections"
                >
                  <ul className="max-h-64 space-y-0.5 overflow-y-auto p-2">
                    {navSections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          onClick={() => {
                            setActiveId(section.id);
                            setMobileNavOpen(false);
                          }}
                          className={cn(
                            "flex items-center gap-2 rounded-apple-md px-3 py-2.5 text-sm font-medium transition",
                            activeId === section.id
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          <section.icon className="h-4 w-4 shrink-0" aria-hidden />
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.nav>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-3">
                <p className="px-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  On this page
                </p>
                <nav aria-label="Documentation sections">
                  <ul className="space-y-0.5">
                    {navSections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          onClick={() => setActiveId(section.id)}
                          className={cn(
                            "flex items-center gap-2 rounded-apple-md px-3 py-2 text-sm font-medium transition",
                            activeId === section.id
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          <section.icon className="h-4 w-4 shrink-0" aria-hidden />
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>

            <div className="min-w-0 space-y-8">
              {filtered.length === 0 ? (
                <Card className="rounded-apple-xl border-border">
                  <CardContent className="p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No documentation matched “{query}”. Try another keyword or clear the search.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filtered.map((section, index) => {
                  const Icon = section.icon;
                  return (
                    <motion.article
                      key={section.id}
                      id={section.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.2) }}
                      className="scroll-mt-28"
                    >
                      <Card className="rounded-apple-xl border-border shadow-sm">
                        <CardHeader className="gap-3 border-b border-border pb-5">
                          <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-apple-md bg-primary/10 text-primary">
                              <Icon className="h-5 w-5" aria-hidden />
                            </span>
                            <div>
                              <CardTitle className="text-xl sm:text-2xl">{section.title}</CardTitle>
                              <p className="mt-1 text-sm text-muted-foreground">{section.summary}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-5 p-6">
                          {section.body.map((paragraph) => (
                            <p
                              key={paragraph.slice(0, 48)}
                              className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]"
                            >
                              {paragraph}
                            </p>
                          ))}

                          {section.code ? (
                            <div>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground">
                                {section.code.label}
                              </p>
                              <Card className="overflow-hidden rounded-apple-lg border-border bg-muted/50">
                                <CardContent className="p-0">
                                  <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground sm:text-[13px]">
                                    <code>{section.code.content}</code>
                                  </pre>
                                </CardContent>
                              </Card>
                            </div>
                          ) : null}

                          {section.alert ? (
                            <Alert variant={section.alert.variant}>
                              <AlertTitle>{section.alert.title}</AlertTitle>
                              <AlertDescription>{section.alert.description}</AlertDescription>
                            </Alert>
                          ) : null}
                        </CardContent>
                      </Card>
                      {index < filtered.length - 1 ? <Separator className="mt-8 lg:hidden" /> : null}
                    </motion.article>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteCtaBanner
        title="Ready to ship your store?"
        description="Create a BornoLand workspace, connect payments, and publish a professional storefront built for Bangladesh ecommerce."
        primaryLabel="Start free"
        primaryHref="/register"
        secondaryLabel="Talk to support"
        secondaryHref="/faq"
      />
    </>
  );
}
