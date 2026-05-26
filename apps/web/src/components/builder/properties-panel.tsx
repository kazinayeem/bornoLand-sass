"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { updateSectionProps, setSelectedSection } from "@/redux/slices/builder-slice";
import { X, Image, Palette, Type, Layers, AlignLeft, Eye, EyeOff, Square, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

type PropControl = {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "color" | "image" | "number" | "toggle";
  options?: { value: string; label: string }[];
  placeholder?: string;
};

const styleControls: PropControl[] = [
  { key: "style_borderRadius", label: "Border Radius", type: "select", options: [
    { value: "0", label: "None" }, { value: "8", label: "Small" },
    { value: "12", label: "Medium" }, { value: "16", label: "Large" },
    { value: "24", label: "X-Large" }, { value: "9999", label: "Full" },
  ]},
  { key: "style_shadow", label: "Shadow", type: "select", options: [
    { value: "none", label: "None" }, { value: "sm", label: "Small" },
    { value: "md", label: "Medium" }, { value: "lg", label: "Large" },
    { value: "xl", label: "X-Large" },
  ]},
  { key: "style_paddingTop", label: "Padding Top", type: "select", options: [
    { value: "0", label: "None" }, { value: "16", label: "Small" },
    { value: "32", label: "Medium" }, { value: "48", label: "Large" },
    { value: "64", label: "X-Large" },
  ]},
  { key: "style_paddingBottom", label: "Padding Bottom", type: "select", options: [
    { value: "0", label: "None" }, { value: "16", label: "Small" },
    { value: "32", label: "Medium" }, { value: "48", label: "Large" },
    { value: "64", label: "X-Large" },
  ]},
  { key: "style_fontSize", label: "Font Size", type: "select", options: [
    { value: "default", label: "Default" }, { value: "sm", label: "Small" },
    { value: "lg", label: "Large" }, { value: "xl", label: "X-Large" },
    { value: "2xl", label: "2X-Large" },
  ]},
  { key: "style_fontWeight", label: "Font Weight", type: "select", options: [
    { value: "default", label: "Default" }, { value: "normal", label: "Normal" },
    { value: "medium", label: "Medium" }, { value: "semibold", label: "Semibold" },
    { value: "bold", label: "Bold" },
  ]},
  { key: "style_textColor", label: "Text Color", type: "color" },
];

const sectionControls: Record<string, PropControl[]> = {
  hero: [
    { key: "imageUrl", label: "Background Image URL", type: "image", placeholder: "https://...desktop.jpg" },
    { key: "mobileImageUrl", label: "Mobile Image URL", type: "image", placeholder: "https://...mobile.jpg" },
    { key: "kicker", label: "Kicker / Badge", type: "text", placeholder: "Welcome to Store" },
    { key: "headline", label: "Headline", type: "text", placeholder: "Your main headline" },
    { key: "subheadline", label: "Subheadline", type: "textarea", placeholder: "Supporting text" },
    { key: "buttonText", label: "Button Text", type: "text", placeholder: "Shop Now" },
    { key: "buttonLink", label: "Button Link", type: "text", placeholder: "/shop" },
    { key: "secondaryButtonText", label: "Secondary Button Text", type: "text", placeholder: "Learn More" },
    { key: "secondaryButtonLink", label: "Secondary Button Link", type: "text", placeholder: "/about" },
    { key: "overlayColor", label: "Overlay Color", type: "color" },
    { key: "overlayOpacity", label: "Overlay Opacity", type: "number" },
    { key: "textAlignment", label: "Text Alignment", type: "select", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] },
    { key: "heroHeight", label: "Hero Height", type: "select", options: [{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }] },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "backgroundGradient", label: "Gradient (e.g. #000→#333)", type: "text", placeholder: "#000000,#333333" },
  ],
  features: [
    { key: "title", label: "Section Title", type: "text", placeholder: "Shop by Category" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Browse our collections" },
    { key: "gridColumns", label: "Grid Columns", type: "select", options: [{ value: "2", label: "2 Columns" }, { value: "3", label: "3 Columns" }, { value: "4", label: "4 Columns" }] },
    { key: "cardStyle", label: "Card Style", type: "select", options: [{ value: "default", label: "Default" }, { value: "minimal", label: "Minimal" }, { value: "bordered", label: "Bordered" }] },
    { key: "backgroundColor", label: "Background Color", type: "color" },
  ],
  products: [
    { key: "title", label: "Section Title", type: "text", placeholder: "Featured Products" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Our best sellers" },
    { key: "gridColumns", label: "Grid Columns", type: "select", options: [{ value: "2", label: "2 Columns" }, { value: "3", label: "3 Columns" }, { value: "4", label: "4 Columns" }] },
    { key: "layout", label: "Layout", type: "select", options: [{ value: "grid", label: "Grid" }, { value: "carousel", label: "Carousel" }] },
    { key: "showBadges", label: "Show Badges", type: "toggle" },
    { key: "showRatings", label: "Show Ratings", type: "toggle" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
  ],
  testimonials: [
    { key: "title", label: "Section Title", type: "text", placeholder: "What Customers Say" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Hear from our customers" },
    { key: "layout", label: "Layout", type: "select", options: [{ value: "grid", label: "Grid" }, { value: "carousel", label: "Carousel / Slider" }] },
    { key: "cardStyle", label: "Card Style", type: "select", options: [{ value: "default", label: "Default" }, { value: "bordered", label: "Bordered" }, { value: "elevated", label: "Elevated" }] },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "avatarStyle", label: "Avatar Style", type: "select", options: [{ value: "circle", label: "Circle" }, { value: "square", label: "Square" }, { value: "none", label: "None" }] },
  ],
  cta: [
    { key: "headline", label: "Headline", type: "text", placeholder: "Stay in the Loop" },
    { key: "subtitle", label: "Subtitle", type: "textarea", placeholder: "Subscribe to our newsletter" },
    { key: "buttonText", label: "Button Text", type: "text", placeholder: "Subscribe" },
    { key: "buttonLink", label: "Button Link", type: "text", placeholder: "#" },
    { key: "inputPlaceholder", label: "Input Placeholder", type: "text", placeholder: "Enter your email" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "backgroundImage", label: "Background Image URL", type: "image", placeholder: "https://..." },
  ],
  footer: [
    { key: "copyright", label: "Copyright Text", type: "text", placeholder: "© 2026 Your Store" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "showSocialLinks", label: "Show Social Links", type: "toggle" },
    { key: "contactEmail", label: "Contact Email", type: "text", placeholder: "hello@example.com" },
    { key: "contactPhone", label: "Contact Phone", type: "text", placeholder: "+1 (555) 123-4567" },
    { key: "contactAddress", label: "Contact Address", type: "text", placeholder: "123 Commerce St" },
  ],
  announcement: [
    { key: "text", label: "Announcement Text", type: "text", placeholder: "Free shipping on orders over $50!" },
    { key: "link", label: "Link URL", type: "text", placeholder: "/shop" },
    { key: "linkText", label: "Link Text", type: "text", placeholder: "Shop Now" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "textColor", label: "Text Color", type: "color" },
    { key: "showClose", label: "Show Close Button", type: "toggle" },
  ],
  "image-banner": [
    { key: "imageUrl", label: "Banner Image URL", type: "image", placeholder: "https://..." },
    { key: "headline", label: "Headline", type: "text", placeholder: "New Collection" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Discover our latest" },
    { key: "buttonText", label: "Button Text", type: "text", placeholder: "Explore" },
    { key: "buttonLink", label: "Button Link", type: "text", placeholder: "/shop" },
    { key: "overlayOpacity", label: "Overlay Opacity", type: "number" },
    { key: "textAlignment", label: "Text Alignment", type: "select", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] },
  ],
  "flash-sale": [
    { key: "title", label: "Title", type: "text", placeholder: "Flash Sale" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Limited time offers" },
    { key: "endDate", label: "End Date (ISO)", type: "text", placeholder: "2026-12-31T23:59:59Z" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "textColor", label: "Text Color", type: "color" },
    { key: "accentColor", label: "Accent Color", type: "color" },
  ],
  countdown: [
    { key: "title", label: "Title", type: "text", placeholder: "Big Sale Coming" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Get ready" },
    { key: "targetDate", label: "Target Date (ISO)", type: "text", placeholder: "2026-12-31T23:59:59Z" },
    { key: "message", label: "Message", type: "text", placeholder: "Sale ends in:" },
    { key: "buttonText", label: "Button Text", type: "text", placeholder: "Notify Me" },
    { key: "buttonLink", label: "Button Link", type: "text", placeholder: "#" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "textColor", label: "Text Color", type: "color" },
    { key: "accentColor", label: "Accent Color", type: "color" },
  ],
  "multi-banner": [
    { key: "columns", label: "Columns", type: "select", options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }] },
    { key: "gap", label: "Gap", type: "select", options: [{ value: "2", label: "Small" }, { value: "4", label: "Medium" }, { value: "6", label: "Large" }] },
    { key: "borderRadius", label: "Border Radius", type: "select", options: [{ value: "8", label: "Small" }, { value: "12", label: "Medium" }, { value: "16", label: "Large" }, { value: "24", label: "X-Large" }] },
  ],
  collection: [
    { key: "title", label: "Title", type: "text", placeholder: "Collection Spotlight" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Curated just for you" },
    { key: "imageUrl", label: "Banner Image URL", type: "image", placeholder: "https://..." },
    { key: "buttonText", label: "Button Text", type: "text", placeholder: "View Collection" },
    { key: "buttonLink", label: "Button Link", type: "text", placeholder: "/shop" },
    { key: "layout", label: "Layout", type: "select", options: [{ value: "left", label: "Image Left" }, { value: "right", label: "Image Right" }] },
    { key: "backgroundColor", label: "Background Color", type: "color" },
  ],
  video: [
    { key: "videoUrl", label: "Video URL", type: "text", placeholder: "https://youtube.com/watch?v=..." },
    { key: "posterUrl", label: "Poster Image URL", type: "image", placeholder: "https://..." },
    { key: "title", label: "Title", type: "text", placeholder: "Featured Video" },
    { key: "caption", label: "Caption", type: "text", placeholder: "Learn more" },
    { key: "buttonText", label: "Button Text", type: "text", placeholder: "Learn More" },
    { key: "buttonLink", label: "Button Link", type: "text", placeholder: "#" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
  ],
  faq: [
    { key: "title", label: "Title", type: "text", placeholder: "FAQ" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Everything you need" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "items", label: "FAQ Items (JSON)", type: "textarea", placeholder: '[{"q":"Question?","a":"Answer."}]' },
  ],
  "feature-cards": [
    { key: "title", label: "Title", type: "text", placeholder: "Why Choose Us" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "We deliver quality" },
    { key: "columns", label: "Columns", type: "select", options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }] },
    { key: "backgroundColor", label: "Background Color", type: "color" },
  ],
  stats: [
    { key: "title", label: "Title", type: "text", placeholder: "Our Numbers" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Trusted by thousands" },
    { key: "stat1label", label: "Stat 1 Label", type: "text", placeholder: "Products" },
    { key: "stat1value", label: "Stat 1 Value", type: "text", placeholder: "10K+" },
    { key: "stat2label", label: "Stat 2 Label", type: "text", placeholder: "Customers" },
    { key: "stat2value", label: "Stat 2 Value", type: "text", placeholder: "50K+" },
    { key: "stat3label", label: "Stat 3 Label", type: "text", placeholder: "Reviews" },
    { key: "stat3value", label: "Stat 3 Value", type: "text", placeholder: "25K+" },
    { key: "stat4label", label: "Stat 4 Label", type: "text", placeholder: "Countries" },
    { key: "stat4value", label: "Stat 4 Value", type: "text", placeholder: "30+" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "textColor", label: "Text Color", type: "color" },
    { key: "accentColor", label: "Accent Color", type: "color" },
  ],
  "brand-logos": [
    { key: "title", label: "Title", type: "text", placeholder: "Trusted By" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Brands that love us" },
    { key: "layout", label: "Layout", type: "select", options: [{ value: "carousel", label: "Carousel" }, { value: "grid", label: "Grid" }] },
    { key: "backgroundColor", label: "Background Color", type: "color" },
  ],
};

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 cursor-pointer rounded border border-zinc-200 p-0.5" />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="h-7 flex-1 rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
    </div>
  );
}

function ImageUrlInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-7 flex-1 rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
        {value && (
          <button onClick={() => setPreview(!preview)}
            className="shrink-0 rounded p-0.5 text-zinc-400 hover:text-zinc-600">
            {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
      {preview && value && (
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <img src={value} alt="preview" className="h-20 w-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      )}
    </div>
  );
}

export function PropertiesPanel() {
  const dispatch = useDispatch();
  const selectedId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const section = useSelector((s: RootState) =>
    s.builder.sections.find((sec) => sec.id === selectedId)
  );

  if (!section) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xs text-zinc-400">Select a section to edit</p>
        </div>
      </div>
    );
  }

  const handlePropChange = (key: string, value: string) => {
    dispatch(updateSectionProps({ id: section.id, props: { ...section.props, [key]: value } }));
  };

  const controls = sectionControls[section.type] ?? [];
  const [showStyle, setShowStyle] = useState(true);

  const renderControl = (control: PropControl) => {
    const val = (section.props[control.key] as string) ?? "";

    if (control.type === "image") {
      return (
        <div key={control.key} className="px-4 py-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
            <Image className="h-3 w-3" /> {control.label}
          </label>
          <ImageUrlInput value={val} onChange={(v) => handlePropChange(control.key, v)} placeholder={control.placeholder} />
        </div>
      );
    }

    if (control.type === "color") {
      return (
        <div key={control.key} className="px-4 py-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
            <Palette className="h-3 w-3" /> {control.label}
          </label>
          <ColorInput value={val} onChange={(v) => handlePropChange(control.key, v)} />
        </div>
      );
    }

    if (control.type === "select") {
      return (
        <div key={control.key} className="px-4 py-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
            <AlignLeft className="h-3 w-3" /> {control.label}
          </label>
          <select value={val || (control.options?.[0]?.value ?? "")}
            onChange={(e) => handlePropChange(control.key, e.target.value)}
            className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 focus:border-zinc-400 focus:outline-none">
            {control.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    }

    if (control.type === "toggle") {
      const isOn = val === "true";
      return (
        <div key={control.key} className="flex items-center justify-between px-4 py-3">
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
            {control.label}
          </label>
          <button onClick={() => handlePropChange(control.key, isOn ? "false" : "true")}
            className={`relative h-5 w-9 rounded-full transition-colors ${isOn ? "bg-zinc-900" : "bg-zinc-200"}`}>
            <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isOn ? "translate-x-4" : "translate-x-0"}`} />
          </button>
        </div>
      );
    }

    if (control.type === "number") {
      return (
        <div key={control.key} className="px-4 py-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
            <Type className="h-3 w-3" /> {control.label}
          </label>
          <input type="number" value={val} onChange={(e) => handlePropChange(control.key, e.target.value)}
            placeholder={control.placeholder}
            className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
        </div>
      );
    }

    return (
      <div key={control.key} className="px-4 py-3">
        <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
          {control.key === "headline" || control.key === "subheadline" || control.key === "kicker" ? <Type className="h-3 w-3" /> : null}
          {control.label}
        </label>
        {control.type === "textarea" ? (
          <textarea value={val} onChange={(e) => handlePropChange(control.key, e.target.value)}
            placeholder={control.placeholder} rows={3}
            className="h-auto min-h-[56px] w-full resize-none rounded-lg border border-zinc-200 bg-transparent px-2 py-1.5 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
        ) : (
          <input type="text" value={val} onChange={(e) => handlePropChange(control.key, e.target.value)}
            placeholder={control.placeholder}
            className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 border-b border-zinc-100 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100">
              <Layers className="h-3 w-3 text-zinc-500" />
            </div>
            <p className="text-xs font-semibold text-zinc-900">{section.label}</p>
          </div>
          <button onClick={() => dispatch(setSelectedSection(null))}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="divide-y divide-zinc-100">
        {controls.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-xs text-zinc-400">No editable properties for this section</p>
          </div>
        )}
        {controls.map((control) => renderControl(control))}
      </div>

      <button onClick={() => setShowStyle(!showStyle)}
        className="flex w-full items-center gap-2 border-b border-t border-zinc-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 hover:bg-zinc-50">
        <Square className="h-3 w-3" />
        Style
        {showStyle ? <ChevronDown className="ml-auto h-3 w-3" /> : <ChevronRight className="ml-auto h-3 w-3" />}
      </button>

      {showStyle && (
        <div className="divide-y divide-zinc-100">
          {styleControls.map((control) => {
            const val = (section.props[control.key] as string) ?? "";
            if (control.type === "color") {
              return (
                <div key={control.key} className="px-4 py-3">
                  <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                    <Palette className="h-3 w-3" /> {control.label}
                  </label>
                  <ColorInput value={val} onChange={(v) => handlePropChange(control.key, v)} />
                </div>
              );
            }
            if (control.type === "select") {
              return (
                <div key={control.key} className="px-4 py-3">
                  <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                    <AlignLeft className="h-3 w-3" /> {control.label}
                  </label>
                  <select value={val || (control.options?.[0]?.value ?? "")}
                    onChange={(e) => handlePropChange(control.key, e.target.value)}
                    className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 focus:border-zinc-400 focus:outline-none">
                    {control.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
