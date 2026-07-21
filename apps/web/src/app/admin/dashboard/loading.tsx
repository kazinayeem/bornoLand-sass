import { DelayedSkeleton } from "@/components/loading/delayed-skeleton";
import { DashboardPageSkeleton } from "@/components/loading/page-skeleton";

export default function AdminDashboardLoading() {
  return (
    <DelayedSkeleton>
      <DashboardPageSkeleton />
    </DelayedSkeleton>
  );
}
