"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { updateSectionProps, setSelectedSection } from "@/redux/slices/builder-slice";
import { X, Image, Palette, Type, Layers, AlignLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PropControl = {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "color" | "image" | "number" | "toggle";
  options?: { value: string; label: string }[];
  placeholder?: string;
};

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
        {controls.map((control) => {
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
        })}
      </div>

      {controls.length === 0 && (
        <div className="p-4 text-center">
          <p className="text-xs text-zinc-400">No editable properties for this section</p>
        </div>
      )}
    </div>
  );
}
