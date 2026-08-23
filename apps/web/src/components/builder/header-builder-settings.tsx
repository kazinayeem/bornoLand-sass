"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setHeaderSettings, setEditingZone } from "@/redux/slices/builder-slice";
import {
  PanelRightOpen, X, ChevronDown, Eye, EyeOff,
} from "lucide-react";
import { useState } from "react";

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

function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium text-apple-ink-muted-48 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded border border-zinc-200 p-0.5"
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="h-7 flex-1 rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-apple-ink-muted-80 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none"
        />
      </div>
    </div>
  );
}

export function HeaderBuilderSettings() {
  const dispatch = useDispatch();
  const headerSettings = useSelector((state: RootState) => state.builder.headerSettings);

  const update = (key: string, value: unknown) => {
    dispatch(setHeaderSettings({ ...headerSettings, [key]: value }));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <div>
          <h3 className="text-xs font-semibold text-apple-ink">Header Settings</h3>
          <p className="text-[10px] text-apple-ink-muted-48">Configure global header appearance</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
        {/* Header Visibility */}
        <Section label="Visibility & Master Switch">
          <Toggle
            label="Enable Global Header"
            value={headerSettings.enabled !== false && headerSettings.visible !== false}
            onChange={(v) => {
              update("enabled", v);
              update("visible", v);
            }}
          />
        </Section>

        {/* Layout */}
        <Section label="Template & Layout">
          <SelectInput
            label="Header Template"
            value={headerSettings.template ?? headerSettings.headerTemplate ?? "modern-ecommerce"}
            onChange={(v) => {
              update("template", v);
              update("headerTemplate", v);
            }}
            options={[
              { value: "minimal-clean", label: "HEADER 1 — Minimal / Clean Store" },
              { value: "modern-ecommerce", label: "HEADER 2 — Modern Ecommerce" },
              { value: "marketplace", label: "HEADER 3 — Marketplace Header" },
              { value: "premium-luxury", label: "HEADER 4 — Premium / Luxury" },
              { value: "compact-professional", label: "HEADER 5 — Compact / Professional" },
            ]}
          />
          <SelectInput
            label="Header Position"
            value={headerSettings.position ?? (headerSettings.sticky === false ? "static" : "sticky")}
            onChange={(v) => {
              update("position", v);
              update("sticky", v === "sticky" || v === "fixed");
            }}
            options={[
              { value: "static", label: "Static (Normal Flow)" },
              { value: "sticky", label: "Sticky (Sticks on Scroll)" },
              { value: "fixed", label: "Fixed (Permanent Top Overlay)" },
            ]}
          />
          <SelectInput
            label="Desktop Layout"
            value={headerSettings.desktopLayout ?? "logo_left"}
            onChange={(v) => update("desktopLayout", v)}
            options={[
              { value: "logo_left", label: "Logo Left" },
              { value: "logo_center", label: "Logo Center" },
              { value: "logo_right", label: "Logo Right" },
              { value: "full_width", label: "Full Width" },
            ]}
          />
          <SelectInput
            label="Mobile Layout"
            value={headerSettings.mobileLayout ?? "hamburger"}
            onChange={(v) => update("mobileLayout", v)}
            options={[
              { value: "hamburger", label: "Hamburger Menu" },
              { value: "bottom_nav", label: "Bottom Navigation" },
            ]}
          />
          <TextInput
            label="Desktop Height"
            value={headerSettings.height ?? ""}
            onChange={(v) => update("height", v)}
            placeholder="80"
          />
          <TextInput
            label="Tablet Height"
            value={headerSettings.tabletHeight ?? ""}
            onChange={(v) => update("tabletHeight", v)}
            placeholder="72"
          />
          <TextInput
            label="Mobile Height"
            value={headerSettings.mobileHeight ?? ""}
            onChange={(v) => update("mobileHeight", v)}
            placeholder="64"
          />
          <TextInput
            label="Desktop Padding"
            value={headerSettings.padding ?? ""}
            onChange={(v) => update("padding", v)}
            placeholder="0 32px"
          />
          <TextInput
            label="Tablet Padding"
            value={headerSettings.tabletPadding ?? ""}
            onChange={(v) => update("tabletPadding", v)}
            placeholder="0 24px"
          />
          <TextInput
            label="Mobile Padding"
            value={headerSettings.mobilePadding ?? ""}
            onChange={(v) => update("mobilePadding", v)}
            placeholder="0 16px"
          />
          <TextInput
            label="Desktop Container Width"
            value={headerSettings.containerWidth ?? ""}
            onChange={(v) => update("containerWidth", v)}
            placeholder="1440px"
          />
          <TextInput
            label="Tablet Container Width"
            value={headerSettings.tabletContainerWidth ?? ""}
            onChange={(v) => update("tabletContainerWidth", v)}
            placeholder="100%"
          />
          <TextInput
            label="Mobile Container Width"
            value={headerSettings.mobileContainerWidth ?? ""}
            onChange={(v) => update("mobileContainerWidth", v)}
            placeholder="100%"
          />
        </Section>

        {/* Logo */}
        <Section label="Logo & Store Name">
          <TextInput
            label="Desktop Logo Width"
            value={String(headerSettings.logoWidth ?? "")}
            onChange={(v) => update("logoWidth", v)}
            placeholder="40"
          />
          <TextInput
            label="Tablet Logo Width"
            value={headerSettings.tabletLogoWidth ?? ""}
            onChange={(v) => update("tabletLogoWidth", v)}
            placeholder="36"
          />
          <TextInput
            label="Mobile Logo Width"
            value={headerSettings.mobileLogoWidth ?? ""}
            onChange={(v) => update("mobileLogoWidth", v)}
            placeholder="32"
          />
          <TextInput
            label="Desktop Logo Height"
            value={String(headerSettings.logoHeight ?? "")}
            onChange={(v) => update("logoHeight", v)}
            placeholder="40"
          />
          <TextInput
            label="Tablet Logo Height"
            value={headerSettings.tabletLogoHeight ?? ""}
            onChange={(v) => update("tabletLogoHeight", v)}
            placeholder="36"
          />
          <TextInput
            label="Mobile Logo Height"
            value={headerSettings.mobileLogoHeight ?? ""}
            onChange={(v) => update("mobileLogoHeight", v)}
            placeholder="32"
          />
          <TextInput
            label="Desktop Store Name Size"
            value={headerSettings.storeNameFontSize ?? ""}
            onChange={(v) => update("storeNameFontSize", v)}
            placeholder="18"
          />
          <TextInput
            label="Tablet Store Name Size"
            value={headerSettings.tabletStoreNameFontSize ?? ""}
            onChange={(v) => update("tabletStoreNameFontSize", v)}
            placeholder="17"
          />
          <TextInput
            label="Mobile Store Name Size"
            value={headerSettings.mobileStoreNameFontSize ?? ""}
            onChange={(v) => update("mobileStoreNameFontSize", v)}
            placeholder="16"
          />
          <TextInput
            label="Desktop Logo / Name Gap"
            value={headerSettings.logoTextGap ?? ""}
            onChange={(v) => update("logoTextGap", v)}
            placeholder="10"
          />
          <TextInput
            label="Tablet Logo / Name Gap"
            value={headerSettings.tabletLogoTextGap ?? ""}
            onChange={(v) => update("tabletLogoTextGap", v)}
            placeholder="8"
          />
          <TextInput
            label="Mobile Logo / Name Gap"
            value={headerSettings.mobileLogoTextGap ?? ""}
            onChange={(v) => update("mobileLogoTextGap", v)}
            placeholder="8"
          />
        </Section>

        {/* Appearance */}
        <Section label="Appearance">
          <ColorInput
            label="Background"
            value={headerSettings.background ?? ""}
            onChange={(v) => update("background", v)}
          />
          <ColorInput
            label="Border Color"
            value={headerSettings.borderColor ?? ""}
            onChange={(v) => update("borderColor", v)}
          />
          <ColorInput
            label="Text Color"
            value={headerSettings.textColor ?? ""}
            onChange={(v) => update("textColor", v)}
          />
          <ColorInput
            label="Hover Color"
            value={headerSettings.hoverColor ?? ""}
            onChange={(v) => update("hoverColor", v)}
          />
          <SelectInput
            label="Shadow"
            value={headerSettings.shadow ?? "none"}
            onChange={(v) => update("shadow", v)}
            options={[
              { value: "none", label: "None" },
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
            ]}
          />
        </Section>

        {/* Behavior */}
        <Section label="Behavior" defaultOpen={true}>
          <Toggle
            label="Transparent"
            value={headerSettings.transparent ?? false}
            onChange={(v) => update("transparent", v)}
          />
          <Toggle
            label="Blur Background"
            value={headerSettings.blurBackground ?? false}
            onChange={(v) => update("blurBackground", v)}
          />
          <Toggle
            label="Shadow on Scroll"
            value={headerSettings.shadowOnScroll !== false}
            onChange={(v) => update("shadowOnScroll", v)}
          />
          <Toggle
            label="Border Bottom"
            value={headerSettings.borderBottom ?? false}
            onChange={(v) => update("borderBottom", v)}
          />
          <Toggle
            label="Auto Hide on Scroll Down"
            value={headerSettings.autoHideOnScroll ?? false}
            onChange={(v) => update("autoHideOnScroll", v)}
          />
        </Section>

        {/* Elements */}
        <Section label="Elements">
          <Toggle
            label="Search"
            value={headerSettings.showSearch ?? true}
            onChange={(v) => update("showSearch", v)}
          />
          <Toggle
            label="Wishlist"
            value={headerSettings.showWishlist ?? true}
            onChange={(v) => update("showWishlist", v)}
          />
          <Toggle
            label="Cart"
            value={headerSettings.showCart ?? true}
            onChange={(v) => update("showCart", v)}
          />
          <Toggle
            label="Profile / Account"
            value={headerSettings.showProfile ?? true}
            onChange={(v) => update("showProfile", v)}
          />
          <Toggle
            label="Language Switcher"
            value={headerSettings.showLanguageSwitcher ?? false}
            onChange={(v) => update("showLanguageSwitcher", v)}
          />
          <Toggle
            label="Currency Switcher"
            value={headerSettings.showCurrencySwitcher ?? false}
            onChange={(v) => update("showCurrencySwitcher", v)}
          />
          <TextInput
            label="Desktop Menu Gap"
            value={headerSettings.menuGap ?? ""}
            onChange={(v) => update("menuGap", v)}
            placeholder="32"
          />
          <TextInput
            label="Tablet Menu Gap"
            value={headerSettings.tabletMenuGap ?? ""}
            onChange={(v) => update("tabletMenuGap", v)}
            placeholder="24"
          />
          <TextInput
            label="Mobile Menu Gap"
            value={headerSettings.mobileMenuGap ?? ""}
            onChange={(v) => update("mobileMenuGap", v)}
            placeholder="16"
          />
          <TextInput
            label="Desktop Nav Font Size"
            value={headerSettings.navFontSize ?? ""}
            onChange={(v) => update("navFontSize", v)}
            placeholder="16"
          />
          <TextInput
            label="Tablet Nav Font Size"
            value={headerSettings.tabletNavFontSize ?? ""}
            onChange={(v) => update("tabletNavFontSize", v)}
            placeholder="15"
          />
          <TextInput
            label="Mobile Nav Font Size"
            value={headerSettings.mobileNavFontSize ?? ""}
            onChange={(v) => update("mobileNavFontSize", v)}
            placeholder="15"
          />
          <TextInput
            label="Desktop Icon Size"
            value={headerSettings.iconSize ?? ""}
            onChange={(v) => update("iconSize", v)}
            placeholder="24"
          />
          <TextInput
            label="Tablet Icon Size"
            value={headerSettings.tabletIconSize ?? ""}
            onChange={(v) => update("tabletIconSize", v)}
            placeholder="22"
          />
          <TextInput
            label="Mobile Icon Size"
            value={headerSettings.mobileIconSize ?? ""}
            onChange={(v) => update("mobileIconSize", v)}
            placeholder="20"
          />
          <TextInput
            label="Button Radius"
            value={headerSettings.buttonRadius ?? ""}
            onChange={(v) => update("buttonRadius", v)}
            placeholder="999px"
          />
        </Section>

        {/* Text Bars */}
        <Section label="Top Bar & Announcement">
          <TextInput
            label="Top Bar Text"
            value={headerSettings.topBar ?? ""}
            onChange={(v) => update("topBar", v)}
            placeholder="Free shipping on orders over $50"
          />
          <TextInput
            label="Announcement Bar Text"
            value={headerSettings.announcementBar ?? ""}
            onChange={(v) => update("announcementBar", v)}
            placeholder="Summer sale - 20% off!"
          />
        </Section>
      </div>

      {/* Preview */}
      <div className="border-t border-zinc-100 bg-apple-canvas-parchment p-4">
        <p className="mb-2 text-[10px] font-medium text-apple-ink-muted-48 uppercase tracking-wider">Preview</p>
        <div
          className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 text-xs"
          style={{
            backgroundColor: headerSettings.background || "#ffffff",
            boxShadow: headerSettings.shadow && headerSettings.shadow !== "none"
              ? `0 ${headerSettings.shadow === "sm" ? "1" : headerSettings.shadow === "md" ? "4" : "8"}px ${headerSettings.shadow === "sm" ? "2" : headerSettings.shadow === "md" ? "12" : "24"}px rgba(0,0,0,0.1)`
              : "none",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-zinc-200" />
            <span className="font-semibold text-apple-ink">Logo</span>
          </div>
          {headerSettings.showSearch && (
            <div className="flex items-center gap-2 text-apple-ink-muted-48">
              <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px]">Search...</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-apple-ink-muted-48">
            {headerSettings.showCart && <span className="h-4 w-4 rounded bg-zinc-200" />}
            {headerSettings.showProfile && <span className="h-4 w-4 rounded-full bg-zinc-200" />}
          </div>
        </div>
      </div>
    </div>
  );
}
