"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useGetPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDuplicatePlanMutation,
} from "@/redux/api/store-api";
import { useGetAdminFeaturesQuery } from "@/redux/api/feature-api";
import { useGetAdminStoresQuery } from "@/redux/api/admin-api";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PlanCard } from "@/components/admin/plans/plan-card";
import { PlanFeatureMatrix } from "@/components/admin/plans/plan-feature-matrix";
import { getAllPlanStats } from "@/lib/plan-stats";

export default function PlansPage() {
  const router = useRouter();
  const { data, isLoading } = useGetPlansQuery({ all: true });
  const { data: featuresData } = useGetAdminFeaturesQuery();
  const { data: storesData } = useGetAdminStoresQuery();
  const [createPlan] = useCreatePlanMutation();
  const [updatePlan] = useUpdatePlanMutation();
  const [duplicatePlan] = useDuplicatePlanMutation();

  const plans = data?.data?.plans ?? [];
  const stores = storesData?.data?.stores ?? [];
  const featureCount = featuresData?.data?.features?.length ?? 0;
  const statsMap = useMemo(() => getAllPlanStats(plans, stores), [plans, stores]);

  const handleCreate = async () => {
    const slug = `plan-${Date.now().toString(36)}`;
    try {
      const result = await createPlan({
        name: "New Plan",
        slug,
        priceBDT: 0,
        trialDays: 0,
        features: [],
        limits: { stores: 1, products: 0, staff: 1, bandwidthGB: 1 },
        isRecommended: false,
        isActive: true,
      }).unwrap();
      toast.success("Plan created — configure everything in Plan Builder");
      const id = result.data?.plan?._id;
      if (id) router.push(`/admin/dashboard/plans/${id}`);
    } catch {
      toast.error("Failed to create plan");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicatePlan(id).unwrap();
      toast.success("Plan duplicated");
    } catch {
      toast.error("Failed to duplicate plan");
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Archive this plan? Existing subscribers keep their assignment.")) return;
    try {
      await updatePlan({ id, data: { isActive: false } }).unwrap();
      toast.success("Plan archived");
    } catch {
      toast.error("Failed to archive plan");
    }
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Subscription plans"
        description="One unified Plan Builder for pricing, trial, storage, limits, features, and visibility."
        actions={
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New plan
          </button>
        }
      />

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan, i) => (
              <PlanCard
                key={plan._id}
                plan={plan}
                index={i}
                featureCount={featureCount}
                storageMB={plan.limits.storageGB ? Math.round(plan.limits.storageGB * 1024) : undefined}
                stats={statsMap.get(plan._id)}
                onDuplicate={handleDuplicate}
                onArchive={handleArchive}
              />
            ))}
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">Plan comparison</h2>
                <p className="text-sm text-zinc-500">Auto-generated from live plan configuration</p>
              </div>
            </div>
            <PlanFeatureMatrix plans={plans} />
          </section>
        </>
      )}
    </div>
  );
}
