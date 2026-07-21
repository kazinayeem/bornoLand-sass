import { DelayedSkeleton } from "@/components/loading/delayed-skeleton";
import { AccountStorefrontSkeleton } from "@/components/loading/storefront-skeletons";

export default function OrdersLoading() {
  return (
    <DelayedSkeleton>
      <AccountStorefrontSkeleton />
    </DelayedSkeleton>
  );
}
