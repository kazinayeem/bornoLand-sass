import { DelayedSkeleton } from "@/components/loading/delayed-skeleton";
import { HomeStorefrontSkeleton } from "@/components/loading/storefront-skeletons";

/** Default storefront segment fallback — never use dashboard skeletons here. */
export default function StorefrontLoading() {
  return (
    <DelayedSkeleton>
      <HomeStorefrontSkeleton />
    </DelayedSkeleton>
  );
}
