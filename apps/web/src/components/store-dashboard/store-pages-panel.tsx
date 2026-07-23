"use client";

import { useRouter } from "next/navigation";
import { FileText, Loader2, Plus, ExternalLink } from "lucide-react";
import { useCreateStorePageMutation, useGetStorePagesQuery } from "@/redux/api/store-page-api";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StorePagesPanel() {
  const router = useRouter();
  const { store, storeId, isLoading } = useStorePage();
  const { data, isLoading: pagesLoading } = useGetStorePagesQuery(storeId ?? "", { skip: !storeId });
  const [createPage, { isLoading: creating }] = useCreateStorePageMutation();
  const pages = data?.data?.pages ?? [];

  if (isLoading || !store || !storeId) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const openBuilder = () => {
    router.push(`/store/${store.slug}/builder/home`);
  };

  return (
    <StorePageCard>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Pages</h2>
            <p className="mt-1 text-xs text-muted-foreground">Manage storefront pages and open them in the builder.</p>
          </div>
          <Button
            type="button"
            disabled={creating}
            onClick={async () => {
              const created = await createPage({
                storeId,
                title: "New Page",
                slug: `/page-${Date.now()}`,
              }).unwrap();
              const page = created.data?.page;
              if (page?.slug) openBuilder();
            }}
            className="rounded-full font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New page
          </Button>
        </div>

        {pagesLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
              <Card
                key={page._id}
                onClick={() => openBuilder()}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-sm text-foreground">{page.title}</p>
                  <p className="truncate text-xs text-muted-foreground">/{page.slug}</p>
                </div>
                <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
              </Card>
            ))}
          </div>
        )}
      </div>
    </StorePageCard>
  );
}
