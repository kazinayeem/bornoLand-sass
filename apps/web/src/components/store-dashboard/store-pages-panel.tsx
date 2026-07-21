"use client";

import { useRouter } from "next/navigation";
import { FileText, Loader2, Plus, ExternalLink } from "lucide-react";
import { useCreateStorePageMutation, useGetStorePagesQuery } from "@/redux/api/store-page-api";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";

export function StorePagesPanel() {
  const router = useRouter();
  const { store, storeId, isLoading } = useStorePage();
  const { data, isLoading: pagesLoading } = useGetStorePagesQuery(storeId ?? "", { skip: !storeId });
  const [createPage, { isLoading: creating }] = useCreateStorePageMutation();
  const pages = data?.data?.pages ?? [];

  if (isLoading || !store || !storeId) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>;
  }

  const openBuilder = (pageSlug: string) => {
    router.push(`/store/${store.slug}/builder/${pageSlug}`);
  };

  return (
    <StorePageCard>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-apple-ink">Pages</h2>
            <p className="mt-1 text-sm text-apple-ink-muted-48">Manage storefront pages and open them in the builder.</p>
          </div>
          <button
            type="button"
            disabled={creating}
            onClick={async () => {
              const created = await createPage({
                storeId,
                title: "New Page",
                slug: `/page-${Date.now()}`,
              }).unwrap();
              const page = created.data?.page;
              if (page?.slug) openBuilder(page.slug);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            New page
          </button>
        </div>

        {pagesLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
              <button
                key={page._id}
                type="button"
                onClick={() => openBuilder(page.slug)}
                className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-left transition-all hover:border-zinc-300 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                  <FileText className="h-5 w-5 text-apple-ink-muted-48" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-apple-ink">{page.title}</p>
                  <p className="truncate text-xs text-apple-ink-muted-48">/{page.slug}</p>
                </div>
                <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-zinc-300" />
              </button>
            ))}
          </div>
        )}
      </div>
    </StorePageCard>
  );
}
