"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ProductSlugRedirect({ slug }: { slug: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/products/${slug}`);
  }, [router, slug]);

  return null;
}
