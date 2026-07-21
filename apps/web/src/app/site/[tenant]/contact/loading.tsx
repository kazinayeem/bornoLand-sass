import { DelayedSkeleton } from "@/components/loading/delayed-skeleton";
import { ContactStorefrontSkeleton } from "@/components/loading/storefront-skeletons";

export default function ContactLoading() {
  return (
    <DelayedSkeleton>
      <ContactStorefrontSkeleton />
    </DelayedSkeleton>
  );
}
