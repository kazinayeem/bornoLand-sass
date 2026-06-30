import { notFound } from "next/navigation";
import { Suspense } from "react";
import { StorefrontCanvas } from "@/components/storefront/storefront-canvas";
import { fetchTenantSite } from "@/lib/server/tenant-site";

export const revalidate = 60;

async function HomeCanvas({ slug }: { slug: string }) {
  const data = (await fetchTenantSite(slug)) as {
    page: {
      sections?: { id: string; type: string; visible?: boolean; props?: Record<string, string | number | boolean | null | undefined> }[];
    } | null;
  } | null;
  if (!data) notFound();
  return <StorefrontCanvas sections={data.page?.sections ?? []} />;
}

export default async function TenantSitePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: slug } = await params;

  return (
    <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" /></div>}>
      <HomeCanvas slug={slug} />
    </Suspense>
  );
}
