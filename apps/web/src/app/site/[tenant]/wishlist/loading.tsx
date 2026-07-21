import { DelayedSkeleton } from "@/components/loading/delayed-skeleton";
import { CartStorefrontSkeleton } from "@/components/loading/storefront-skeletons";

export default function WishlistLoading() {
  return (
    <DelayedSkeleton>
      <CartStorefrontSkeleton />
    </DelayedSkeleton>
  );
}
