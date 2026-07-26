"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CircleX, Sparkles, ArrowRight } from "lucide-react";
import { useGetPublicPlansQuery } from "@/redux/api/public-plan-api";
import type { Plan } from "@/redux/api/store-api";
import { SectionHeading } from "./section-heading";
import { cn } from "@/lib/utils";
import { useLandingLocale } from "./landing-locale";
import {
  landingContainer,
  landingGridPricing,
  landingSectionAlt,
  LandingReveal,
} from "./landing-ui";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BillingCycle = "monthly" | "sixMonths" | "yearly";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPrice(plan: Plan, yearly = false, freeLabel: string, customLabel: string) {
  const amount = yearly
    ? (plan.pricing?.yearly ?? plan.priceYearly ?? 0)
    : (plan.pricing?.monthly ?? plan.priceBDT);
  if (plan.isCustomPrice) return customLabel;
  if (!amount) return freeLabel;
  return formatCurrency(amount);
}

/**
 * UI-only display helper.
 * Monthly = API monthly. 6 Months = 10% off effective monthly. Yearly = API yearly/12 or 25% off.
 */
function displayPrice(
  plan: Plan,
  cycle: BillingCycle,
  freeLabel: string,
  customLabel: string,
) {
  if (plan.isCustomPrice) return customLabel;
  const monthly = plan.pricing?.monthly ?? plan.priceBDT ?? 0;
  if (!monthly && cycle !== "yearly") return freeLabel;

  if (cycle === "sixMonths") {
    if (!monthly) return freeLabel;
    return formatCurrency(Math.round(monthly * 0.9));
  }

  if (cycle === "yearly") {
    const yearly = plan.pricing?.yearly ?? plan.priceYearly ?? 0;
    if (yearly > 0) return formatCurrency(Math.round(yearly / 12));
    if (!monthly) return freeLabel;
    return formatCurrency(Math.round(monthly * 0.75));
  }

  return formatPrice(plan, false, freeLabel, customLabel);
}

