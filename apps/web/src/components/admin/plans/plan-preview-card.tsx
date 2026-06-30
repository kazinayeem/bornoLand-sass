"use client";

import { Check, Star } from "lucide-react";
import type { Plan } from "@/redux/api/store-api";
import { formatCurrency } from "@/lib/format-currency";

export function PlanPreviewCard({
  plan,
  form,
}: {
  plan: Plan;
  form: {
    name: string;
    description: string;
    priceBDT: number;
    pricing: { monthly: number; yearly: number; quarterly: number; halfYearly: number; lifetime: number };
    features: string;
    trialDays: number;
    isRecommended: boolean;
    isActive: boolean;
    visible: boolean;
    limits: Plan["limits"];
  };
}) {
  const bullets = form.features
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  const monthly = form.pricing.monthly || form.priceBDT;
  const yearly = form.pricing.yearly;

  return (
    <div className="mx-auto max-w-sm">
      <div
        className={`overflow-hidden rounded-2xl border bg-white shadow-xl ${
          form.isRecommended ? "border-blue-300 ring-2 ring-blue-500/20" : "border-zinc-200"
        }`}
      >
        {form.isRecommended && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-center text-xs font-semibold text-white">
            <Star className="mr-1 inline h-3 w-3" />
            Most Popular
          </div>
        )}
        <div className="p-6">
          <h3 className="text-xl font-bold text-zinc-900">{form.name || plan.name}</h3>
          {form.description && <p className="mt-1 text-sm text-zinc-500">{form.description}</p>}

          <div className="mt-5">
            <span className="text-4xl font-bold text-zinc-900">
              {formatCurrency(monthly, { currencySymbol: "৳", currencyPosition: "before", decimalPlaces: 0 })}
            </span>
            <span className="text-sm text-zinc-500">/mo</span>
          </div>
          {yearly > 0 && (
            <p className="mt-1 text-xs text-zinc-500">
              or {formatCurrency(yearly, { currencySymbol: "৳", currencyPosition: "before", decimalPlaces: 0 })}/yr
            </p>
          )}
          {form.trialDays > 0 && (
            <p className="mt-2 text-xs font-medium text-emerald-600">{form.trialDays}-day free trial</p>
          )}

          <ul className="mt-6 space-y-2">
            {(bullets.length > 0 ? bullets : plan.features).slice(0, 8).map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-zinc-600">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                {feature}
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="mt-6 w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white"
          >
            {form.isActive ? "Get started" : "Unavailable"}
          </button>

          {!form.visible && (
            <p className="mt-2 text-center text-[10px] uppercase tracking-wide text-amber-600">Hidden from pricing</p>
          )}
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-zinc-400">Live preview — exactly how merchants see this plan</p>
    </div>
  );
}
