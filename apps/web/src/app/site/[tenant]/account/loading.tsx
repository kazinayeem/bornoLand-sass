import { DelayedSkeleton } from "@/components/loading/delayed-skeleton";
import { AccountStorefrontSkeleton } from "@/components/loading/storefront-skeletons";

export default function AccountLoading() {
  return (
    <DelayedSkeleton>
      <AccountStorefrontSkeleton />
    </DelayedSkeleton>
  );
}
