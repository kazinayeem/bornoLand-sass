"use client";

import { useRouter } from "next/navigation";
import { FileText, Loader2, Plus } from "lucide-react";
import { useCreatePageMutation, useGetPagesQuery } from "@/redux/api/builder-api";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { loadSections, setPageId } from "@/redux/slices/builder-slice";

export function PagesPanel({ storeId, storeSlug }: { storeId?: string; storeSlug?: string }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pageId = useSelector((s: RootState) => s.builder.pageId);
  const { data, isLoading } = useGetPagesQuery(storeId ?? "", { skip: !storeId });
  const [createPage] = useCreatePageMutation();
  const pages = data?.data?.pages ?? [];

  const openPage = (page: { _id: string; slug: string; sections?: unknown[] }) => {
    dispatch(setPageId(page._id));
    dispatch(loadSections((page.sections ?? []) as never));
    if (storeSlug) {
      router.push(`/store/${storeSlug}/builder/${page.slug}`);
    }
  };

  if (!storeId) return <div className="p-4 text-xs text-zinc-400">Select a store to manage pages.</div>;
  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-zinc-400" /></div>;

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Pages</p>
        <button
          type="button"
          onClick={async () => {
            const created = await createPage({ storeId, data: { title: "New Page", slug: `page-${Date.now()}` } }).unwrap();
            const page = created.data?.page;
            if (page) openPage(page);
          }}
          className="rounded-lg bg-zinc-900 px-2.5 py-1.5 text-[10px] font-medium text-white"
        >
          <Plus className="mr-1 inline h-3 w-3" /> New
        </button>
      </div>
      <div className="space-y-2">
        {pages.map((page) => (
          <button
            key={page._id}
            type="button"
            onClick={() => openPage(page)}
            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left ${
              pageId === page._id ? "border-zinc-900 bg-zinc-50" : "border-zinc-100 hover:border-zinc-200"
            }`}
          >
            <FileText className="h-4 w-4 text-zinc-400" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-800">{page.title}</p>
              <p className="truncate text-[11px] text-zinc-400">/{page.slug}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
