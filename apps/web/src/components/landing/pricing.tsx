"use client";

import Link from "next/link";
import { Check, CircleX, Sparkles } from "lucide-react";
import { useGetPublicPlansQuery } from "@/redux/api/public-plan-api";
import type { Plan } from "@/redux/api/store-api";
import { SectionHeading } from "./section-heading";
import { cn } from "@/lib/utils";
import { useLandingLocale } from "./landing-locale";
import {
  landingContainer,
  landingSectionAlt,
  LandingReveal,
} from "./landing-ui";

function formatPrice(plan: Plan, yearly = false, freeLabel: string, customLabel: string) {
  const amount = yearly
    ? (plan.pricing?.yearly ?? plan.priceYearly ?? 0)
    : (plan.pricing?.monthly ?? plan.priceBDT);
  if (plan.isCustomPrice) return customLabel;
  if (!amount) return freeLabel;
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function Pricing() {
  const { t } = useLandingLocale();
  const p = t.pricing;
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

  const limits = (plan: Plan) =>
    Object.entries(plan.limits ?? {})
      .filter(([key, value]) => p.limitLabels[key] && typeof value === "number" && value > 0)
      .slice(0, 5)
      .map(([key, value]) => `${value}${p.limitLabels[key].suffix ?? ""} ${p.limitLabels[key].label}`);

  const cta = (plan: Plan) => {
    if (plan.isCustomPrice) return { label: p.contactSales, href: "/contact" };
    if (plan.trialDays > 0) return { label: p.startTrial, href: "/register" };
    return { label: p.getStarted, href: "/register" };
  };

  const compareRows = [...new Set(plans.flatMap((plan) => [...enabled(plan), ...limits(plan)]))].slice(
    0,
    10,
  );

  return (
    <section id="pricing" className={landingSectionAlt}>
      <div className={landingContainer}>
        <SectionHeading eyebrow={p.eyebrow} title={p.title} description={p.description} />

        {isLoading ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <PricingSkeleton />
            <PricingSkeleton />
            <PricingSkeleton />
            <PricingSkeleton />
          </div>
        ) : isError ? (
          <LandingReveal className="mx-auto mt-12 max-w-lg">
            <div className="rounded-lg border border-red-100 bg-red-50 p-8 text-center">
              <CircleX className="mx-auto h-8 w-8 text-red-500" aria-hidden />
              <h3 className="mt-3 font-semibold text-apple-ink">{p.unavailableTitle}</h3>
              <p className="mt-1 text-sm text-apple-ink-muted-48">{p.unavailableBody}</p>
            </div>
          </LandingReveal>
        ) : plans.length === 0 ? (
          <LandingReveal className="mx-auto mt-12 max-w-lg">
            <div className="rounded-lg border border-apple-hairline bg-apple-canvas p-9 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-apple-primary" aria-hidden />
              <h3 className="mt-3 text-lg font-semibold text-apple-ink">{p.comingSoonTitle}</h3>
              <p className="mt-1 text-sm text-apple-ink-muted-48">{p.comingSoonBody}</p>
            </div>
          </LandingReveal>
        ) : (
          <>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {plans.map((plan) => {
                const action = cta(plan);
                const planFeatures = enabled(plan);
                const planLimits = limits(plan);
                const price = formatPrice(plan, false, p.free, p.custom);
                const recommended = plan.isRecommended;
                return (
                  <article
                    key={plan._id}
                    className={cn(
                      "relative flex h-full flex-col rounded-lg border bg-apple-canvas p-6 transition-shadow duration-300",
                      recommended
                        ? "z-[1] scale-[1.02] border-apple-primary shadow-[0_20px_60px_-32px_rgba(0,102,204,0.45)] ring-2 ring-apple-primary/15"
                        : "border-apple-hairline hover:shadow-[0_12px_40px_-28px_rgba(0,0,0,0.18)]",
                    )}
                  >
                    <div className="absolute -top-3 left-5 flex gap-2">
                      {recommended ? (
                        <span className="rounded-full bg-apple-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                          {p.recommended}
                        </span>
                      ) : null}
                      {plan.isPopular ? (
                        <span className="rounded-full bg-violet-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                          {p.mostPopular}
                        </span>
                      ) : null}
                    </div>

                    <div className="min-h-[7.5rem]">
                      <h3 className="text-lg font-bold text-apple-ink">{plan.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-apple-ink-muted-48">
                        {plan.description || p.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-bold tabular-nums tracking-tight text-apple-ink">
                        {price}
                      </span>
                      {!plan.isCustomPrice && price !== p.free ? (
                        <span className="text-xs text-apple-ink-muted-48">{p.perMonth}</span>
                      ) : null}
                    </div>

                    {plan.pricing?.yearly || plan.priceYearly ? (
                      <p className="mt-1 text-xs text-apple-ink-muted-48">
                        {p.yearly}: {formatPrice(plan, true, p.free, p.custom)}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-transparent" aria-hidden>
                        &nbsp;
                      </p>
                    )}

                    {plan.trialDays > 0 ? (
                      <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                        {plan.trialDays}
                        {p.trialDays}
                      </p>
                    ) : (
                      <div className="mt-3 h-[2.125rem]" aria-hidden />
                    )}

                    <Link
                      href={action.href}
                      className={cn(
                        "btn-press mt-5 flex h-12 w-full items-center justify-center rounded-xl text-center text-sm font-semibold transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-apple-primary",
                        recommended
                          ? "bg-apple-primary text-apple-on-primary hover:brightness-110"
                          : "border border-apple-hairline bg-apple-canvas text-apple-ink hover:bg-apple-canvas-parchment",
                      )}
                    >
                      {action.label}
                    </Link>

                    <div className="mt-6 flex-1 border-t border-apple-divider-soft pt-5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-apple-ink-muted-48">
                        {p.included}
                      </p>
                      <ul className="mt-3 space-y-2">
                        {planFeatures.map((feature) => (
                          <li key={feature} className="flex gap-2 text-xs leading-relaxed text-apple-ink-muted-80">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-apple-primary" aria-hidden />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {planLimits.length > 0 ? (
                      <div className="mt-5 border-t border-apple-divider-soft pt-5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-apple-ink-muted-48">
                          {p.limits}
                        </p>
                        <ul className="mt-3 space-y-2">
                          {planLimits.map((limit) => (
                            <li key={limit} className="text-xs leading-relaxed text-apple-ink-muted-80">
                              {limit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>

            {plans.length > 1 ? (
              <LandingReveal className="mt-12">
                <div className="overflow-hidden rounded-lg border border-apple-hairline bg-apple-canvas">
                  <div className="border-b border-apple-divider-soft px-6 py-5">
                    <h3 className="font-semibold text-apple-ink">{p.compare}</h3>
                    <p className="mt-1 text-xs text-apple-ink-muted-48">{p.compareHint}</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-xs">
                      <thead className="bg-apple-canvas-parchment">
                        <tr>
                          <th scope="col" className="px-6 py-3 font-semibold text-apple-ink-muted-48">
                            {p.featureOrLimit}
                          </th>
                          {plans.map((plan) => (
                            <th
                              key={plan._id}
                              scope="col"
                              className={cn(
                                "px-4 py-3 font-semibold",
                                plan.isRecommended ? "bg-blue-50 text-blue-700" : "text-apple-ink-muted-48",
                              )}
                            >
                              {plan.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {compareRows.map((feature) => (
                          <tr key={feature} className="border-t border-apple-divider-soft">
                            <th scope="row" className="px-6 py-3 font-medium text-apple-ink">
                              {feature}
                            </th>
                            {plans.map((plan) => {
                              const available =
                                enabled(plan).includes(feature) || limits(plan).includes(feature);
                              return (
                                <td
                                  key={plan._id}
                                  className={cn("px-4 py-3", plan.isRecommended && "bg-blue-50/40")}
                                >
                                  {available ? (
                                    <Check className="h-4 w-4 text-emerald-600" aria-label="Included" />
                                  ) : (
                                    <CircleX className="h-4 w-4 text-zinc-300" aria-label="Not included" />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
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
    <div
      className="flex h-full min-h-[28rem] animate-pulse flex-col rounded-lg border border-apple-hairline bg-apple-canvas p-6"
      aria-hidden
    >
      <div className="h-5 w-24 rounded bg-zinc-200" />
      <div className="mt-4 h-10 w-36 rounded bg-zinc-200" />
      <div className="mt-8 flex-1 space-y-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="h-3 rounded bg-zinc-200" />
        ))}
      </div>
    </div>
  );
}
