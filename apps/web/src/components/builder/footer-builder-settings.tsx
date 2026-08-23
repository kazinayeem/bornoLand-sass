"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setFooterSettings } from "@/redux/slices/builder-slice";
import { applyFooterTemplateSelection } from "@/lib/storefront/global-navigation";
import {
  ChevronDown,
  Check,
  PanelBottom,
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

const FOOTER_TEMPLATES = [
  {
    id: "classic-ecommerce",
    name: "1. Classic Ecommerce",
    desc: "4 Value guarantee badges, hotline, categories, delivery info.",
    tag: "Grocery & Natural",
  },
  {
    id: "modern-multi-column",
    name: "2. Modern Multi Column",
    desc: "Star Tech-style navy footer with top newsletter strip.",
    tag: "Tech & Electronics",
  },
  {
    id: "minimal",
    name: "3. Minimal",
    desc: "Clean minimalist layout, curated links & copyright bar.",
    tag: "Minimal & Clean",
  },
  {
    id: "marketplace",
    name: "4. Marketplace",
    desc: "Daraz-style multi-vendor footer with value propositions.",
    tag: "Marketplace",
  },
  {
    id: "premium",
    name: "5. Premium",
    desc: "Dark luxury footer with member circle CTA & social icons.",
    tag: "Luxury & Fashion",
  },
];

export function FooterBuilderSettings() {
  const dispatch = useDispatch();
  const footerSettings = useSelector((state: RootState) => state.builder.footerSettings);

  const activeTemplate = (footerSettings.template as string) || (footerSettings.footerTemplate as string) || "classic-ecommerce";
  const isEnabled = footerSettings.enabled !== false && footerSettings.visible !== false;

  const update = (key: string, value: unknown) => {
    dispatch(setFooterSettings({ ...footerSettings, [key]: value }));
  };

  const selectTemplate = (templateId: string) => {
    // Preserve footer content — only change visual template identity
    dispatch(
      setFooterSettings(
        applyFooterTemplateSelection(footerSettings as Record<string, unknown>, templateId) as any,
      ),
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <div>
          <h3 className="text-xs font-semibold text-apple-ink">Global Footer Settings</h3>
          <p className="text-[10px] text-apple-ink-muted-48">Single source of truth for footer configuration</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
        {/* Footer Visibility */}
        <div className="p-4 bg-zinc-50/50 space-y-3">
          <Toggle
            label="Enable Global Footer"
            value={isEnabled}
            onChange={(v) => {
              update("enabled", v);
              update("visible", v);
            }}
          />
          {!isEnabled && (
            <p className="text-[10px] text-rose-500 font-medium">
              Footer is disabled. No footer will be rendered on the storefront.
            </p>
          )}
        </div>

        {/* 5 Footer Templates Picker */}
        <Section label="Select Footer Template (5 Designs)">
          <div className="space-y-2">
            {FOOTER_TEMPLATES.map((tpl) => {
              const isSelected = activeTemplate === tpl.id || (tpl.id === "classic-ecommerce" && activeTemplate === "grocery") || (tpl.id === "modern-multi-column" && activeTemplate === "tech-electronics") || (tpl.id === "minimal" && activeTemplate === "minimal-commerce") || (tpl.id === "premium" && activeTemplate === "modern-store");
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
                      {tpl.name}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full text-white">
                        <Check className="h-3 w-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className={cn("text-[11px] mt-1 leading-snug", isSelected ? "text-zinc-300" : "text-zinc-500")}>
                    {tpl.desc}
                  </p>
                  <span className={cn("inline-block text-[9px] font-semibold uppercase tracking-wider mt-1.5 px-1.5 py-0.5 rounded", isSelected ? "bg-white/15 text-zinc-200" : "bg-zinc-100 text-zinc-600")}>
                    {tpl.tag}
                  </span>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Layout & Responsiveness */}
        <Section label="Columns & Mobile Layout">
          <SelectInput
            label="Column Count"
            value={String(footerSettings.columns ?? 4)}
            onChange={(v) => update("columns", Number(v))}
            options={[
              { value: "2", label: "2 Columns" },
              { value: "3", label: "3 Columns" },
              { value: "4", label: "4 Columns (Default)" },
              { value: "5", label: "5 Columns" },
            ]}
          />
          <SelectInput
            label="Mobile Display Mode"
            value={String(footerSettings.mobileLayout ?? "accordion")}
            onChange={(v) => update("mobileLayout", v)}
            options={[
              { value: "accordion", label: "Accordion (Tap column to expand)" },
              { value: "stacked", label: "Always Stacked" },
            ]}
          />
        </Section>

        {/* Feature Toggles */}
        <Section label="Footer Sections & Badges">
          <Toggle
            label="Show Newsletter Subscription"
            value={footerSettings.showNewsletter !== false}
            onChange={(v) => update("showNewsletter", v)}
          />
          <Toggle
            label="Show Social Media Icons"
            value={footerSettings.showSocial !== false}
            onChange={(v) => update("showSocial", v)}
          />
          <Toggle
            label="Show Payment Method Badges"
            value={footerSettings.showPaymentIcons !== false}
            onChange={(v) => update("showPaymentIcons", v)}
          />
        </Section>

        {/* Copyright Text */}
        <Section label="Copyright Notice" defaultOpen={false}>
          <TextInput
            label="Custom Copyright Text"
            value={(footerSettings.copyrightText as string) ?? ""}
            onChange={(v) => update("copyrightText", v)}
            placeholder="© 2026 BornoLand Store. All rights reserved."
          />
        </Section>
      </div>
    </div>
  );
}
