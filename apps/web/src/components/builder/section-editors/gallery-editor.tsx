"use client";

import { RepeaterEditor } from "@/components/builder/repeater-editor";
import { Field, SectionBlock, SelectField, TextField } from "./shared";
import type { SectionEditorProps } from "./types";

export function GalleryEditor({
  section,
  storeId,
  storeSlug,
  onPropChange,
  onStyleChange,
}: SectionEditorProps) {
  const items = (section.style?.galleryItems as Record<string, string>[] | undefined) ?? [];

  return (
    <div>
      <SectionBlock title="Section">
        <Field label="Title">
          <TextField value={section.props.title ?? ""} onChange={(v) => onPropChange("title", v)} placeholder="Gallery" />
        </Field>
        {section.props.columns !== undefined && (
          <Field label="Columns">
            <SelectField
              value={section.props.columns || "3"}
              onChange={(v) => onPropChange("columns", v)}
              options={[
                { value: "2", label: "2" },
                { value: "3", label: "3" },
                { value: "4", label: "4" },
              ]}
            />
          </Field>
        )}
      </SectionBlock>

      <SectionBlock title="Images">
        <RepeaterEditor
          title="Gallery items"
          addLabel="Add image"
          storeId={storeId}
          storeSlug={storeSlug}
          items={items}
          onUpdate={(next) => onStyleChange({ galleryItems: next as any })}
          fields={[
            { key: "image", label: "Image", type: "image" },
            { key: "title", label: "Title", type: "text", placeholder: "Image title" },
            { key: "alt", label: "Alt text", type: "text", placeholder: "Describe the image" },
            { key: "link", label: "Link", type: "url", placeholder: "https://..." },
            { key: "caption", label: "Caption", type: "text", placeholder: "Optional caption" },
          ]}
        />
      </SectionBlock>
    </div>
  );
}
