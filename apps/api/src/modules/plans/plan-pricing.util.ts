import type { SubscriptionDuration } from "../subscriptions/subscription.constants.js";
import { DURATION_MONTHS } from "../subscriptions/subscription.constants.js";

type PlanPricing = {
  priceBDT?: number;
  priceYearly?: number;
  isCustomPrice?: boolean;
  pricing?: {
    monthly?: number;
    quarterly?: number;
    halfYearly?: number;
    yearly?: number;
    lifetime?: number;
  };
};

export function getPlanPriceForDuration(plan: PlanPricing, duration: SubscriptionDuration): number {
  const pricing = plan.pricing ?? {};
  const monthly = pricing.monthly || plan.priceBDT || 0;

  if (duration === "monthly") return pricing.monthly ?? monthly;
  if (duration === "quarterly") return pricing.quarterly || monthly * 3;
  if (duration === "half_yearly") return pricing.halfYearly || monthly * 6;
  if (duration === "yearly") return pricing.yearly || plan.priceYearly || monthly * 12;
  if (duration === "lifetime") return pricing.lifetime || 0;

  return monthly;
}

export function calculateSubscriptionExpireDate(
  startDate: Date,
  duration: SubscriptionDuration
): Date | null {
  const months = DURATION_MONTHS[duration];
  if (months === null) return null;

  const expire = new Date(startDate);
  expire.setMonth(expire.getMonth() + months);
  return expire;
}

export function getRemainingDays(expireDate?: Date | string | null): number | null {
  if (!expireDate) return null;
  const diff = new Date(expireDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
