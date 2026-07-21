import { DelayedSkeleton } from "@/components/loading/delayed-skeleton";
import { ContentStorefrontSkeleton } from "@/components/loading/storefront-skeletons";

export default function AboutLoading() {
  return (
    <DelayedSkeleton>
      <ContentStorefrontSkeleton />
    </DelayedSkeleton>
  );
}
