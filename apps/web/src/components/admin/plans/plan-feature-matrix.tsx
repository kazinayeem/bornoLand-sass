"use client";

import { useMemo, Fragment } from "react";
import {
  useGetAdminFeaturesQuery,
  useGetPlanFeatureAssignmentsQuery,
  useGetAdminFeatureGroupsQuery,
  normalizeFeatureType,
  type PlanFeatureAssignment,
  type PlatformFeature,
  type FeatureGroup,
} from "@/redux/api/feature-api";
import type { Plan } from "@/redux/api/store-api";

function formatCell(feature: PlanFeatureAssignment | undefined) {
  if (!feature) return "—";
  const type = normalizeFeatureType(feature.type);
  if (type === "boolean") return feature.enabled ? "Yes" : "No";
  if (type === "tier") {
    const tier = feature.tierKey ?? feature.value ?? "disabled";
    if (tier === "disabled" || tier === "none") return "No";
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  }
  if (!feature.enabled && (feature.limit ?? 0) <= 0) return "No";
  if ((feature.limit ?? 0) === 0) return "Unlimited";
  const unit = feature.limitMeta?.unit ?? "";
  if (feature.featureKey === "storage" && unit === "GB") {
    const gb = feature.limit;
    if (gb < 1) return `${Math.round(gb * 1024)} MB`;
    return `${gb} GB`;
  }
  return `${feature.limit}${unit ? ` ${unit}` : ""}`;
}

function GroupHeader({ groupName }: { groupName: string }) {
  return (
    <tr className="bg-apple-canvas-parchment/50 border-b border-zinc-100">
      <td colSpan={99} className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">
        {groupName}
      </td>
    </tr>
  );
}

function PlanMatrixCell({ planId, featureKey }: { planId: string; featureKey: string }) {
  const { data } = useGetPlanFeatureAssignmentsQuery(planId);
  const feature = data?.data?.features?.find((f) => f.featureKey === featureKey);
  return <td className="px-4 py-3 text-center text-sm text-apple-ink-muted-80">{formatCell(feature)}</td>;
}

export function PlanFeatureMatrix({ plans }: { plans: Plan[] }) {
  const { data: featuresData } = useGetAdminFeaturesQuery();
  const { data: groupsData } = useGetAdminFeatureGroupsQuery();
  const activePlans = plans.filter((p) => p.isActive).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const featureCount = featuresData?.data?.features?.length ?? 0;

  if (activePlans.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center text-sm text-apple-ink-muted-48">
        No active plans to compare.
      </div>
    );
  }

  const features = (featuresData?.data?.features ?? []) as PlatformFeature[];
  const groups = (groupsData?.data?.groups ?? []) as FeatureGroup[];
  const groupMap = new Map(groups.map((g) => [g.key, g.name]));
  const defaultGroupName = "General";

  const featuresByGroup = useMemo(() => {
    const map = new Map<string, PlatformFeature[]>();
    for (const feature of features) {
      const groupKey = feature.groupKey || feature.group || "general";
      const list = map.get(groupKey) || [];
      list.push(feature);
      map.set(groupKey, list);
    }
    return map;
  }, [features]);

  const sortedGroupKeys = useMemo(() => {
    const groupEntries = Array.from(featuresByGroup.entries());
    return groupEntries
      .sort(([keyA], [keyB]) => {
        const orderA = groups.find((g) => g.key === keyA)?.sortOrder ?? 999;
        const orderB = groups.find((g) => g.key === keyB)?.sortOrder ?? 999;
        return orderA - orderB;
      })
      .map(([key]) => key);
  }, [featuresByGroup, groups]);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-5 py-4">
        <h3 className="text-lg font-semibold text-apple-ink">Plan comparison</h3>
        <p className="text-sm text-apple-ink-muted-48">
          Dynamically generated from plan features · {activePlans.length} plans · {featureCount} features
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-apple-canvas-parchment/80 text-left text-xs uppercase tracking-wide text-apple-ink-muted-48">
              <th className="sticky left-0 z-10 bg-apple-canvas-parchment/95 px-5 py-3 font-semibold">Feature</th>
              {activePlans.map((plan) => (
                <th key={plan._id} className="px-4 py-3 text-center font-semibold">
                  <div>{plan.name}</div>
                  {plan.isRecommended && (
                    <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-600">
                      Popular
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedGroupKeys.map((groupKey) => {
              const groupFeatures = featuresByGroup.get(groupKey) ?? [];
              const groupName = groupMap.get(groupKey) ?? defaultGroupName;
              return (
                <Fragment key={groupKey}>
                  <GroupHeader groupName={groupName} />
                  {[...groupFeatures]
                    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                    .map((feature) => (
                      <tr key={feature.key} className="border-b border-zinc-50 hover:bg-apple-canvas-parchment/50">
                        <td className="sticky left-0 z-10 bg-white px-5 py-3 font-medium text-zinc-800">
                          {feature.name}
                        </td>
                        {activePlans.map((plan) => (
                          <PlanMatrixCell key={`${plan._id}-${feature.key}`} planId={plan._id} featureKey={feature.key} />
                        ))}
                      </tr>
                    ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
