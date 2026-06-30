"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { use } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useGetPlansQuery } from "@/redux/api/store-api";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PlanBuilder } from "@/components/admin/plans/plan-builder";
import { Badge } from "@/components/ui/badge";

export default function PlanBuilderPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = use(params);
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") ?? undefined;
  const { data, isLoading } = useGetPlansQuery({ all: true });
  const plan = data?.data?.plans?.find((p) => p._id === planId);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
        <p className="text-zinc-600">Plan not found.</p>
        <Link href="/admin/dashboard/plans" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Back to plans
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/dashboard/plans"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="h-4 w-4" />
        All plans
      </Link>

      <AdminPageHeader
        title={plan.name}
        description={`Plan builder · /${plan.slug}`}
        badge={
          <>
            {plan.isRecommended && <Badge className="bg-blue-50 text-blue-700">Recommended</Badge>}
            <Badge variant={plan.isActive ? "success" : "warning"}>
              {plan.isActive ? "Active" : "Archived"}
            </Badge>
          </>
        }
      />

      <PlanBuilder plan={plan} initialTab={initialTab} />
    </div>
  );
}
