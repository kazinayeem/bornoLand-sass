"use client";

import { useMemo, useState, useCallback } from "react";
import { LayoutTemplate, Plus, Search, FileText, Layers, Loader2, AlertCircle, Check } from "lucide-react";
import { useDispatch } from "react-redux";
import { addSection, loadSections, setPageMetadata } from "@/redux/slices/builder-slice";
import { Modal } from "@/components/ui/modal";
import { useGetBuilderTemplatesQuery, type BuilderTemplate } from "@/redux/api/builder-template-api";
import { useRequiredStore } from "@/providers/store-context";
import { useCreateStorePageMutation } from "@/redux/api/store-page-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, string> = {
  ecommerce: "🛍️",
  fashion: "👗",
  electronics: "💻",
  restaurant: "🍽️",
  landing: "🚀",
};

const categoryLabels: Record<string, string> = {
  ecommerce: "Ecommerce",
  fashion: "Fashion",
  electronics: "Electronics",
  restaurant: "Restaurant",
  landing: "Landing Page",
};

const categoryOrder = ["ecommerce", "fashion", "electronics", "restaurant", "landing"];

const templateGradients = [
  "from-violet-500 via-purple-500 to-pink-500",
  "from-blue-500 via-cyan-500 to-teal-500",
  "from-orange-500 via-red-500 to-rose-500",
  "from-emerald-500 via-green-500 to-teal-500",
  "from-indigo-500 via-blue-500 to-purple-500",
];

export function TemplatesPanel() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { storeId, storeSlug } = useRequiredStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [createPage] = useCreateStorePageMutation();
  const [applying, setApplying] = useState<string | null>(null);

  const { data: templatesData, isLoading, error } = useGetBuilderTemplatesQuery({
    storeId,
    templateType: "page",
  });

  const templates = useMemo(() => {
    const all = templatesData?.data?.templates ?? [];
    const sorted = [...all].sort((a, b) => {
      const aIdx = categoryOrder.indexOf(a.category);
      const bIdx = categoryOrder.indexOf(b.category);
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
    });
    if (!query.trim()) return sorted;
    const q = query.toLowerCase();
    return sorted.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
  }, [templatesData, query]);

  const grouped = useMemo(() => {
    const map: Record<string, BuilderTemplate[]> = {};
    for (const t of templates) {
      const cat = t.category || "other";
      if (!map[cat]) map[cat] = [];
      map[cat].push(t);
    }
    const ordered: { category: string; templates: BuilderTemplate[] }[] = [];
    for (const cat of categoryOrder) {
      if (map[cat]) {
        ordered.push({ category: cat, templates: map[cat] });
        delete map[cat];
      }
    }
    for (const cat of Object.keys(map).sort()) {
      ordered.push({ category: cat, templates: map[cat] });
    }
    return ordered;
  }, [templates]);

  const handleUseTemplate = useCallback(
    async (template: BuilderTemplate, mode: "page" | "sections") => {
      setApplying(template._id);
      try {
        if (mode === "page") {
          const title = template.name;
          const slug = template.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
          const result = await createPage({
            storeId,
            title,
            slug: slug.startsWith("/") ? slug : `/${slug}`,
            templateId: template._id,
          }).unwrap();
          toast.success(`Page "${template.name}" created`);
          setOpen(false);
          const page = result.data?.page;
          if (page) {
            dispatch(setPageMetadata({ id: page._id, title: page.title, slug: page.slug }));
            dispatch(loadSections(page.sections ?? []));
            router.push(`/store/${storeSlug}/builder/${page.slug.startsWith('/') ? page.slug.slice(1) : page.slug}`);
          }
        } else {
          const sections = (template.sections ?? []) as any[];
          for (const section of sections) {
            dispatch(addSection({
              id: `${section.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              type: section.type,
              label: section.label ?? section.type,
              visible: true,
              props: section.props ?? {},
            }));
          }
          toast.success(`Added ${sections.length} sections from "${template.name}"`);
          setOpen(false);
        }
      } catch {
        toast.error(`Failed to ${mode === "page" ? "create page from" : "insert"} template`);
      }
      setApplying(null);
    },
    [dispatch, createPage, storeId, storeSlug, router],
  );

  return (
    <>
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Templates</p>
        <h2 className="mt-1 text-sm font-semibold text-zinc-900">Starter page templates</h2>
        <p className="mt-1 text-xs leading-5 text-zinc-500">Pre-built pages with realistic content. Pick one and customize.</p>
        <div className="mt-4 rounded-3xl border border-zinc-100 bg-zinc-50/70 p-4">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-zinc-400" />
            <div>
              <p className="text-sm font-medium text-zinc-900">Template Gallery</p>
              <p className="text-xs text-zinc-500">5 starter templates included.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-4 rounded-2xl bg-zinc-900 px-3 py-2 text-[11px] font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            Browse Templates
          </button>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Starter Templates"
        description="Choose a pre-built template to create a new page or add sections to the current page."
        size="full"
      >
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates..."
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 text-sm outline-none focus:border-zinc-400 focus:bg-white"
            />
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
              <p className="text-sm text-zinc-600">Failed to load templates</p>
              <p className="text-xs text-zinc-400 mt-1">Check your connection and try again.</p>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !error && templates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <LayoutTemplate className="h-8 w-8 text-zinc-300 mb-2" />
              <p className="text-sm text-zinc-500">No templates found</p>
              {query && <p className="text-xs text-zinc-400 mt-1">Try a different search term.</p>}
            </div>
          )}

          {/* Template groups */}
          {!isLoading && !error && grouped.map((group, gi) => (
            <div key={group.category}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">{categoryIcons[group.category] || "📄"}</span>
                <h3 className="text-sm font-semibold text-zinc-900">
                  {categoryLabels[group.category] || group.category.charAt(0).toUpperCase() + group.category.slice(1)}
                </h3>
                <span className="text-[10px] text-zinc-400 font-medium">{group.templates.length} template{group.templates.length !== 1 ? "s" : ""}</span>
              </div>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))" }}
              >
                {group.templates.map((template, ti) => (
                  <TemplateCard
                    key={template._id}
                    template={template}
                    gradient={templateGradients[(gi * 3 + ti) % templateGradients.length]}
                    onApply={handleUseTemplate}
                    applying={applying === template._id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}

function TemplateCard({
  template,
  gradient,
  onApply,
  applying,
}: {
  template: BuilderTemplate;
  gradient: string;
  onApply: (template: BuilderTemplate, mode: "page" | "sections") => void;
  applying: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const sectionCount = template.sections?.length ?? 0;

  return (
    <div className="group relative rounded-[1.75rem] border border-zinc-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-zinc-200 hover:shadow-sm">
      {/* Thumbnail */}
      <div className={`aspect-[16/10] rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex flex-col items-center gap-1">
          <span className="text-4xl">{categoryIcons[template.category] || "📄"}</span>
          <span className="text-[10px] font-medium text-white/80 bg-black/20 px-2 py-0.5 rounded-full">
            {sectionCount} section{sectionCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate">{template.name}</p>
            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{template.description || "No description"}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-3.5 flex items-center gap-2">
          <button
            onClick={() => onApply(template, "page")}
            disabled={applying}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-2 text-[11px] font-medium text-white hover:bg-zinc-800 disabled:opacity-50 transition-all"
          >
            {applying ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <FileText className="h-3 w-3" />
            )}
            {applying ? "Creating..." : "Create Page"}
          </button>
          <button
            onClick={() => onApply(template, "sections")}
            disabled={applying}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 transition-all"
            title="Insert sections into current page"
          >
            <Layers className="h-3 w-3" />
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}
