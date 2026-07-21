import { notFound } from "next/navigation";
import { getCmsPageForTenant } from "@/lib/server/cms-page";
import {
  StorefrontPage,
  StorefrontPageHeader,
} from "@/components/storefront/storefront-ui";
import { StoreLink as Link } from "@/components/storefront/store-link";

export const revalidate = 60;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ tenant: string; slug: string }>;
}) {
  const { tenant, slug } = await params;
  const page = await getCmsPageForTenant(tenant, `post/${slug}`);
  if (!page?.html && !page?.title) notFound();

  return (
    <StorefrontPage maxWidth="sm">
      <Link href="/blog" className="mb-6 inline-block text-caption text-apple-primary">
        ← Back to blog
      </Link>
      <StorefrontPageHeader title={page?.title || "Post"} />
      {page?.html ? (
        <div
          className="storefront-prose prose max-w-none"
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      ) : (
        <p className="text-body text-apple-ink-muted-48">This post has no content yet.</p>
      )}
    </StorefrontPage>
  );
}
