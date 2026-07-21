import { DelayedSkeleton } from "@/components/loading/delayed-skeleton";
import { ShopStorefrontSkeleton } from "@/components/loading/storefront-skeletons";

export default function CategoryLoading() {
  return (
    <DelayedSkeleton>
      <ShopStorefrontSkeleton />
    </DelayedSkeleton>
  );
}
