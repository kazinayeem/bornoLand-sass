import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { PlanModel } from "../../models/plan.model.js";
import { StoreSubscriptionModel } from "../../models/store-subscription.model.js";
import { sendSuccess, sendFailure } from "../../common/utils/api-response.js";
import { StorageUsageModel } from "../../models/storage-usage.model.js";

export async function getAdminSubscriptionOverviewController(_request: AuthRequest, response: Response) {
  await connectDatabase();

  const plans = await PlanModel.find({}).lean();
  const stores = await StoreModel.find({})
    .populate("planId", "name slug priceBDT")
    .lean() as Array<Record<string, unknown>>;

  const byPlan: Record<string, { subscribers: number; revenue: number; active: number; trialing: number; expired: number }> = {};
  for (const plan of plans) {
    byPlan[String(plan._id)] = { subscribers: 0, revenue: 0, active: 0, trialing: 0, expired: 0 };
  }

  let totalRevenue = 0;
  let totalActive = 0;
  let totalTrialing = 0;
  let totalExpired = 0;
  let totalSubscribers = 0;

  for (const store of stores) {
    const planId = store.planId ? String((store.planId as Record<string, unknown>)._id || store.planId) : null;
    const bs = store.billingStatus as string;
    const ss = store.subscriptionStatus as string;

    if (bs === "trial" && ss === "trialing") {
      totalTrialing++;
      if (planId && byPlan[planId]) byPlan[planId].trialing++;
    } else if (ss === "active" || ss === "active") {
      totalActive++;
      if (planId && byPlan[planId]) byPlan[planId].active++;
    } else if (bs === "past_due" || ss === "expired" || store.status === "expired") {
      totalExpired++;
      if (planId && byPlan[planId]) byPlan[planId].expired++;
    }

    totalSubscribers++;
    if (planId && byPlan[planId]) byPlan[planId].subscribers++;
  }

  // Revenue from stores with paid orders
  const revenueData = await StoreModel.aggregate([
    { $match: { planId: { $ne: null } } },
    { $group: { _id: "$planId", count: { $sum: 1 } } },
  ]);

  const planStats = plans.map((plan) => {
    const stats = byPlan[String(plan._id)] || { subscribers: 0, revenue: 0, active: 0, trialing: 0, expired: 0 };
    return {
      _id: plan._id,
      name: plan.name,
      slug: plan.slug,
      priceBDT: plan.priceBDT,
      ...stats,
    };
  });

  const popularPlan = planStats.reduce(
    (best, p) => (p.subscribers > (best?.subscribers ?? 0) ? p : best),
    planStats[0]
  );

  return sendSuccess(response, {
    totalSubscribers,
    totalActive,
    totalTrialing,
    totalExpired,
    totalRevenue,
    popularPlan: popularPlan
      ? { name: popularPlan.name, slug: popularPlan.slug, subscribers: popularPlan.subscribers }
      : null,
    plans: planStats,
  });
}
