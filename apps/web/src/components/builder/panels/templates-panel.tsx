"use client";

import { useMemo, useState } from "react";
import { LayoutTemplate, Plus, Search } from "lucide-react";
import { sectionRegistry } from "@/lib/section-registry";
import { useDispatch } from "react-redux";
import { addSection } from "@/redux/slices/builder-slice";
import { getDefaultProps } from "@/lib/section-registry";
import { Modal } from "@/components/ui/modal";

const templateGroups = [
  { label: "Landing", match: ["hero-banner", "split-hero", "fullscreen-hero"] },
  { label: "Product Grid", match: ["featured-products", "product-grid", "product-carousel"] },
  { label: "Gallery", match: ["gallery", "image-grid", "image-banner"] },
  { label: "FAQ", match: ["faq", "accordion"] },
  { label: "Newsletter", match: ["newsletter", "email-capture"] },
  { label: "Footer", match: ["simple-footer", "ecommerce-footer"] },
  { label: "Testimonials", match: ["testimonials"] },
];

export function TemplatesPanel() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return templateGroups;
    return templateGroups.filter((group) =>
      group.label.toLowerCase().includes(normalized) ||
      sectionRegistry.some((section) => group.match.includes(section.type) && section.label.toLowerCase().includes(normalized)),
    );
  }, [query]);

  return (
    <>
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Templates</p>
        <h2 className="mt-1 text-sm font-semibold text-zinc-900">Open focused starter layouts</h2>
        <p className="mt-1 text-xs leading-5 text-zinc-500">Use the gallery only when you need it, then return to the canvas.</p>
        <div className="mt-4 rounded-3xl border border-zinc-100 bg-zinc-50/70 p-4">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-zinc-400" />
            <div>
              <p className="text-sm font-medium text-zinc-900">Template Gallery</p>
              <p className="text-xs text-zinc-500">Large previews, categories, and quick insert.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-4 rounded-2xl bg-zinc-900 px-3 py-2 text-[11px] font-medium text-white"
          >
            Open Fullscreen Gallery
          </button>
        </div>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Template Gallery"
        description="Browse reusable layouts without keeping template controls on screen."
        size="full"
      >
        <div className="space-y-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search templates..."
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 text-sm outline-none focus:border-zinc-400 focus:bg-white"
            />
          </div>
          <div className="space-y-5">
            {filteredGroups.map((group) => (
              <div key={group.label}>
                <h3 className="mb-3 text-sm font-semibold text-zinc-900">{group.label}</h3>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {sectionRegistry.filter((section) => group.match.includes(section.type)).map((section) => (
                    <button
                      key={section.type}
                      type="button"
                      onClick={() => {
                        dispatch(addSection({
                          id: `${section.type}-${Date.now()}`,
                          type: section.type,
                          label: section.label,
                          visible: true,
                          props: getDefaultProps(section.type),
                        }));
                        setOpen(false);
                      }}
                      className="rounded-[1.75rem] border border-zinc-100 bg-zinc-50/70 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-zinc-200 hover:bg-white hover:shadow-sm"
                    >
                      <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-zinc-100 via-white to-zinc-100" />
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{section.label}</p>
                          <p className="text-xs text-zinc-500">{group.label} starter</p>
                        </div>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-zinc-500 shadow-sm">Insert</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
