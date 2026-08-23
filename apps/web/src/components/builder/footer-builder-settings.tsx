"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setFooterSettings } from "@/redux/slices/builder-slice";
import { ChevronDown, Info } from "lucide-react";
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

export function FooterBuilderSettings() {
  const dispatch = useDispatch();
  const footerSettings = useSelector((state: RootState) => state.builder.footerSettings);

  const update = (key: string, value: unknown) => {
    dispatch(setFooterSettings({ ...footerSettings, [key]: value }));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <div>
          <h3 className="text-xs font-semibold text-apple-ink">Footer Settings</h3>
          <p className="text-[10px] text-apple-ink-muted-48">Layout & appearance — content loads from Branding, Contact CMS, and Categories.</p>
        </div>
      </div>

      <div className="mx-4 mt-3 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
          <p className="text-[10px] leading-relaxed text-blue-900/80">
            Store name, logo, email, phone, address, and partner brands are managed in Branding & Contact CMS — single source of truth.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
        {/* Footer Visibility */}
        <Section label="Visibility & Master Switch">
          <Toggle
            label="Enable Global Footer"
            value={footerSettings.enabled !== false && footerSettings.visible !== false}
            onChange={(v) => {
              update("enabled", v);
              update("visible", v);
            }}
          />
        </Section>

        <Section label="Template">
          <SelectInput
            label="Footer Template"
            value={String(footerSettings.template ?? "classic-ecommerce")}
            onChange={(v) => {
              update("template", v);
              update("footerTemplate", v);
            }}
            options={[
              { value: "classic-ecommerce", label: "FOOTER 1 — Classic Ecommerce" },
              { value: "modern-multi-column", label: "FOOTER 2 — Modern Multi Column" },
              { value: "minimal", label: "FOOTER 3 — Minimal" },
              { value: "marketplace", label: "FOOTER 4 — Marketplace" },
              { value: "premium", label: "FOOTER 5 — Premium" },
            ]}
          />
        </Section>

        <Section label="Layout & Responsiveness">
          <SelectInput
            label="Columns"
            value={String(footerSettings.columns ?? 4)}
            onChange={(v) => update("columns", Number(v))}
            options={[
              { value: "2", label: "2 Columns" },
              { value: "3", label: "3 Columns" },
              { value: "4", label: "4 Columns" },
              { value: "5", label: "5 Columns" },
            ]}
          />
          <SelectInput
            label="Mobile Layout"
            value={String(footerSettings.mobileLayout ?? "accordion")}
            onChange={(v) => update("mobileLayout", v)}
            options={[
              { value: "accordion", label: "Accordion (Tap to expand)" },
              { value: "stacked", label: "Always Stacked" },
            ]}
          />
          <TextInput
            label="Padding"
            value={footerSettings.padding ?? ""}
            onChange={(v) => update("padding", v)}
            placeholder="48px 24px"
          />
        </Section>

        <Section label="Content & Elements">
          <Toggle
            label="Newsletter Subscription Strip"
            value={footerSettings.showNewsletter !== false}
            onChange={(v) => update("showNewsletter", v)}
          />
          <Toggle
            label="Social Media Links"
            value={footerSettings.showSocial !== false}
            onChange={(v) => update("showSocial", v)}
          />
          <Toggle
            label="Payment Badges (bKash, Visa, etc.)"
            value={footerSettings.showPaymentIcons !== false}
            onChange={(v) => update("showPaymentIcons", v)}
          />
          <TextInput
            label="Copyright Text"
            value={String(footerSettings.copyrightText ?? "")}
            onChange={(v) => update("copyrightText", v)}
            placeholder="© 2026 Store Name. All rights reserved."
          />
        </Section>

        <Section label="Appearance" defaultOpen={false}>
          <ColorInput
            label="Background"
            value={footerSettings.background ?? ""}
            onChange={(v) => update("background", v)}
          />
          <ColorInput
            label="Text Color"
            value={footerSettings.textColor ?? ""}
            onChange={(v) => update("textColor", v)}
          />
          <ColorInput
            label="Border Color"
            value={footerSettings.borderColor ?? ""}
            onChange={(v) => update("borderColor", v)}
          />
          <Toggle label="Show Divider" value={footerSettings.divider !== false} onChange={(v) => update("divider", v)} />
        </Section>

        <Section label="Positions" defaultOpen={false}>
          <SelectInput
            label="Copyright Position"
            value={String(footerSettings.copyrightPosition ?? "left")}
            onChange={(v) => update("copyrightPosition", v)}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
          />
          <SelectInput
            label="Newsletter Position"
            value={String(footerSettings.newsletterPosition ?? "bottom")}
            onChange={(v) => update("newsletterPosition", v)}
            options={[
              { value: "top", label: "Top" },
              { value: "inline", label: "Inline" },
              { value: "bottom", label: "Bottom" },
            ]}
          />
        </Section>
      </div>
    </div>
  );
}
