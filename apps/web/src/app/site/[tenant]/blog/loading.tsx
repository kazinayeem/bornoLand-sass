import { DelayedSkeleton } from "@/components/loading/delayed-skeleton";
import { BlogStorefrontSkeleton } from "@/components/loading/storefront-skeletons";

export default function BlogLoading() {
  return (
    <DelayedSkeleton>
      <BlogStorefrontSkeleton />
    </DelayedSkeleton>
  );
}
