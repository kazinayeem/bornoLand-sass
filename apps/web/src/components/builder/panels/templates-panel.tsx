"use client";

import { useMemo, useState, useCallback } from "react";
import type { FormEvent } from "react";
import { LayoutTemplate, Search, FileText, Layers, Loader2, AlertCircle, Heart, Eye, Monitor, Smartphone, Tablet, Moon, Sun, CheckSquare, Copy, Plus, FolderOpen, Save } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { addSection, loadSections, setActiveTab, setPageMetadata } from "@/redux/slices/builder-slice";
import { Modal } from "@/components/ui/modal";
import { useCreateBuilderTemplateMutation, useCreateTemplateFromPageMutation, useDuplicateTemplateMutation, useGetBuilderTemplatesQuery, type BuilderTemplate } from "@/redux/api/builder-template-api";
import { useRequiredStore } from "@/providers/store-context";
import { useCreateStorePageMutation, useSaveStorePageDraftMutation } from "@/redux/api/store-page-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { StorefrontFrame } from "@/components/storefront/storefront-frame";
import { StorefrontCanvas } from "@/components/storefront/storefront-canvas";

const categoryIcons: Record<string, string> = {
  ecommerce: "🛍️",
  fashion: "👗",
  electronics: "💻",
  furniture: "🛋️",
  grocery: "🥬",
  cosmetics: "💄",
  jewelry: "💎",
  restaurant: "🍽️",
  landing: "🚀",
};

const categoryLabels: Record<string, string> = {
  ecommerce: "Ecommerce",
  fashion: "Fashion & Beauty",
  electronics: "Electronics",
  furniture: "Furniture",
  grocery: "Grocery",
  cosmetics: "Cosmetics",
  jewelry: "Jewelry",
  restaurant: "Restaurant",
  landing: "Landing & Portfolio",
  coffee: "Coffee",
  beauty: "Beauty",
  medical: "Medical",
  agency: "Agency",
  portfolio: "Portfolio",
  blog: "Blog",
  education: "Education",
  digital: "Digital Products",
  "coming-soon": "Coming Soon",
};

