import { DelayedSkeleton } from "@/components/loading/delayed-skeleton";
import { CheckoutStorefrontSkeleton } from "@/components/loading/storefront-skeletons";

export default function CheckoutLoading() {
  return (
    <DelayedSkeleton>
      <CheckoutStorefrontSkeleton />
    </DelayedSkeleton>
  );
}
