import { connectDatabase } from "../../common/database/connection.js";
import { PlanModel } from "../../models/plan.model.js";
import { planSchema, updatePlanSchema } from "./plan.validator.js";
import { getPlanPriceForDuration } from "./plan-pricing.util.js";
import { ensureDefaultPlansSafe } from "../../bootstrap/safe-migrate.js";
import type { SubscriptionDuration } from "../subscriptions/subscription.constants.js";

async function ensureDefaultPlans() {
  await ensureDefaultPlansSafe();
}

export async function listPlans(includeHidden = false) {
  await connectDatabase();
  await ensureDefaultPlans();
  const filter = includeHidden ? {} : { isActive: true, visible: { $ne: false } };
  const plans = await PlanModel.find(filter).sort({ sortOrder: 1, priceBDT: 1 }).lean();
  return { ok: true as const, data: { plans } };
}

/** Public marketing payload: never exposes hidden or inactive plan configurations. */
export async function listPublicPlans() {
  await connectDatabase();
  const plans = await PlanModel.find({ isActive: true, visible: { $ne: false } })
    .select("name slug description priceBDT priceYearly isCustomPrice trialDays features limits featureToggles pricing customDomain prioritySupport sortOrder isRecommended isPopular")
    .sort({ sortOrder: 1, priceBDT: 1 })
    .lean();
  return { ok: true as const, data: { plans } };
}

export async function createPlan(payload: unknown) {
  const parsed = planSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid plan data" };

  await connectDatabase();
  const existing = await PlanModel.findOne({ slug: parsed.data.slug }).lean();
  if (existing) return { ok: false as const, message: "Plan slug already exists" };

  const plan = await PlanModel.create({
    ...parsed.data,
    pricing: {
      monthly: parsed.data.pricing?.monthly || parsed.data.priceBDT,
      quarterly: parsed.data.pricing?.quarterly || parsed.data.priceBDT * 3,
      halfYearly: parsed.data.pricing?.halfYearly || parsed.data.priceBDT * 6,
      yearly: parsed.data.pricing?.yearly || parsed.data.priceYearly || parsed.data.priceBDT * 12,
      lifetime: parsed.data.pricing?.lifetime || 0,
    },
  });
  return { ok: true as const, data: { plan: plan.toObject() } };
}

export async function updatePlan(planId: string, payload: unknown) {
  const parsed = updatePlanSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid plan data" };

  await connectDatabase();
  const plan = await PlanModel.findByIdAndUpdate(planId, { $set: parsed.data }, { new: true }).lean();
  if (!plan) return { ok: false as const, message: "Plan not found" };
  return { ok: true as const, data: { plan } };
}

export async function deletePlan(planId: string) {
  await connectDatabase();
  const plan = await PlanModel.findByIdAndDelete(planId).lean();
  if (!plan) return { ok: false as const, message: "Plan not found" };
  return { ok: true as const, message: "Plan deleted" };
}

export async function duplicatePlan(planId: string) {
  await connectDatabase();
  const plan = await PlanModel.findById(planId).lean() as { slug: string; name: string } | null;
  if (!plan) return { ok: false as const, message: "Plan not found" };

  const baseSlug = `${plan.slug}-copy`;
  let slug = baseSlug;
  let counter = 1;
  while (await PlanModel.findOne({ slug }).lean()) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const { _id, createdAt, updatedAt, ...rest } = plan as Record<string, unknown>;
  const duplicate = await PlanModel.create({
    ...rest,
    name: `${plan.name} (Copy)`,
    slug,
    isActive: false,
    visible: false,
  });

  return { ok: true as const, data: { plan: duplicate.toObject() } };
}

export async function getPlanPrice(planId: string, duration: SubscriptionDuration) {
  await connectDatabase();
  const plan = (await PlanModel.findById(planId).lean()) as Parameters<typeof getPlanPriceForDuration>[0] | null;
  if (!plan) return { ok: false as const, message: "Plan not found" };
  const amount = getPlanPriceForDuration(plan, duration);
  return { ok: true as const, data: { plan, duration, amount } };
}
