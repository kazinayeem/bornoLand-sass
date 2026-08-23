"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setHeaderSettings } from "@/redux/slices/builder-slice";
import { applyHeaderTemplateSelection, resolveHeaderTemplateId } from "@/lib/storefront/global-navigation";
import {
  ChevronDown,
  Check,
  PanelTop,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

function Section({ label, children, defaultOpen = true }: { label: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-100 pb-3 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-semibold text-apple-ink-muted-80 hover:text-apple-ink"
      >
        {label}
        <ChevronDown className={`h-3 w-3 text-apple-ink-muted-48 transition-transform ${open ? "rotate-0" : "-rotate-90"}`} />
      </button>
      {open && <div className="space-y-3 px-4 pb-2">{children}</div>}
    </div>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-apple-ink-muted-80">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${value ? "bg-zinc-900" : "bg-zinc-200"}`}
      >
        <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-4" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

function SelectInput({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label: string }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium text-apple-ink-muted-48 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-apple-ink-muted-80 focus:border-zinc-400 focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function TextInput({ value, onChange, label, placeholder }: { value: string; onChange: (v: string) => void; label: string; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium text-apple-ink-muted-48 uppercase tracking-wider">{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-apple-ink-muted-80 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none"
      />
    </div>
  );
}

import { HEADER_TEMPLATE_LIST } from "@/components/storefront/header/header-template-registry";

export function HeaderBuilderSettings() {
  const dispatch = useDispatch();
  const headerSettings = useSelector((state: RootState) => state.builder.headerSettings);

  const activeTemplate = resolveHeaderTemplateId(
    headerSettings as Record<string, unknown>,
    "modern-ecommerce",
  );
  const isEnabled = headerSettings.enabled !== false && headerSettings.visible !== false;

  const update = (key: string, value: unknown) => {
    dispatch(setHeaderSettings({ ...headerSettings, [key]: value }));
  };

  const updateMany = (patch: Record<string, unknown>) => {
    dispatch(setHeaderSettings({ ...headerSettings, ...patch }));
  };

  const selectTemplate = (templateId: string) => {
    // Preserve navigation config — only change visual template identity
    dispatch(
      setHeaderSettings(
        applyHeaderTemplateSelection(headerSettings as Record<string, unknown>, templateId) as any,
      ),
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <div>
          <h3 className="text-xs font-semibold text-apple-ink">Global Header Settings</h3>
          <p className="text-[10px] text-apple-ink-muted-48">Single source of truth for header configuration</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
        {/* Header Visibility */}
        <div className="p-4 bg-zinc-50/50 space-y-3">
          <Toggle
            label="Enable Global Header"
            value={isEnabled}
            onChange={(v) => updateMany({ enabled: v, visible: v })}
          />
          {!isEnabled && (
            <p className="text-[10px] text-rose-500 font-medium">
              Header is disabled. No header will be rendered on the storefront.
            </p>
          )}
        </div>

        <Section label="Select Header Template (10 Designs)">
          <div className="space-y-2">
            {HEADER_TEMPLATE_LIST.map((tpl, index) => {
              const isSelected = activeTemplate === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => selectTemplate(tpl.id)}
                  className={cn(
                    "cursor-pointer rounded-xl border p-2.5 transition-all text-left",
                    isSelected
                      ? "border-zinc-900 bg-zinc-900 text-white shadow-xs"
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs font-bold", isSelected ? "text-white" : "text-zinc-900")}>
                      {index + 1}. {tpl.name}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full text-white">
                        <Check className="h-3 w-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className={cn("text-[11px] mt-1 leading-snug", isSelected ? "text-zinc-300" : "text-zinc-500")}>
                    {tpl.description}
                  </p>
                  <span className={cn("inline-block text-[9px] font-semibold uppercase tracking-wider mt-1.5 px-1.5 py-0.5 rounded", isSelected ? "bg-white/15 text-zinc-200" : "bg-zinc-100 text-zinc-600")}>
                    {tpl.tag}
                  </span>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Position & Behavior */}
        <Section label="Position & Scrolling Behavior">
          <SelectInput
            label="Position Mode"
            value={headerSettings.position ?? (headerSettings.sticky === false ? "static" : "sticky")}
            onChange={(v) => {
              updateMany({
                position: v,
                sticky: v === "sticky" || v === "fixed",
              });
            }}
            options={[
              { value: "static", label: "Static (Scrolls with page)" },
              { value: "sticky", label: "Sticky (Sticks to top)" },
              { value: "fixed", label: "Fixed (Permanent overlay + auto-spacer)" },
            ]}
          />
          <Toggle
            label="Auto-Hide On Scroll Down"
            value={headerSettings.autoHideOnScroll === true}
            onChange={(v) => update("autoHideOnScroll", v)}
          />
          <Toggle
            label="Transparent Header"
            value={headerSettings.transparent === true}
            onChange={(v) => update("transparent", v)}
          />
        </Section>

        {/* Feature Toggles */}
        <Section label="Header Actions & Toggles">
          <Toggle
            label="Show Search Bar"
            value={headerSettings.showSearch !== false}
            onChange={(v) => update("showSearch", v)}
          />
          <Toggle
            label="Show Shopping Cart"
            value={headerSettings.showCart !== false}
            onChange={(v) => update("showCart", v)}
          />
          <Toggle
            label="Show Wishlist"
            value={headerSettings.showWishlist !== false}
            onChange={(v) => update("showWishlist", v)}
          />
          <Toggle
            label="Show User Profile / Login"
            value={headerSettings.showProfile !== false}
            onChange={(v) => update("showProfile", v)}
          />
          <Toggle
            label="Show Announcement Top Bar"
            value={headerSettings.showAnnouncement !== false}
            onChange={(v) => update("showAnnouncement", v)}
          />
        </Section>

        {/* Category Navigation Settings */}
        <Section label="Category Navigation & Limit">
          <SelectInput
            label="Maximum Visible Navigation Items"
            value={String(
              headerSettings.maxVisibleNavigationItems ??
                headerSettings.maxVisibleCategories ??
                6,
            )}
            onChange={(v) => {
              const n = Number(v);
              dispatch(
                setHeaderSettings({
                  ...headerSettings,
                  maxVisibleCategories: n,
                  maxVisibleNavigationItems: n,
                  maxVisibleItems: n,
                }),
              );
            }}
            options={[
              { value: "3", label: "3 Items" },
              { value: "4", label: "4 Items" },
              { value: "5", label: "5 Items" },
              { value: "6", label: "6 Items (Recommended)" },
              { value: "7", label: "7 Items" },
              { value: "8", label: "8 Items" },
              { value: "10", label: "10 Items" },
            ]}
          />
          <p className="text-[10px] text-apple-ink-muted-48 leading-relaxed">
            Shared by all header templates. Remaining categories open in More ▾. Switching templates never resets this.
          </p>
          <Toggle
            label="Show 'More ▾' Menu for Remaining Categories"
            value={headerSettings.showMoreMenu !== false}
            onChange={(v) => update("showMoreMenu", v)}
          />
          <Toggle
            label="Enable Subcategory Hover Menu"
            value={headerSettings.enableCategoryHover !== false}
            onChange={(v) => update("enableCategoryHover", v)}
          />
          <Toggle
            label="Show All Categories Button"
            value={headerSettings.showAllCategoriesButton !== false}
            onChange={(v) => update("showAllCategoriesButton", v)}
          />
        </Section>

        {/* Announcement Message */}
        <Section label="Top Announcement Bar Text" defaultOpen={false}>
          <TextInput
            label="Announcement Message"
            value={(headerSettings.announcementText as string) ?? ""}
            onChange={(v) => update("announcementText", v)}
            placeholder="Special offer: Free delivery on orders over ৳1000!"
          />
        </Section>
      </div>
    </div>
  );
}