export function Pricing() {
  const { t } = useLandingLocale();
  const p = t.pricing;
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const { data, isLoading, isError } = useGetPublicPlansQuery(undefined, {
    pollingInterval: 60_000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const plans = (data?.data?.plans ?? []).slice(0, 4);

  const enabled = (plan: Plan) => {
    const toggles = Object.entries(plan.featureToggles ?? {})
      .filter(([, value]) => value)
      .map(([key]) => p.labels[key] ?? key);
    return [...new Set([...(plan.features ?? []).filter(Boolean), ...toggles])].slice(0, 8);
  };

  const cta = (plan: Plan) => {
    if (plan.isCustomPrice) return { label: p.contactSales, href: "/contact" };
    if (plan.trialDays > 0) return { label: p.startTrial, href: "/register" };
    return { label: p.getStarted, href: "/register" };
  };

  const featureRows = [...new Set(plans.flatMap((plan) => enabled(plan)))].slice(0, 8);
  const highlightId =
    plans.find((item) => item.isPopular)?._id ??
    plans.find((item) => item.isRecommended)?._id;
  const periodLabel = p.perMonth;

  return (
    <section
      id="pricing"
      className={cn(
        landingSectionAlt,
        "bg-gradient-to-b from-primary/5 via-background to-muted/30",
      )}
    >
      <div className={landingContainer}>
        <SectionHeading
          title={p.title}
          description={p.description}
        />

        {/* Billing cycle toggle — Monthly / 6 Months / Yearly */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10">
          <Tabs
            value={cycle}
            onValueChange={(value) => setCycle(value as BillingCycle)}
          >
            <TabsList
              className="h-auto min-h-12 flex-wrap justify-center gap-1 rounded-pill border border-border bg-card p-1.5 shadow-md"
              aria-label="Billing period"
            >
              <TabsTrigger
                value="monthly"
                className="rounded-pill px-4 py-2.5 text-sm font-semibold text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm sm:px-5"
              >
                Monthly
              </TabsTrigger>
              <TabsTrigger
                value="sixMonths"
                className="gap-2 rounded-pill px-4 py-2.5 text-sm font-semibold text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm sm:px-5"
              >
                <span>6 Months</span>
                <Badge
                  className={cn(
                    "rounded-pill px-2 py-0 text-[10px] font-bold uppercase tracking-wide ring-0",
                    cycle === "sixMonths"
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  Save 10%
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="yearly"
                className="gap-2 rounded-pill px-4 py-2.5 text-sm font-semibold text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm sm:px-5"
              >
                <span>{p.yearly}</span>
                <Badge
                  className={cn(
                    "rounded-pill px-2 py-0 text-[10px] font-bold uppercase tracking-wide ring-0",
                    cycle === "yearly"
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  Save 25%
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <p className="text-xs text-muted-foreground">
            {cycle === "yearly"
              ? "Prices shown as effective monthly · billed yearly"
              : cycle === "sixMonths"
                ? "Prices shown as effective monthly · billed every 6 months"
                : "Billed monthly · cancel anytime"}
          </p>
        </div>

        {isLoading ? (
          <div className={`mt-10 sm:mt-12 ${landingGridPricing}`}>
            <PricingSkeleton />
            <PricingSkeleton />
            <PricingSkeleton />
            <PricingSkeleton />
          </div>
        ) : isError ? (
          <LandingReveal className="mx-auto mt-12 max-w-lg">
            <Card className="rounded-apple-xl border-destructive/30 bg-destructive/5 p-8 text-center">
              <CircleX className="mx-auto h-8 w-8 text-destructive" aria-hidden />
              <h3 className="mt-3 font-semibold text-foreground">{p.unavailableTitle}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{p.unavailableBody}</p>
            </Card>
          </LandingReveal>
        ) : plans.length === 0 ? (
          <LandingReveal className="mx-auto mt-12 max-w-lg">
            <Card className="rounded-apple-xl border-border bg-card p-9 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-primary" aria-hidden />
              <h3 className="mt-3 text-lg font-semibold text-foreground">{p.comingSoonTitle}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{p.comingSoonBody}</p>
            </Card>
          </LandingReveal>
        ) : (
          <>
            <div className={`mt-12 items-stretch pt-2 sm:mt-14 ${landingGridPricing}`}>
              {plans.map((plan) => {
                const action = cta(plan);
                const planFeatures = enabled(plan).slice(0, 6);
                const price = displayPrice(plan, cycle, p.free, p.custom);
                const highlighted = plan._id === highlightId;

                return (
                  <Card
                    key={plan._id}
                    className={cn(
                      "group relative flex h-full min-w-0 flex-col rounded-3xl border p-6 transition-all duration-300 sm:p-8",
                      highlighted
                        ? "z-[1] border-primary bg-primary text-primary-foreground shadow-2xl shadow-primary/30 ring-1 ring-primary md:-translate-y-2"
                        : "border-border/70 bg-card shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-[0_20px_40px_-16px_rgba(15,23,42,0.18)]",
                    )}
                  >
                    {highlighted ? (
                      <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
                        <Badge className="whitespace-nowrap rounded-pill bg-card px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-md ring-0">
                          {plan.isPopular ? p.mostPopular : p.recommended}
                        </Badge>
                      </div>
                    ) : null}

                    <CardHeader className="space-y-2 p-0 pt-1">
                      <CardTitle
                        className={cn(
                          "text-xl font-bold tracking-tight sm:text-2xl",
                          highlighted ? "text-primary-foreground" : "text-foreground",
                        )}
                      >
                        {plan.name}
                      </CardTitle>
                      <CardDescription
                        className={cn(
                          "line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed",
                          highlighted
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.description?.trim() ||
                          (plan.isCustomPrice
                            ? "For teams that need custom scale and support."
                            : "Everything you need to launch and grow.")}
                      </CardDescription>
                    </CardHeader>

                    <div className="mt-6 flex items-end gap-1.5">
                      <span
                        className={cn(
                          "text-4xl font-extrabold tabular-nums tracking-tight sm:text-[2.75rem]",
                          highlighted ? "text-primary-foreground" : "text-foreground",
                        )}
                      >
                        {price}
                      </span>
                      {!plan.isCustomPrice ? (
                        <span
                          className={cn(
                            "mb-1.5 text-sm font-medium",
                            highlighted
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {periodLabel}
                        </span>
                      ) : null}
                    </div>

                    {plan.trialDays > 0 ? (
                      <p
                        className={cn(
                          "mt-2 text-xs font-medium",
                          highlighted
                            ? "text-primary-foreground/75"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.trialDays}
                        {p.trialDays}
                      </p>
                    ) : (
                      <div className="mt-2 h-4" aria-hidden />
                    )}

                    <CardFooter className="mt-6 p-0">
                      <Link
                        href={action.href}
                        className={cn(
                          buttonVariants({
                            variant: highlighted ? "secondary" : "default",
                            size: "lg",
                          }),
                          "w-full rounded-pill text-center font-semibold shadow-md",
                          highlighted
                            ? "border-0 bg-card !text-primary hover:bg-card/95 hover:!text-primary"
                            : "!text-primary-foreground hover:!text-primary-foreground",
                        )}
                      >
                        {action.label}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </CardFooter>

                    <CardContent className="mt-7 flex flex-1 flex-col p-0">
                      <ul className="space-y-3.5">
                        {planFeatures.map((feature) => (
                          <li
                            key={feature}
                            className={cn(
                              "flex items-start gap-3 text-sm leading-snug",
                              highlighted
                                ? "text-primary-foreground/95"
                                : "text-foreground/90",
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                                highlighted
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-primary/10 text-primary",
                              )}
                              aria-hidden
                            >
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                            <span className="font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {plans.length > 1 ? (
              <LandingReveal className="mt-10 sm:mt-12">
                <Card className="overflow-hidden rounded-apple-xl border-border bg-card">
                  <CardHeader className="border-b border-border px-6 py-5">
                    <CardTitle className="text-base font-bold text-foreground">
                      {p.compare}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {p.compareHint}
                    </CardDescription>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <Table className="w-full min-w-[640px]">
                      <TableHeader className="sticky top-0 z-[1] bg-muted/80 backdrop-blur-sm">
                        <TableRow>
                          <TableHead className="sticky left-0 z-[2] bg-muted/80 px-6 font-semibold">
                            {p.featureOrLimit}
                          </TableHead>
                          {plans.map((plan) => {
                            const highlighted = plan._id === highlightId;
                            return (
                              <TableHead
                                key={plan._id}
                                className={cn(
                                  "whitespace-nowrap px-4 py-3 font-semibold",
                                  highlighted
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground",
                                )}
                              >
                                <div className="flex flex-col gap-0.5">
                                  <span>{plan.name}</span>
                                  <span className="text-[11px] font-medium tabular-nums opacity-80">
                                    {displayPrice(plan, cycle, p.free, p.custom)}
                                  </span>
                                </div>
                              </TableHead>
                            );
                          })}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {featureRows.map((feature) => (
                          <TableRow key={feature}>
                            <TableCell className="sticky left-0 z-[1] bg-card px-6 font-medium text-foreground">
                              {feature}
                            </TableCell>
                            {plans.map((plan) => {
                              const available = enabled(plan).includes(feature);
                              const highlighted = plan._id === highlightId;
                              return (
                                <TableCell
                                  key={plan._id}
                                  className={cn("px-4 py-3", highlighted && "bg-primary/5")}
                                >
                                  {available ? (
                                    <Check
                                      className="h-4 w-4 text-success"
                                      aria-label="Included"
                                    />
                                  ) : (
                                    <CircleX
                                      className="h-4 w-4 text-muted-foreground/30"
                                      aria-label="Not included"
                                    />
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </LandingReveal>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

function PricingSkeleton() {
  return (
    <Card className="flex h-full min-h-[28rem] flex-col space-y-4 rounded-apple-xl border-border bg-card p-6">
      <Skeleton className="h-5 w-24 rounded-full" />
      <Skeleton className="h-10 w-36 rounded-lg" />
      <div className="space-y-3 pt-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <Skeleton key={item} className="h-4 w-full rounded-md" />
        ))}
      </div>
    </Card>
  );
}
