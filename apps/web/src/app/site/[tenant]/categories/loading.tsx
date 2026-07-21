import { DelayedSkeleton } from "@/components/loading/delayed-skeleton";
import { ShopStorefrontSkeleton } from "@/components/loading/storefront-skeletons";

export default function CategoriesLoading() {
  return (
    <DelayedSkeleton>
      <ShopStorefrontSkeleton />
    </DelayedSkeleton>
  );
}
