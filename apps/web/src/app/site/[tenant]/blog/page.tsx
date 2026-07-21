import { getCmsPageForTenant } from "@/lib/server/cms-page";
import { fetchTenantSite } from "@/lib/server/tenant-site";
import { getApiUrl } from "@/lib/urls";
import BlogIndexClient from "./blog-index-client";

export const revalidate = 60;

async function fetchBlogPosts(storeId: string) {
  try {
    const apiUrl = getApiUrl();
    if (!apiUrl) return [];
    const res = await fetch(`${apiUrl}/public/blog/posts?storeId=${storeId}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data?.posts) ? json.data.posts : [];
  } catch {
    return [];
  }
}

export default async function BlogPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const site = await fetchTenantSite(tenant);
  const storeId = (site?.store as { _id?: string } | null)?._id;
  const [page, posts] = await Promise.all([
    getCmsPageForTenant(tenant, "blog", storeId),
    storeId ? fetchBlogPosts(storeId) : Promise.resolve([]),
  ]);

  return <BlogIndexClient initialPage={page} initialPosts={posts} />;
}
