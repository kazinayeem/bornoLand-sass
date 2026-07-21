"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Newspaper, ArrowRight, Loader2 } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";
import { getApiUrl } from "@/lib/urls";
import {
  StorefrontPage,
  StorefrontPageHeader,
  StorefrontEmptyState,
  useStorefrontSurface,
} from "@/components/storefront/storefront-ui";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { cn } from "@/lib/utils";
import type { CmsPageData } from "@/lib/cms-page-types";

type BlogPost = {
  _id: string;
  slug: string;
  postSlug: string;
  title: string;
  excerpt?: string;
};

export default function BlogIndexClient({
  initialPage,
  initialPosts = [],
}: {
  initialPage?: CmsPageData | null;
  initialPosts?: BlogPost[];
}) {
  const { store } = useTenant();
  const { classes, primaryColor } = useStorefrontSurface();
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(initialPage ?? null);
  const [loading, setLoading] = useState(!initialPage && initialPosts.length === 0);

  useEffect(() => {
    if (!store._id) return;
    if (initialPage || initialPosts.length > 0) {
      setLoading(false);
      return;
    }
    const apiUrl = getApiUrl();
    if (!apiUrl) return;
    setLoading(true);
    Promise.all([
      fetch(`${apiUrl}/public/page/blog?storeId=${store._id}`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${apiUrl}/public/blog/posts?storeId=${store._id}`, { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([pageJson, postsJson]) => {
        if (pageJson?.success && pageJson.data?.page) setPage(pageJson.data.page);
        if (postsJson?.success && Array.isArray(postsJson.data?.posts)) setPosts(postsJson.data.posts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [store._id, initialPage, initialPosts.length]);

  if (loading) {
    return (
      <StorefrontPage>
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: primaryColor }} />
        </div>
      </StorefrontPage>
    );
  }

  return (
    <StorefrontPage parchment>
      <StorefrontPageHeader title={page?.title || "Blog"} description="News and stories from the store" />

      {page?.html ? (
        <div
          className="storefront-prose prose mb-apple-xl max-w-none"
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      ) : null}

      {posts.length === 0 ? (
        <StorefrontEmptyState
          icon={<Newspaper className="h-12 w-12" />}
          title="No posts yet"
          description="New articles will appear here when published in CMS as pages with slug post/your-title."
          className="min-h-[40vh]"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <motion.article
              key={post._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={cn("flex flex-col overflow-hidden", classes.card)}
            >
              <div className="flex flex-1 flex-col p-5">
                <h2 className={cn("text-tagline", classes.heading)}>{post.title}</h2>
                {post.excerpt ? (
                  <p className={cn("mt-2 line-clamp-3 flex-1 text-caption", classes.muted)}>{post.excerpt}</p>
                ) : null}
                <Link
                  href={`/blog/${post.postSlug}`}
                  className="mt-4 inline-flex items-center gap-1 text-caption font-medium"
                  style={{ color: primaryColor }}
                >
                  Read more <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </StorefrontPage>
  );
}
