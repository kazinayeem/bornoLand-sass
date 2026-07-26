"use client";

import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Compass,
  Eye,
  Handshake,
  Heart,
  Layers,
  Lightbulb,
  MessageCircle,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { SitePageHero } from "@/components/site/site-page-hero";
import { SiteSection } from "@/components/site/site-section";
import { SiteCtaBanner } from "@/components/site/site-cta-banner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { LandingReveal } from "@/components/landing/landing-ui";
import { cn } from "@/lib/utils";

const values = [
  {
    icon: ShieldCheck,
    title: "Merchant-first trust",
    description:
      "Every product decision starts with store owners — reliability, clarity, and fair pricing before flashy features.",
  },
  {
    icon: Zap,
    title: "Speed to launch",
    description:
      "We remove friction so you can go from idea to live storefront in hours, not weeks of custom development.",
  },
  {
    icon: Lightbulb,
    title: "Practical innovation",
    description:
      "We ship tools that move revenue — inventory, checkout, pages, and analytics — not experiments that slow you down.",
  },
  {
    icon: Handshake,
    title: "Transparent partnership",
    description:
      "Clear plans, honest roadmaps, and support that treats your store like a business, not a ticket number.",
  },
  {
    icon: Heart,
    title: "Local market focus",
    description:
      "Built for Bangladesh commerce realities — payments, delivery workflows, and mobile-first shoppers.",
  },
  {
    icon: Layers,
    title: "Scalable craft",
    description:
      "Start lean, then grow into multi-page stores, catalogs, and operations without rebuilding from scratch.",
  },
];

const milestones = [
  {
    year: "2022",
    title: "Foundation",
    description:
      "BornoLand began with a simple goal: make professional ecommerce accessible for local merchants without agency budgets.",
  },
  {
    year: "2023",
    title: "First storefronts live",
    description:
      "Early partners launched production stores — validating themes, checkout flows, and day-to-day order management.",
  },
  {
    year: "2024",
    title: "Platform expansion",
    description:
      "We added visual page building, richer catalog tools, and dashboard workflows designed for busy store teams.",
  },
  {
    year: "2025",
    title: "Growth & polish",
    description:
      "Performance, mobile experience, and merchant success programs became core pillars as adoption accelerated.",
  },
  {
    year: "2026",
    title: "SaaS at scale",
    description:
      "Today BornoLand helps merchants launch, operate, and grow modern online stores with a unified SaaS platform.",
  },
];

const whyChoose = [
  {
    icon: Rocket,
    title: "Launch-ready storefronts",
    description:
      "Templates, product pages, and checkout patterns that look premium out of the box — then customize as you grow.",
  },
  {
    icon: Target,
    title: "Operations that stay simple",
    description:
      "Orders, inventory, and store settings live in one dashboard so your team spends time selling, not hunting tools.",
  },
  {
    icon: Sparkles,
    title: "Design without the agency bill",
    description:
      "Build marketing and content pages visually — keep brand consistency without hiring a full development team.",
  },
  {
    icon: Users,
    title: "Support that understands retail",
    description:
      "From onboarding to peak-season questions, our team speaks merchant language and focuses on outcomes.",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Create your account",
    description:
      "Sign up, set your store basics, and choose a starting plan that matches where you are today.",
  },
  {
    step: "02",
    title: "Build your store",
    description:
      "Add products, configure pages, and refine branding with tools designed for non-technical teams.",
  },
  {
    step: "03",
    title: "Go live & sell",
    description:
      "Publish your storefront, accept orders, and manage fulfillment from a clear merchant dashboard.",
  },
  {
    step: "04",
    title: "Optimize & scale",
    description:
      "Use insights, page updates, and catalog growth to improve conversion as traffic and demand rise.",
  },
];

const stats = [
  { value: "2,500+", label: "Stores launched" },
  { value: "98%", label: "Uptime focus" },
  { value: "24h", label: "Typical support reply" },
  { value: "4.9★", label: "Merchant satisfaction" },
];

