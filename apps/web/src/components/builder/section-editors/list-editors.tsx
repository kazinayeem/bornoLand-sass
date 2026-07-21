"use client";

import { RepeaterEditor } from "@/components/builder/repeater-editor";
import { Field, SectionBlock, TextField } from "./shared";
import type { SectionEditorProps } from "./types";

export function TestimonialsEditor({
  section,
  storeId,
  storeSlug,
  onPropChange,
  onStyleChange,
}: SectionEditorProps) {
  const items = (section.style?.testimonialItems as Record<string, string>[] | undefined) ?? [];

  return (
    <div>
      <SectionBlock title="Section">
        <Field label="Title">
          <TextField value={section.props.title ?? ""} onChange={(v) => onPropChange("title", v)} placeholder="What customers say" />
        </Field>
      </SectionBlock>
      <SectionBlock title="Reviews">
        <RepeaterEditor
          title="Testimonials"
          addLabel="Add review"
          storeId={storeId}
          storeSlug={storeSlug}
          items={items}
          onUpdate={(next) => onStyleChange({ testimonialItems: next as any })}
          fields={[
            { key: "avatar", label: "Avatar", type: "image" },
            { key: "name", label: "Name", type: "text", placeholder: "Customer name" },
            { key: "role", label: "Company / position", type: "text", placeholder: "Founder at Acme" },
            { key: "rating", label: "Rating (1–5)", type: "number", placeholder: "5" },
            { key: "text", label: "Review", type: "textarea", placeholder: "Customer review..." },
            { key: "badge", label: "Badge", type: "text", placeholder: "Verified purchase" },
          ]}
        />
      </SectionBlock>
    </div>
  );
}

export function TeamEditor({
  section,
  storeId,
  storeSlug,
  onPropChange,
  onStyleChange,
}: SectionEditorProps) {
  const items = (section.style?.teamMembers as Record<string, string>[] | undefined) ?? [];

  return (
    <div>
      <SectionBlock title="Section">
        <Field label="Title">
          <TextField value={section.props.title ?? ""} onChange={(v) => onPropChange("title", v)} placeholder="Meet the team" />
        </Field>
      </SectionBlock>
      <SectionBlock title="Members">
        <RepeaterEditor
          title="Team members"
          addLabel="Add member"
          storeId={storeId}
          storeSlug={storeSlug}
          items={items}
          onUpdate={(next) => onStyleChange({ teamMembers: next as any })}
          fields={[
            { key: "image", label: "Photo", type: "image" },
            { key: "name", label: "Name", type: "text", placeholder: "Full name" },
            { key: "role", label: "Position", type: "text", placeholder: "Job title" },
            { key: "bio", label: "Bio", type: "textarea", placeholder: "Short bio" },
            { key: "twitter", label: "Twitter / X", type: "url", placeholder: "https://..." },
            { key: "linkedin", label: "LinkedIn", type: "url", placeholder: "https://..." },
          ]}
        />
      </SectionBlock>
    </div>
  );
}

export function LogoCloudEditor({
  section,
  storeId,
  storeSlug,
  onPropChange,
  onStyleChange,
}: SectionEditorProps) {
  const items = (section.style?.logoItems as Record<string, string>[] | undefined) ?? [];

  return (
    <div>
      <SectionBlock title="Section">
        <Field label="Title">
          <TextField value={section.props.title ?? ""} onChange={(v) => onPropChange("title", v)} placeholder="Trusted by" />
        </Field>
      </SectionBlock>
      <SectionBlock title="Logos">
        <RepeaterEditor
          title="Brand logos"
          addLabel="Add logo"
          storeId={storeId}
          storeSlug={storeSlug}
          items={items}
          onUpdate={(next) => onStyleChange({ logoItems: next as any })}
          fields={[
            { key: "image", label: "Logo image", type: "image" },
            { key: "alt", label: "Alt text", type: "text", placeholder: "Brand name" },
            { key: "link", label: "Website link", type: "url", placeholder: "https://..." },
          ]}
        />
      </SectionBlock>
    </div>
  );
}
