import { DelayedSkeleton } from "@/components/loading/delayed-skeleton";
import { ProductStorefrontSkeleton } from "@/components/loading/storefront-skeletons";

export default function ProductLoading() {
  return (
    <DelayedSkeleton>
      <ProductStorefrontSkeleton />
    </DelayedSkeleton>
  );
}