const team = [
  {
    name: "Nusrat Rahman",
    role: "CEO & Co-founder",
    initials: "NR",
    bio: "Former retail operator focused on making ecommerce infrastructure approachable for growing brands.",
  },
  {
    name: "Arif Hasan",
    role: "CTO",
    initials: "AH",
    bio: "Platform architect who cares about reliability, speed, and clean merchant-facing product experiences.",
  },
  {
    name: "Farzana Akter",
    role: "Head of Product",
    initials: "FA",
    bio: "Turns store-owner feedback into roadmap priorities across storefront, builder, and dashboard workflows.",
  },
  {
    name: "Imran Chowdhury",
    role: "Customer Success Lead",
    initials: "IC",
    bio: "Helps merchants onboard smoothly and grow with playbooks that map to real ecommerce operations.",
  },
];

const technologies = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Redis",
  "Cloud CDN",
  "Mobile-first UI",
  "Secure auth",
  "API-ready architecture",
  "Analytics",
  "Payment integrations",
];

const successPoints = [
  "Faster time-to-first-sale with guided store setup",
  "Fewer tools to juggle — storefront, pages, and ops in one place",
  "Design flexibility without sacrificing performance",
  "Support and documentation oriented to merchant outcomes",
];

const testimonials = [
  {
    quote:
      "We replaced a fragile custom site with BornoLand and launched a cleaner store in days. Orders and inventory finally live in one place.",
    name: "Sadia Khan",
    role: "Founder, Aura Home",
    initials: "SK",
  },
  {
    quote:
      "The page builder let our marketing team ship campaigns without waiting on developers. Conversion improved because updates were faster.",
    name: "Rafiul Islam",
    role: "Growth Lead, Metro Wear",
    initials: "RI",
  },
  {
    quote:
      "Support actually understands ecommerce. When we scaled catalog size, the platform stayed stable and the dashboard stayed usable.",
    name: "Mehnaz Karim",
    role: "Operations Manager, Daily Mart BD",
    initials: "MK",
  },
];

const faqPreview = [
  {
    q: "Who is BornoLand built for?",
    a: "Growing merchants, startups, and retail teams who want a modern online store without building and maintaining a custom platform.",
  },
  {
    q: "How long does it take to launch?",
    a: "Most teams can publish a polished first storefront within a day once products and branding are ready — many go live even faster.",
  },
  {
    q: "Can I customize pages and branding?",
    a: "Yes. Use the visual builder and store settings to shape layouts, content, and brand presentation while keeping a consistent shopping experience.",
  },
];

