export const SUBSCRIPTION_DURATIONS = [
  "monthly",
  "quarterly",
  "half_yearly",
  "yearly",
  "lifetime",
] as const;

export type SubscriptionDuration = (typeof SUBSCRIPTION_DURATIONS)[number];

export const DURATION_MONTHS: Record<SubscriptionDuration, number | null> = {
  monthly: 1,
  quarterly: 3,
  half_yearly: 6,
  yearly: 12,
  lifetime: null,
};

export const DURATION_LABELS: Record<SubscriptionDuration, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  half_yearly: "Half Yearly",
  yearly: "Yearly",
  lifetime: "Lifetime",
};

export const STORE_SUBSCRIPTION_STATUSES = [
  "trial",
  "pending_payment",
  "pending_approval",
  "active",
  "expired",
  "suspended",
  "cancelled",
] as const;

export type StoreSubscriptionStatus = (typeof STORE_SUBSCRIPTION_STATUSES)[number];

export const BILLING_NOTIFICATION_TYPES = [
  "trial_started",
  "trial_ending",
  "trial_expired",
  "payment_submitted",
  "payment_approved",
  "payment_rejected",
  "subscription_expiring",
  "subscription_expired",
] as const;

export type BillingNotificationType = (typeof BILLING_NOTIFICATION_TYPES)[number];
