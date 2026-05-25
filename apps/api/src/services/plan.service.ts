import { connectDatabase } from "../config/database.js";
import { PlanModel } from "../models/plan.model.js";
import { planSchema, updatePlanSchema } from "../validators/plan.validator.js";

const defaultPlans = [
  {
    name: "Free",
    slug: "free",
    priceBDT: 0,
    trialDays: 14,
    features: ["1 store", "50 products", "Basic storefront"],
    limits: { stores: 1, products: 50, staff: 1, bandwidthGB: 2 },
    isRecommended: false,
    isActive: true
  },
  {
    name: "Starter",
    slug: "starter",
    priceBDT: 1499,
    trialDays: 14,
    features: ["5 stores", "Unlimited products", "Priority support"],
    limits: { stores: 5, products: 5000, staff: 3, bandwidthGB: 50 },
    isRecommended: true,
    isActive: true
  },
  {
    name: "Growth",
    slug: "growth",
    priceBDT: 3999,
    trialDays: 14,
    features: ["15 stores", "Automation tools", "Advanced reporting"],
    limits: { stores: 15, products: 25000, staff: 8, bandwidthGB: 200 },
    isRecommended: false,
    isActive: true
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    priceBDT: 12999,
    trialDays: 30,
    features: ["Unlimited stores", "Dedicated success manager", "SLA support"],
    limits: { stores: 999, products: 0, staff: 0, bandwidthGB: 0 },
    isRecommended: false,
    isActive: true
  }
] as const;

async function ensureDefaultPlans() {
  const count = await PlanModel.countDocuments();
  if (count > 0) return;
  await PlanModel.insertMany(defaultPlans);
}

export async function listPlans() {
  await connectDatabase();
  await ensureDefaultPlans();
  const plans = await PlanModel.find().sort({ priceBDT: 1 }).lean();
  return { ok: true as const, data: { plans } };
}

export async function createPlan(payload: unknown) {
  const parsed = planSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid plan data" };

  await connectDatabase();
  const existing = await PlanModel.findOne({ slug: parsed.data.slug }).lean();
  if (existing) return { ok: false as const, message: "Plan slug already exists" };

  const plan = await PlanModel.create(parsed.data);
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