export function AboutPageContent() {
  return (
    <>
      <SitePageHero
        eyebrow="Company"
        title="We build the store platform merchants actually want to run"
        description="BornoLand is an ecommerce SaaS platform that helps brands launch beautiful storefronts, manage operations confidently, and grow without the cost and complexity of custom development."
        primaryCta={{ label: "Start free", href: "/register" }}
        secondaryCta={{ label: "Talk to us", href: "/contact" }}
      />

      <SiteSection
        id="story"
        eyebrow="Our story"
        title="Born from the gap between ambition and infrastructure"
        description="Too many merchants had great products — and outdated, expensive, or fragile tools standing in the way. BornoLand exists to close that gap."
        align="left"
      >
        <LandingReveal>
          <Card className="rounded-apple-xl border-border bg-card shadow-sm">
            <CardContent className="space-y-4 p-6 text-base leading-relaxed text-muted-foreground sm:p-8 sm:text-lg">
              <p>
                We started BornoLand after watching store owners stitch together
                themes, plugins, spreadsheets, and one-off developer work just to
                sell online. The result was slow launches, inconsistent branding,
                and operations that broke under growth.
              </p>
              <p>
                Our answer is a unified SaaS platform: professional storefronts,
                practical page building, and a merchant dashboard designed for
                real retail workflows. We obsess over clarity, mobile performance,
                and the moments that matter — from first product upload to peak
                season order volume.
              </p>
              <p>
                Today we partner with merchants who want to look premium, move
                fast, and stay in control of their business. The mission is
                simple — make serious ecommerce accessible.
              </p>
            </CardContent>
          </Card>
        </LandingReveal>
      </SiteSection>

      <SiteSection
        id="mission"
        eyebrow="Purpose"
        title="Mission & vision"
        description="What we optimize for every day — and where we are taking the platform next."
        alt
      >
        <div className="grid gap-5 md:grid-cols-2">
          <LandingReveal>
            <Card className="h-full rounded-apple-xl border-border bg-card shadow-sm">
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Compass className="h-5 w-5" aria-hidden />
                </div>
                <CardTitle className="text-xl">Mission</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Empower merchants to launch and operate high-quality online
                  stores with software that is fast to adopt, reliable at scale,
                  and honest about what growing a business requires.
                </CardDescription>
              </CardHeader>
            </Card>
          </LandingReveal>
          <LandingReveal delay={0.06}>
            <Card className="h-full rounded-apple-xl border-border bg-card shadow-sm">
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Eye className="h-5 w-5" aria-hidden />
                </div>
                <CardTitle className="text-xl">Vision</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Become the default ecommerce operating system for ambitious
                  brands in Bangladesh and beyond — where storefront, content,
                  and commerce operations feel like one product.
                </CardDescription>
              </CardHeader>
            </Card>
          </LandingReveal>
        </div>
      </SiteSection>

      <SiteSection
        id="values"
        eyebrow="Culture"
        title="Core values"
        description="Principles that guide product, support, and how we show up for merchants."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((item, index) => (
            <LandingReveal key={item.title} delay={index * 0.04}>
              <Card className="group h-full rounded-apple-xl border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md motion-reduce:hover:translate-y-0">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </LandingReveal>
          ))}
        </div>
      </SiteSection>

      <SiteSection
        id="timeline"
        eyebrow="Journey"
        title="Milestones along the way"
        description="A short look at how BornoLand evolved from an idea into a production SaaS platform."
        alt
        align="left"
      >
        <ol className="relative space-y-0 border-l border-border pl-6 sm:pl-8">
          {milestones.map((item, index) => (
            <LandingReveal key={item.year} delay={index * 0.05}>
              <li className="relative pb-10 last:pb-0">
                <span
                  className="absolute -left-[1.9rem] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-card sm:-left-[2.15rem]"
                  aria-hidden
                >
                  <span className="h-2 w-2 rounded-full bg-primary" />
                </span>
                <Badge variant="primary" className="mb-2 rounded-pill">
                  {item.year}
                </Badge>
                <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {item.description}
                </p>
              </li>
            </LandingReveal>
          ))}
        </ol>
      </SiteSection>

      <SiteSection
        id="why-us"
        eyebrow="Difference"
        title="Why choose BornoLand"
        description="We combine storefront quality, operational clarity, and merchant support in one SaaS product."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {whyChoose.map((item, index) => (
            <LandingReveal key={item.title} delay={index * 0.04}>
              <Card className="h-full rounded-apple-xl border-border bg-card shadow-sm">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription className="mt-1.5 text-sm leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </LandingReveal>
          ))}
        </div>
      </SiteSection>

      <SiteSection
        id="process"
        eyebrow="How it works"
        title="Our process"
        description="A clear path from signup to a live, growing store — without a long implementation project."
        alt
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((item, index) => (
            <LandingReveal key={item.step} delay={index * 0.05}>
              <Card className="h-full rounded-apple-xl border-border bg-card shadow-sm">
                <CardHeader>
                  <span className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    Step {item.step}
                  </span>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </LandingReveal>
          ))}
        </div>
      </SiteSection>

      <SiteSection id="stats" eyebrow="Impact" title="By the numbers">
        <LandingReveal>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {stats.map((stat) => (
              <Card
                key={stat.label}
                className="rounded-apple-xl border-border bg-card text-center shadow-sm"
              >
                <CardContent className="px-4 py-6 sm:py-8">
                  <p className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs font-medium text-muted-foreground sm:text-sm">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </LandingReveal>
      </SiteSection>

      <SiteSection
        id="team"
        eyebrow="People"
        title="Meet the team"
        description="A focused group of product, engineering, and customer success leaders dedicated to merchant outcomes."
        alt
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, index) => (
            <LandingReveal key={member.name} delay={index * 0.04}>
              <Card className="h-full rounded-apple-xl border-border bg-card shadow-sm">
                <CardHeader className="items-center text-center">
                  <Avatar className="mb-3 h-16 w-16 border-border">
                    <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-base">{member.name}</CardTitle>
                  <Badge variant="outline" className="mx-auto mt-1 rounded-pill">
                    {member.role}
                  </Badge>
                  <CardDescription className="mt-3 text-sm leading-relaxed">
                    {member.bio}
                  </CardDescription>
                </CardHeader>
              </Card>
            </LandingReveal>
          ))}
        </div>
      </SiteSection>

      <SiteSection
        id="technology"
        eyebrow="Stack"
        title="Technologies we use"
        description="Modern, proven building blocks chosen for performance, security, and long-term maintainability."
      >
        <LandingReveal>
          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
            {technologies.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="rounded-pill border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </LandingReveal>
      </SiteSection>

      <SiteSection
        id="success"
        eyebrow="Outcomes"
        title="Customer success"
        description="We measure success by merchant results — faster launches, cleaner operations, and stores that keep converting."
        alt
        align="left"
      >
        <LandingReveal>
          <Card className="rounded-apple-xl border-border bg-card shadow-sm">
            <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Award className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Partnership beyond signup
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Onboarding guidance, responsive support, and product improvements
                  informed by real store workflows — so your team is never left
                  guessing how to grow on the platform.
                </p>
              </div>
              <ul className="space-y-3">
                {successPoints.map((point) => (
                  <li key={point} className="flex gap-3 text-sm text-foreground">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-success"
                      aria-hidden
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </LandingReveal>
      </SiteSection>

      <SiteSection
        id="testimonials"
        eyebrow="Social proof"
        title="What merchants say"
        description="Feedback from teams who switched to BornoLand for storefront quality and day-to-day operations."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <LandingReveal key={item.name} delay={index * 0.05}>
              <Card className="flex h-full flex-col rounded-apple-xl border-border bg-card shadow-sm">
                <CardContent className="flex flex-1 flex-col p-6">
                  <MessageCircle
                    className="mb-4 h-5 w-5 text-primary"
                    aria-hidden
                  />
                  <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    “{item.quote}”
                  </blockquote>
                  <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
                        {item.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </LandingReveal>
          ))}
        </div>
      </SiteSection>

      <SiteSection
        id="faq-preview"
        eyebrow="FAQ"
        title="Quick answers"
        description="A few common questions — explore the full FAQ for pricing, features, and account help."
        alt
      >
        <LandingReveal>
          <Card className="mx-auto max-w-3xl rounded-apple-xl border-border bg-card shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <Accordion type="single" collapsible className="w-full">
                {faqPreview.map((item, index) => (
                  <AccordionItem key={item.q} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-primary hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div className="mt-6 text-center">
                <Link
                  href="/faq"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "rounded-pill font-semibold",
                  )}
                >
                  View all FAQs
                </Link>
              </div>
            </CardContent>
          </Card>
        </LandingReveal>
      </SiteSection>

      <SiteCtaBanner
        title="Ready to build your next store?"
        description="Create your BornoLand account and launch a professional ecommerce experience — or talk with our team about the right plan for your brand."
        primaryLabel="Get started"
        primaryHref="/register"
        secondaryLabel="Contact sales"
        secondaryHref="/contact"
      />
    </>
  );
}
