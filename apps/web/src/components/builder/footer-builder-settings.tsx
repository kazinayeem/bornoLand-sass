"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setFooterSettings } from "@/redux/slices/builder-slice";
import { ChevronDown, Info } from "lucide-react";
import { useState } from "react";
import { FOOTER_TEMPLATES } from "@/lib/storefront/footer-types";

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
          <p className="text-[10px] text-apple-ink-muted-48">Layout & appearance only — content loads from Branding, Contact CMS, and Navigation.</p>
        </div>
      </div>

      <div className="mx-4 mt-3 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
          <p className="text-[10px] leading-relaxed text-blue-900/80">
            Store name, logo, email, phone, address, social links, and menu items are managed in Branding, Contact CMS, and Navigation — not here.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
        <Section label="Template">
          <SelectInput
            label="Footer Template"
            value={String(footerSettings.template ?? "commerce")}
            onChange={(v) => update("template", v)}
            options={FOOTER_TEMPLATES.map((t) => ({ value: t.value, label: t.label }))}
          />
        </Section>

        <Section label="Layout">
          <SelectInput
            label="Columns"
            value={String(footerSettings.columns ?? 4)}
            onChange={(v) => update("columns", Number(v))}
            options={[
              { value: "1", label: "1 Column" },
              { value: "2", label: "2 Columns" },
              { value: "3", label: "3 Columns" },
              { value: "4", label: "4 Columns" },
              { value: "5", label: "5 Columns" },
            ]}
          />
          <TextInput
            label="Padding"
            value={footerSettings.padding ?? ""}
            onChange={(v) => update("padding", v)}
            placeholder="48px 24px"
          />
          <SelectInput
            label="Alignment"
            value={String(footerSettings.alignment ?? "left")}
            onChange={(v) => update("alignment", v)}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
          />
        </Section>

        <Section label="Appearance">
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

        <Section label="Elements" defaultOpen={false}>
          <Toggle label="Newsletter Signup" value={footerSettings.showNewsletter ?? false} onChange={(v) => update("showNewsletter", v)} />
          <Toggle label="Social Media Icons" value={footerSettings.showSocial ?? true} onChange={(v) => update("showSocial", v)} />
          <Toggle label="Contact Block" value={footerSettings.showContact ?? true} onChange={(v) => update("showContact", v)} />
          <Toggle label="Business Hours" value={footerSettings.showBusinessHours ?? false} onChange={(v) => update("showBusinessHours", v)} />
          <Toggle label="Map" value={footerSettings.showMap ?? false} onChange={(v) => update("showMap", v)} />
          <Toggle label="Payment Icons" value={footerSettings.showPaymentIcons ?? false} onChange={(v) => update("showPaymentIcons", v)} />
          <Toggle label="Copyright Bar" value={footerSettings.showCopyright ?? true} onChange={(v) => update("showCopyright", v)} />
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
          <SelectInput
            label="Map Position"
            value={String(footerSettings.mapPosition ?? "hidden")}
            onChange={(v) => update("mapPosition", v)}
            options={[
              { value: "hidden", label: "Hidden" },
              { value: "inline", label: "Inline" },
              { value: "bottom", label: "Bottom" },
            ]}
          />
          <SelectInput
            label="Social Icon Style"
            value={String(footerSettings.socialIconStyle ?? "filled")}
            onChange={(v) => update("socialIconStyle", v)}
            options={[
              { value: "filled", label: "Filled" },
              { value: "outline", label: "Outline" },
              { value: "minimal", label: "Minimal" },
            ]}
          />
        </Section>

        <Section label="Visibility" defaultOpen={false}>
          <Toggle label="Desktop" value={footerSettings.visibleOnDesktop !== false} onChange={(v) => update("visibleOnDesktop", v)} />
          <Toggle label="Tablet" value={footerSettings.visibleOnTablet !== false} onChange={(v) => update("visibleOnTablet", v)} />
          <Toggle label="Mobile" value={footerSettings.visibleOnMobile !== false} onChange={(v) => update("visibleOnMobile", v)} />
        </Section>
      </div>

      <div className="border-t border-zinc-100 bg-apple-canvas-parchment p-4">
        <p className="mb-2 text-[10px] font-medium text-apple-ink-muted-48 uppercase tracking-wider">Layout Preview</p>
        <div
          className="rounded-lg border border-zinc-200 p-4 text-[10px]"
          style={{
            backgroundColor: footerSettings.background || "#1a1a1a",
            color: footerSettings.textColor || "#ffffff",
          }}
        >
          <p className="mb-2 text-[11px] font-semibold capitalize">{String(footerSettings.template ?? "commerce")} template</p>
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${footerSettings.columns || 4}, 1fr)` }}>
            {Array.from({ length: footerSettings.columns || 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <p className="font-semibold text-[11px]">Column {i + 1}</p>
                <div className="space-y-1 opacity-60">
                  <p>From Navigation CMS</p>
                  <p>From Contact CMS</p>
                </div>
              </div>
            ))}
          </div>
          {footerSettings.showCopyright !== false && (
            <div className="mt-4 border-t border-white/10 pt-3 text-center opacity-60">
              Auto-generated copyright from store branding
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
