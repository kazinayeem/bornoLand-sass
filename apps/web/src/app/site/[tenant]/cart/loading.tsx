import { DelayedSkeleton } from "@/components/loading/delayed-skeleton";
import { CartStorefrontSkeleton } from "@/components/loading/storefront-skeletons";

export default function CartLoading() {
  return (
    <DelayedSkeleton>
      <CartStorefrontSkeleton />
    </DelayedSkeleton>
  );
}
