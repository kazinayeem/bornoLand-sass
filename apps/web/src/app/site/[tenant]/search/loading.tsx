import { DelayedSkeleton } from "@/components/loading/delayed-skeleton";
import { ShopStorefrontSkeleton } from "@/components/loading/storefront-skeletons";

export default function SearchLoading() {
  return (
    <DelayedSkeleton>
      <ShopStorefrontSkeleton />
    </DelayedSkeleton>
  );
}
