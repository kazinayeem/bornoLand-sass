"use client";

import type { ReactNode } from "react";
import { BuilderMediaField } from "@/components/builder/builder-media-field";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-medium text-apple-ink-muted-80">{label}</label>
      {children}
      {hint && !error ? <p className="text-[10px] text-apple-ink-muted-48">{hint}</p> : null}
      {error ? <p className="text-[10px] text-red-600">{error}</p> : null}
    </div>
  );
}

export function TextField({
  value,
  onChange,
  placeholder,
  multiline,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="min-h-[64px] w-full resize-none rounded-lg border border-apple-hairline bg-apple-canvas px-2.5 py-2 text-[12px] text-apple-ink placeholder:text-apple-ink-muted-48 focus:border-apple-primary focus:outline-none"
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 w-full rounded-lg border border-apple-hairline bg-apple-canvas px-2.5 text-[12px] text-apple-ink placeholder:text-apple-ink-muted-48 focus:border-apple-primary focus:outline-none"
    />
  );
}

export function ToggleField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const on = value === "true";
  return (
    <button
      type="button"
      onClick={() => onChange(on ? "false" : "true")}
      className="flex w-full items-center justify-between rounded-lg border border-apple-hairline px-2.5 py-2"
    >
      <span className="text-[12px] text-apple-ink">{label}</span>
      <span className={cn("relative h-5 w-9 rounded-full transition-colors", on ? "bg-apple-ink" : "bg-zinc-200")}>
        <span className={cn("absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform", on && "translate-x-4")} />
      </span>
    </button>
  );
}

export function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-lg border border-apple-hairline bg-apple-canvas px-2.5 text-[12px] text-apple-ink focus:border-apple-primary focus:outline-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

export function MediaField({
  label,
  storeId,
  storeSlug,
  propKey,
  sectionProps,
  onPropsChange,
}: {
  label: string;
  storeId: string;
  storeSlug: string;
  propKey: string;
  sectionProps: Record<string, string | undefined>;
  onPropsChange: (props: Record<string, string | undefined>) => void;
}) {
  return (
    <Field label={label} hint="Select from Media Library or paste an image URL">
      <BuilderMediaField
        storeId={storeId}
        storeSlug={storeSlug}
        propKey={propKey}
        sectionProps={sectionProps}
        onPropsChange={onPropsChange}
      />
    </Field>
  );
}

export function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3 border-b border-apple-hairline px-3 py-3 last:border-b-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
