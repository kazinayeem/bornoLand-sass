"use client";

import { Field, MediaField, SectionBlock, SelectField, TextField, ToggleField } from "./shared";
import type { SectionEditorProps } from "./types";

export function BeforeAfterEditor({
  section,
  storeId,
  storeSlug,
  onPropChange,
  onPropsChange,
}: SectionEditorProps) {
  const p = section.props;

  return (
    <div>
      <SectionBlock title="Section">
        <Field label="Title">
          <TextField value={p.title ?? ""} onChange={(v) => onPropChange("title", v)} placeholder="Transformation" />
        </Field>
        <Field label="Caption" hint="Optional text below the comparison">
          <TextField value={p.caption ?? ""} onChange={(v) => onPropChange("caption", v)} placeholder="Optional caption" multiline />
        </Field>
      </SectionBlock>

      <SectionBlock title="Images">
        <MediaField
          label="Before image"
          storeId={storeId}
          storeSlug={storeSlug}
          propKey="beforeImage"
          sectionProps={p}
          onPropsChange={onPropsChange}
        />
        <MediaField
          label="After image"
          storeId={storeId}
          storeSlug={storeSlug}
          propKey="afterImage"
          sectionProps={p}
          onPropsChange={onPropsChange}
        />
        <Field label="Alt text" hint="Shared description; used for both images if specific alts are empty">
          <TextField value={p.altText ?? ""} onChange={(v) => onPropChange("altText", v)} placeholder="Describe the comparison" />
        </Field>
        <Field label="Before alt (optional)">
          <TextField value={p.beforeAlt ?? ""} onChange={(v) => onPropChange("beforeAlt", v)} placeholder="Before image alt" />
        </Field>
        <Field label="After alt (optional)">
          <TextField value={p.afterAlt ?? ""} onChange={(v) => onPropChange("afterAlt", v)} placeholder="After image alt" />
        </Field>
      </SectionBlock>

      <SectionBlock title="Labels">
        <Field label="Before label">
          <TextField value={p.beforeLabel ?? "Before"} onChange={(v) => onPropChange("beforeLabel", v)} />
        </Field>
        <Field label="After label">
          <TextField value={p.afterLabel ?? "After"} onChange={(v) => onPropChange("afterLabel", v)} />
        </Field>
        <ToggleField label="Show labels" value={p.showLabels ?? "true"} onChange={(v) => onPropChange("showLabels", v)} />
      </SectionBlock>

      <SectionBlock title="Comparison">
        <Field label="Orientation" hint="Horizontal only — the comparison package does not support vertical">
          <SelectField
            value="horizontal"
            onChange={() => onPropChange("orientation", "horizontal")}
            options={[{ value: "horizontal", label: "Horizontal" }]}
          />
        </Field>
        <Field label="Default slider position" hint="0–100%">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Number(p.sliderPosition ?? "50") || 50}
            onChange={(e) => onPropChange("sliderPosition", e.target.value)}
            className="w-full accent-apple-primary"
          />
          <div className="mt-1 flex justify-between text-[10px] text-apple-ink-muted-48">
            <span>0%</span>
            <span className="font-medium text-apple-ink">{p.sliderPosition ?? "50"}%</span>
            <span>100%</span>
          </div>
        </Field>
        <Field label="Delimiter color">
          <TextField value={p.delimiterColor ?? "#ffffff"} onChange={(v) => onPropChange("delimiterColor", v)} placeholder="#ffffff" />
        </Field>
      </SectionBlock>

      <SectionBlock title="Frame">
        <Field label="Width" hint="e.g. 100%, 800px, 960px">
          <TextField value={p.comparisonWidth ?? "100%"} onChange={(v) => onPropChange("comparisonWidth", v)} placeholder="100%" />
        </Field>
        <Field label="Height">
          <SelectField
            value={["sm", "md", "lg", "xl"].includes(p.comparisonHeight || "") ? (p.comparisonHeight as string) : "md"}
            onChange={(v) => onPropChange("comparisonHeight", v)}
            options={[
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
              { value: "xl", label: "Extra large" },
            ]}
          />
        </Field>
        <Field label="Custom height (optional)" hint="Overrides preset when set, e.g. 420px">
          <TextField
            value={["sm", "md", "lg", "xl", ""].includes(p.comparisonHeight || "") ? "" : (p.comparisonHeight ?? "")}
            onChange={(v) => onPropChange("comparisonHeight", v || "md")}
            placeholder="420px"
          />
        </Field>
        <Field label="Image border radius" hint="Uses section Style tab radius when empty">
          <TextField value={p.comparisonRadius ?? ""} onChange={(v) => onPropChange("comparisonRadius", v)} placeholder="16" />
        </Field>
        <ToggleField label="Overlay" value={p.showOverlay ?? "false"} onChange={(v) => onPropChange("showOverlay", v)} />
        {p.showOverlay === "true" ? (
          <Field label="Overlay color">
            <TextField value={p.overlayColor ?? "rgba(0,0,0,0.15)"} onChange={(v) => onPropChange("overlayColor", v)} placeholder="rgba(0,0,0,0.15)" />
          </Field>
        ) : null}
      </SectionBlock>
    </div>
  );
}
