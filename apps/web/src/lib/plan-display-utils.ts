import type { Plan } from "@/redux/api/store-api";

/**
 * Resolves a plan's feature bullet list directly from its database configuration.
 * Prioritizes explicit feature bullet strings configured in the database/Plan Builder,
 * or intelligently derives key capability bullets from limits & feature toggles.
 */
export function resolvePlanFeatures(plan: Plan): string[] {
  // If the database has explicit feature bullets, use them (cleaned up)
  if (plan.features && plan.features.length > 0) {
    const customBullets = plan.features
      .map((f) => (typeof f === "string" ? f.trim() : ""))
      .filter(Boolean);

    if (customBullets.length > 0) {
      return customBullets;
    }
  }

  // Otherwise, derive directly from limits & feature toggles
  const bullets: string[] = [];

  // 1. Staff limit
  if (plan.limits?.staff !== undefined) {
    if (plan.limits.staff === 0 || plan.limits.staff >= 999) {
      bullets.push("Unlimited Staff Accounts");
    } else if (plan.limits.staff === 1) {
      bullets.push("1 Staff Account");
    } else {
      bullets.push(`Up to ${plan.limits.staff} Team Accounts`);
    }
  }

  // 2. Custom Domain
  if (plan.customDomain || plan.featureToggles?.customDomain || (plan.limits?.customDomains && plan.limits.customDomains > 0)) {
    bullets.push("Custom Storefront Domain & SSL");
  } else {
    bullets.push("Platform Branded Subdomain");
  }

  // 3. Products & Orders
  if (plan.limits?.products !== undefined) {
    if (plan.limits.products === 0 || plan.limits.products >= 99999) {
      bullets.push("Unlimited Products Catalog");
    } else {
      bullets.push(`Up to ${plan.limits.products.toLocaleString()} Products`);
    }
  }

  // 4. POS Terminal
  if (plan.featureToggles?.pos) {
    if (plan.limits?.posDevices && plan.limits.posDevices > 1) {
      bullets.push(`Cloud POS Registers (${plan.limits.posDevices} Terminals)`);
    } else {
      bullets.push("Cloud POS Terminal & Offline Sync");
    }
  }

  // 5. Inventory & Warehouses
  if (plan.featureToggles?.inventory || plan.featureToggles?.warehousesEnabled) {
    if (plan.limits?.warehouses && plan.limits.warehouses > 1) {
      bullets.push(`Multi-Warehouse Transfers (${plan.limits.warehouses} Hubs)`);
    } else {
      bullets.push("Real-Time Inventory Management");
    }
  }

  // 6. HRM & Payroll
  if (plan.featureToggles?.hrm || plan.featureToggles?.hrmPayroll) {
    bullets.push("Full HRM & Automated Payroll");
  }

  // 7. Finance & Accounting
  if (plan.featureToggles?.accounting || plan.featureToggles?.erpFinance) {
    bullets.push("Double-Entry Accounting & P&L");
  }

  // 8. Courier Logistics
  if (plan.featureToggles?.courier || plan.courierAccess?.enabled) {
    bullets.push("Courier Dispatch API (Pathao/Steadfast)");
  }

  // 9. Priority Support
  if (plan.prioritySupport || plan.isPopular) {
    bullets.push("Priority Support & Fast Response");
  }

  // Fallback safety
  if (bullets.length === 0) {
    bullets.push("Branded Storefront & Catalog");
    bullets.push("bKash / Nagad Local Gateways");
    bullets.push("Real-Time Order Management");
  }

  return bullets;
}

/**
 * Resolves pricing display values for monthly and annual billing.
 */
export function resolvePlanPricing(plan: Plan, isYearly: boolean) {
  const isCustom = Boolean(
    plan.isCustomPrice ||
    (plan.priceBDT === 0 && plan.slug !== "free" && !plan.pricing?.monthly)
  );

  if (isCustom) {
    return {
      isCustom: true,
      priceDisplay: "Custom",
      suffix: "Tailored deployment",
      annualTotalNote: undefined,
    };
  }

  const baseMonthly = plan.pricing?.monthly || plan.priceBDT || 0;

  if (isYearly) {
    let monthlyRate: number;
    let annualTotal: number;

    if (plan.pricing?.yearly && plan.pricing.yearly > 0) {
      annualTotal = plan.pricing.yearly;
      monthlyRate = Math.round(plan.pricing.yearly / 12);
    } else if (plan.priceYearly && plan.priceYearly > 0) {
      annualTotal = plan.priceYearly;
      monthlyRate = Math.round(plan.priceYearly / 12);
    } else {
      annualTotal = Math.round(baseMonthly * 12 * 0.8);
      monthlyRate = Math.round(baseMonthly * 0.8);
    }

    return {
      isCustom: false,
      priceDisplay: `৳ ${monthlyRate.toLocaleString()}`,
      suffix: " / month",
      annualTotalNote: `Billed annually (৳ ${annualTotal.toLocaleString()}/yr)`,
    };
  }

  return {
    isCustom: false,
    priceDisplay: `৳ ${baseMonthly.toLocaleString()}`,
    suffix: " / month",
    annualTotalNote: undefined,
  };
}

/**
 * Resolves CTA button text and destination URL for a plan.
 */
export function resolvePlanCta(plan: Plan) {
  const isCustom = Boolean(
    plan.isCustomPrice ||
    (plan.priceBDT === 0 && plan.slug !== "free" && !plan.pricing?.monthly)
  );

  if (isCustom) {
    return {
      label: "Talk to Sales",
      href: "/contact",
    };
  }

  if (plan.trialDays > 0) {
    return {
      label: `Start ${plan.trialDays}-Day Trial`,
      href: `/register?plan=${plan.slug}`,
    };
  }

  return {
    label: "Start Free Trial",
    href: `/register?plan=${plan.slug}`,
  };
}
