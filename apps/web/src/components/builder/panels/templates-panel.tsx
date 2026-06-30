"use client";

import { LayoutTemplate, Plus } from "lucide-react";
import { sectionCategories, sectionRegistry } from "@/lib/section-registry";
import { useDispatch } from "react-redux";
import { addSection, setActiveTab } from "@/redux/slices/builder-slice";
import { getDefaultProps } from "@/lib/section-registry";

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

  return (
    <div className="p-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Templates</p>
      <div className="space-y-2">
        {templateGroups.map((group) => (
          <div key={group.label} className="rounded-2xl border border-zinc-100 p-3">
            <div className="mb-2 flex items-center gap-2">
              <LayoutTemplate className="h-4 w-4 text-zinc-400" />
              <p className="text-sm font-semibold text-zinc-800">{group.label}</p>
            </div>
            <div className="space-y-1">
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
                    dispatch(setActiveTab("sections"));
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  <span>{section.label}</span>
                  <Plus className="h-3.5 w-3.5 text-zinc-300" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