const categoryOrder = ["landing", "ecommerce", "fashion", "restaurant", "coffee", "electronics", "furniture", "beauty", "medical", "agency", "portfolio", "blog", "education", "digital", "coming-soon"];

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
  const { store, storeId, storeSlug } = useRequiredStore();
  // This panel only mounts when Templates is chosen; open it synchronously so
  // the sidebar never becomes a temporary template drawer.
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [collection, setCollection] = useState<"marketplace" | "mine" | "favorites" | "recent">("marketplace");
  const [sort, setSort] = useState<"newest" | "popular" | "updated" | "sections">("newest");
  const [liveTemplate, setLiveTemplate] = useState<BuilderTemplate | null>(null);
  const [createPage] = useCreateStorePageMutation();
  const [saveDraft] = useSaveStorePageDraftMutation();
  const [applying, setApplying] = useState<string | null>(null);
  const [duplicateTemplate] = useDuplicateTemplateMutation();
  const [createTemplate] = useCreateBuilderTemplateMutation();
  const [createTemplateFromPage] = useCreateTemplateFromPageMutation();
  const [saveKind, setSaveKind] = useState<"page" | "section" | "sections" | null>(null);
  const page = useSelector((state: RootState) => state.builder.page);
  const selectedSectionId = useSelector((state: RootState) => state.builder.selectedSectionId);
  const sections = useSelector((state: RootState) => state.builder.sections);

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
    const categoryFiltered = category === "all" ? sorted : sorted.filter((template) => template.category === category);
    const collectionFiltered = collection === "mine" ? categoryFiltered.filter((template) => !template.isBuiltIn) : collection === "favorites" ? categoryFiltered.filter((template) => favorites.includes(template._id)) : collection === "recent" ? categoryFiltered.filter((template) => recent.includes(template._id)) : categoryFiltered;
    const result = !query.trim() ? collectionFiltered : collectionFiltered.filter(
      (t) =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.description?.toLowerCase().includes(query.toLowerCase()) ||
        t.category.toLowerCase().includes(query.toLowerCase()) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase())) ||
        t.industry?.toLowerCase().includes(query.toLowerCase()),
    );
    return [...result].sort((a, b) => sort === "updated" ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() : sort === "sections" ? (b.sections?.length ?? 0) - (a.sections?.length ?? 0) : sort === "popular" ? Number(b.isBuiltIn) - Number(a.isBuiltIn) : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [templatesData, query, category, collection, favorites, recent, sort]);

  const selectedTemplate = templates.find((template) => template._id === selectedId) ?? templates[0] ?? null;

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
    async (template: BuilderTemplate, mode: "page" | "sections", selectedSectionIds?: string[]) => {
      setApplying(template._id);
      try {
        if (mode === "page") {
          const title = template.name;
          const slug = template.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
          const result = await createPage({
            storeId,
            title,
            slug: slug.startsWith("/") ? slug : `/${slug}`,
          }).unwrap();
          const page = result.data?.page;
          if (page && template.sections?.length) {
            await saveDraft({ id: page._id, storeId, sections: template.sections }).unwrap();
          }
          toast.success(`Page "${template.name}" created`);
          setOpen(false);
          dispatch(setActiveTab("layers"));
          if (page) {
            dispatch(setPageMetadata({ id: page._id, title: page.title, slug: page.slug }));
            dispatch(loadSections((template.sections ?? []) as any));
            router.push(`/store/${storeSlug}/builder/${page.slug.startsWith('/') ? page.slug.slice(1) : page.slug}`);
          }
        } else {
          const sections = ((template.sections ?? []) as any[]).filter((section) => !selectedSectionIds || selectedSectionIds.includes(section.id));
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
          dispatch(setActiveTab("layers"));
        }
      } catch {
        toast.error(`Failed to ${mode === "page" ? "create page from" : "insert"} template`);
      }
      setApplying(null);
    },
    [dispatch, createPage, saveDraft, storeId, storeSlug, router],
  );

  const handleDuplicate = async (template: BuilderTemplate) => {
    try { await duplicateTemplate({ id: template._id, storeId }).unwrap(); toast.success("Template duplicated"); }
    catch { toast.error("Failed to duplicate template"); }
  };

  const handleSaveTemplate = async (details: TemplateDetails) => {
    if (!saveKind) return;
    try {
      if (saveKind === "page") {
        if (!page.id) throw new Error("No page is selected");
        await createTemplateFromPage({ storeId, pageId: page.id, ...details }).unwrap();
      } else {
        const selected = selectedSectionId ? sections.filter((section) => section.id === selectedSectionId) : [];
        const templateSections = saveKind === "section" ? selected : sections;
        if (!templateSections.length) throw new Error("Select a section or add content before saving");
        await createTemplate({ storeId, templateType: saveKind === "section" ? "section" : "page", sections: templateSections, ...details }).unwrap();
      }
      toast.success("Template saved to My Templates");
      setSaveKind(null);
      setCollection("mine");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save template");
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={() => { setOpen(false); dispatch(setActiveTab("layers")); }}
        title="Template Library"
        description="Explore layouts, preview them visually, and apply only what you need."
        size="full"
        className="!h-[calc(100vh-2rem)] !max-h-none !max-w-[calc(100vw-2rem)] rounded-2xl sm:rounded-3xl"
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 pb-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-apple-ink-muted-48" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates..."
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-apple-canvas-parchment pl-11 pr-4 text-sm outline-none focus:border-zinc-400 focus:bg-white"
            />
          </div>
          <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-xs text-apple-ink-muted-80 outline-none"><option value="newest">Newest</option><option value="popular">Popular</option><option value="updated">Recently updated</option><option value="sections">Most sections</option></select>
          <button type="button" onClick={() => setSaveKind("page")} className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800"><Save className="h-3.5 w-3.5" />Save page</button>
          </div>
          <div className="mt-3 flex items-center gap-1 overflow-x-auto border-b border-zinc-100 pb-3">
            {([ ["marketplace", "Marketplace", LayoutTemplate], ["mine", "My Templates", FolderOpen], ["favorites", "Favorites", Heart], ["recent", "Recent", FileText] ] as const).map(([id, label, Icon]) => <button key={id} type="button" onClick={() => { setCollection(id); setCategory("all"); }} className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold", collection === id ? "bg-zinc-900 text-white" : "text-apple-ink-muted-48 hover:bg-apple-canvas-parchment")}><Icon className="h-3.5 w-3.5" />{label}</button>)}
            <button type="button" onClick={() => setSaveKind(selectedSectionId ? "section" : "sections")} className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-2 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"><Plus className="h-3.5 w-3.5" />Save {selectedSectionId ? "section" : "sections"}</button>
          </div>
          <div className="mt-4 grid min-h-0 flex-1 gap-5 overflow-hidden lg:grid-cols-[190px_minmax(0,1fr)_260px]">
            <aside className="hidden overflow-y-auto border-r border-zinc-100 pr-3 lg:block"><p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-apple-ink-muted-48">Categories</p>{categoryOrder.map((item) => { const count = (templatesData?.data?.templates ?? []).filter((template) => template.category === item).length; return <button key={item} onClick={() => setCategory(item)} className={cn("mb-1 flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-xs font-medium", category === item ? "bg-zinc-100 text-apple-ink" : "text-apple-ink-muted-48 hover:bg-apple-canvas-parchment")}><span><span className="mr-1">{categoryIcons[item] || "📄"}</span>{categoryLabels[item] || item}</span><span>{count}</span></button>})}</aside>
            <div className="min-h-0 overflow-y-auto pr-1">

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
              <p className="text-sm text-apple-ink-muted-80">Failed to load templates</p>
              <p className="text-xs text-apple-ink-muted-48 mt-1">Check your connection and try again.</p>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !error && templates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <LayoutTemplate className="h-8 w-8 text-zinc-300 mb-2" />
              <p className="text-sm text-apple-ink-muted-48">No templates found</p>
              {query && <p className="text-xs text-apple-ink-muted-48 mt-1">Try a different search term.</p>}
            </div>
          )}

          {!isLoading && !error && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{templates.map((template, index) => <TemplateCard key={template._id} template={template} gradient={templateGradients[index % templateGradients.length]} onApply={handleUseTemplate} applying={applying === template._id} selected={selectedTemplate?._id === template._id} onPreview={() => { setSelectedId(template._id); setRecent((items) => [template._id, ...items.filter((id) => id !== template._id)].slice(0, 12)); }} onLiveDemo={() => setLiveTemplate(template)} favorite={favorites.includes(template._id)} onFavorite={() => setFavorites((items) => items.includes(template._id) ? items.filter((id) => id !== template._id) : [...items, template._id])} />)}</div>}
            </div>
            <aside className="hidden overflow-y-auto rounded-2xl border border-zinc-200 bg-apple-canvas-parchment/70 p-4 lg:block">{selectedTemplate ? <><div className={cn("aspect-[4/3] rounded-xl bg-gradient-to-br", templateGradients[templates.indexOf(selectedTemplate) % templateGradients.length])} /><p className="mt-4 text-sm font-semibold text-apple-ink">{selectedTemplate.name}</p><p className="mt-1 text-xs leading-5 text-apple-ink-muted-48">{selectedTemplate.description || "A responsive template ready for your store."}</p><div className="mt-4 flex flex-wrap gap-1"><span className="rounded-full bg-white px-2 py-1 text-[10px] text-apple-ink-muted-48">{selectedTemplate.category}</span><span className="rounded-full bg-white px-2 py-1 text-[10px] text-apple-ink-muted-48">{selectedTemplate.sections?.length ?? 0} sections</span><span className="rounded-full bg-white px-2 py-1 text-[10px] text-apple-ink-muted-48">Responsive</span></div><button onClick={() => handleUseTemplate(selectedTemplate, "sections")} className="mt-5 w-full rounded-xl bg-zinc-900 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800">Insert into current page</button><button onClick={() => handleUseTemplate(selectedTemplate, "page")} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white py-2.5 text-xs font-semibold text-apple-ink-muted-80 hover:bg-apple-canvas-parchment">Create new page</button></> : <p className="text-xs text-apple-ink-muted-48">Select a template to preview it.</p>}</aside>
          </div>
        </div>
      </Modal>
      {liveTemplate && <TemplateLivePreview template={liveTemplate} store={store as any} onClose={() => setLiveTemplate(null)} onApply={handleUseTemplate} onDuplicate={handleDuplicate} />}
      {saveKind && <SaveTemplateDialog kind={saveKind} onClose={() => setSaveKind(null)} onSave={handleSaveTemplate} />}
    </>
  );
}

function TemplateCard({
  template,
  gradient,
  onApply,
  applying,
  selected,
  onPreview,
  onLiveDemo,
  favorite,
  onFavorite,
}: {
  template: BuilderTemplate;
  gradient: string;
  onApply: (template: BuilderTemplate, mode: "page" | "sections") => void;
  applying: boolean;
  selected: boolean;
  onPreview: () => void;
  onLiveDemo: () => void;
  favorite: boolean;
  onFavorite: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const sectionCount = template.sections?.length ?? 0;

  return (
    <div onClick={onPreview} className={cn("group relative cursor-pointer rounded-2xl border bg-white p-3 transition-all hover:-translate-y-1 hover:shadow-lg", selected ? "border-blue-300 ring-2 ring-blue-100" : "border-zinc-200") }>
      {/* Thumbnail */}
      <div className={`aspect-[16/10] rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
        {template.thumbnail ? (
          <img src={template.thumbnail} alt={template.name} className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-zinc-950/45 opacity-0 transition duration-200 group-hover:opacity-100">
          <button type="button" onClick={(event) => { event.stopPropagation(); onLiveDemo(); }} className="rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-bold text-apple-ink"><Eye className="mr-1 inline h-3 w-3" />Live demo</button>
          <button type="button" onClick={(event) => { event.stopPropagation(); onApply(template, "sections"); }} className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-[10px] font-bold text-white"><Layers className="mr-1 inline h-3 w-3" />Insert</button>
        </div>
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
            <p className="text-sm font-medium text-apple-ink truncate">{template.name}</p>
            <p className="text-xs text-apple-ink-muted-48 mt-0.5 line-clamp-2">{template.description || "No description"}</p>
          </div>
          <button type="button" onClick={(event) => { event.stopPropagation(); onFavorite(); }} className={cn("rounded-lg p-1.5", favorite ? "text-rose-500" : "text-apple-ink-muted-48 hover:bg-apple-canvas-parchment")}><Heart className="h-3.5 w-3.5" fill={favorite ? "currentColor" : "none"} /></button>
        </div>

        {/* Action buttons */}
        <div className="mt-3.5 flex items-center gap-2">
          <button
            onClick={(event) => { event.stopPropagation(); onApply(template, "page"); }}
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
            onClick={(event) => { event.stopPropagation(); onApply(template, "sections"); }}
            disabled={applying}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-[11px] font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment disabled:opacity-50 transition-all"
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

function TemplateLivePreview({ template, store, onClose, onApply, onDuplicate }: { template: BuilderTemplate; store: any; onClose: () => void; onApply: (template: BuilderTemplate, mode: "page" | "sections", selectedSectionIds?: string[]) => void; onDuplicate: (template: BuilderTemplate) => void }) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [dark, setDark] = useState(false);
  const sections = (template.sections ?? []) as Array<{ id: string; type: string; label?: string; visible?: boolean; props?: Record<string, string> }>;
  const [selected, setSelected] = useState<string[]>(sections.map((section) => section.id));
  const width = device === "mobile" ? 390 : device === "tablet" ? 820 : 1280;
  const toggle = (id: string) => setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const scrollToSection = (id: string) => document.querySelector(`[data-builder-section-id="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  return <Modal open onClose={onClose} title={template.name} description="Live template preview — changes stay inside Builder." size="full" className="!h-[92vh] !max-w-[min(1800px,96vw)]">
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3"><div className="flex rounded-xl border border-zinc-200 bg-white p-1">{[["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]].map(([id, Icon]) => { const DeviceIcon = Icon as typeof Monitor; return <button key={id as string} onClick={() => setDevice(id as "desktop" | "tablet" | "mobile")} className={cn("rounded-lg px-2.5 py-1.5 text-xs", device === id ? "bg-zinc-900 text-white" : "text-apple-ink-muted-48 hover:bg-apple-canvas-parchment")}><DeviceIcon className="mr-1 inline h-3.5 w-3.5" />{id as string}</button>})}</div><div className="flex gap-2"><button onClick={() => setDark((value) => !value)} className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs text-apple-ink-muted-80">{dark ? <Sun className="mr-1 inline h-3.5 w-3.5" /> : <Moon className="mr-1 inline h-3.5 w-3.5" />}{dark ? "Light" : "Dark"}</button><button onClick={() => onDuplicate(template)} className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs text-apple-ink-muted-80"><Copy className="mr-1 inline h-3.5 w-3.5" />Duplicate</button><button onClick={() => onApply(template, "sections", selected)} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">Insert selected</button><button onClick={() => onApply(template, "page")} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white">Create page</button></div></div>
      <div className="mt-3 grid min-h-0 flex-1 gap-3 lg:grid-cols-[200px_minmax(0,1fr)]"><aside className="overflow-y-auto rounded-xl border border-zinc-200 bg-apple-canvas-parchment p-2"><p className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-apple-ink-muted-48">Sections</p>{sections.map((section, index) => <div key={section.id} className="mb-1 flex items-center gap-1 rounded-lg hover:bg-white"><button onClick={() => toggle(section.id)} className="p-1.5 text-blue-600"><CheckSquare className="h-3.5 w-3.5" fill={selected.includes(section.id) ? "currentColor" : "none"} /></button><button onClick={() => scrollToSection(section.id)} className="min-w-0 flex-1 truncate px-1 py-1.5 text-left text-xs text-apple-ink-muted-80">{section.label || section.type || `Section ${index + 1}`}</button></div>)}</aside><div className="overflow-auto rounded-xl bg-zinc-200 p-3"><div className="mx-auto min-h-full overflow-hidden bg-white shadow-xl transition-all" style={{ width, maxWidth: "100%", backgroundColor: dark ? "#09090b" : "#fff" }}><StorefrontFrame store={store} theme={{ ...store.theme, darkMode: dark }} products={[]} categories={[]} settings={{ currencyCode: "BDT", currencySymbol: "৳", currencyPosition: "before", locale: "en-BD", decimalPlaces: 2, taxRate: 0 }} sliders={[]} pageSections={sections} builderMode={false}><StorefrontCanvas sections={sections} /></StorefrontFrame></div></div></div>
    </div>
  </Modal>;
}

type TemplateDetails = {
  name: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  tags?: string[];
  industry?: string;
  colorTheme?: string;
  notes?: string;
  folder?: string;
  visibility?: "private" | "team" | "public";
};

function SaveTemplateDialog({ kind, onClose, onSave }: { kind: "page" | "section" | "sections"; onClose: () => void; onSave: (details: TemplateDetails) => Promise<void> }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [category, setCategory] = useState("custom");
  const [tags, setTags] = useState("");
  const [industry, setIndustry] = useState("");
  const [colorTheme, setColorTheme] = useState("");
  const [notes, setNotes] = useState("");
  const [folder, setFolder] = useState("");
  const [visibility, setVisibility] = useState<"private" | "team" | "public">("private");
  const [saving, setSaving] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ name: name.trim(), description, thumbnail, category, tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean), industry, colorTheme, notes, folder, visibility });
    setSaving(false);
  };
  const input = "mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400";
  return <Modal open onClose={onClose} title={`Save ${kind === "page" ? "page" : kind === "section" ? "section" : "sections"} as template`} description="Reusable templates are private by default and remain scoped to this store." size="md">
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <label className="sm:col-span-2 text-xs font-medium text-apple-ink-muted-80">Template name<input required autoFocus value={name} onChange={(event) => setName(event.target.value)} className={input} placeholder="Summer campaign" /></label>
      <label className="sm:col-span-2 text-xs font-medium text-apple-ink-muted-80">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} className={input} rows={2} placeholder="What makes this layout useful?" /></label>
      <label className="text-xs font-medium text-apple-ink-muted-80">Category<input value={category} onChange={(event) => setCategory(event.target.value)} className={input} placeholder="Landing page" /></label>
      <label className="text-xs font-medium text-apple-ink-muted-80">Tags<input value={tags} onChange={(event) => setTags(event.target.value)} className={input} placeholder="sale, modern, hero" /></label>
      <label className="text-xs font-medium text-apple-ink-muted-80">Industry<input value={industry} onChange={(event) => setIndustry(event.target.value)} className={input} placeholder="Fashion" /></label>
      <label className="text-xs font-medium text-apple-ink-muted-80">Color theme<input value={colorTheme} onChange={(event) => setColorTheme(event.target.value)} className={input} placeholder="Warm neutral" /></label>
      <label className="sm:col-span-2 text-xs font-medium text-apple-ink-muted-80">Folder<input value={folder} onChange={(event) => setFolder(event.target.value)} className={input} placeholder="Campaigns / Summer" /></label>
      <label className="sm:col-span-2 text-xs font-medium text-apple-ink-muted-80">Thumbnail URL (optional)<input type="url" value={thumbnail} onChange={(event) => setThumbnail(event.target.value)} className={input} placeholder="https://…" /></label>
      <label className="text-xs font-medium text-apple-ink-muted-80">Visibility<select value={visibility} onChange={(event) => setVisibility(event.target.value as typeof visibility)} className={input}><option value="private">Private</option><option value="team">Team shared</option><option value="public">Public</option></select></label>
      <label className="text-xs font-medium text-apple-ink-muted-80">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} className={input} rows={2} placeholder="Internal notes" /></label>
      <div className="sm:col-span-2 flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment">Cancel</button><button disabled={saving || !name.trim()} className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save template"}</button></div>
    </form>
  </Modal>;
}
