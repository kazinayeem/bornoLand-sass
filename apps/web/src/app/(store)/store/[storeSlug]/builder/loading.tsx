import { DelayedSkeleton } from "@/components/loading/delayed-skeleton";
import { DashboardPageSkeleton } from "@/components/loading/page-skeleton";

export default function BuilderLoading() {
  return (
    <DelayedSkeleton>
      <DashboardPageSkeleton />
    </DelayedSkeleton>
  );
}
