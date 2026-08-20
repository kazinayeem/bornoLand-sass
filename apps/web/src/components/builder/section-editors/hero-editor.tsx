"use client";

import { Field, MediaField, SectionBlock, SelectField, TextField, ToggleField } from "./shared";
import type { SectionEditorProps } from "./types";
import { isVideoUrl } from "./types";
import { RepeaterEditor, type RepeaterField } from "../repeater-editor";

const SLIDER_HERO_FIELDS: RepeaterField[] = [
  { key: "image", label: "Desktop Image", type: "image" },
  { key: "mobileImage", label: "Mobile Image", type: "image" },
  { key: "badge", label: "Badge / Kicker", type: "text", placeholder: "Featured Deal" },
  { key: "title", label: "Heading Title", type: "text", placeholder: "Gaming Deals" },
  { key: "subtitle", label: "Subtitle Description", type: "textarea", placeholder: "Latest products at special prices" },
  { key: "buttonText", label: "Primary Button Text", type: "text", placeholder: "Shop Now" },
  { key: "buttonLink", label: "Primary Button Link", type: "url", placeholder: "/shop" },
  { key: "secondaryButtonText", label: "Secondary Button Text", type: "text", placeholder: "Learn More" },
  { key: "secondaryButtonLink", label: "Secondary Button Link", type: "url", placeholder: "/about" },
];

export function HeroEditor({
  section,
  storeId,
  storeSlug,
  onPropChange,
  onPropsChange,
}: SectionEditorProps) {
  const p = section.props;
  const videoError = p.videoUrl && !isVideoUrl(p.videoUrl) ? "Enter a valid YouTube, Vimeo, or MP4 URL" : undefined;

  if (section.type === "slider-hero") {
    let slides: Record<string, string>[] = [];
    try {
      if (p.slides) {
        slides = typeof p.slides === "string" ? JSON.parse(p.slides) : p.slides;
      }
    } catch {
      slides = [];
    }

    if (!slides.length) {
      const count = Number(p.slideCount) || 3;
      slides = Array.from({ length: count }, (_, i) => ({
        id: `slide-${i + 1}`,
        image: p[`slide${i + 1}Image`] || "",
        mobileImage: p[`slide${i + 1}MobileImage`] || "",
        badge: p[`slide${i + 1}Badge`] || (i === 0 ? "Featured Deal" : ""),
        title: p[`slide${i + 1}Title`] || `Slide ${i + 1}`,
        subtitle: p[`slide${i + 1}Subtitle`] || "Discover our latest trending products.",
        buttonText: p[`slide${i + 1}ButtonText`] || "Shop Now",
        buttonLink: p[`slide${i + 1}ButtonLink`] || "/shop",
      }));
    }

    const handleSlidesUpdate = (newSlides: Record<string, string>[]) => {
      onPropChange("slides", JSON.stringify(newSlides));
      onPropChange("slideCount", String(newSlides.length));
    };

    return (
      <div>
        <SectionBlock title="Slider Controls">
          <Field label="Autoplay">
            <ToggleField
              label="Enable Autoplay"
              value={p.autoplay ?? "true"}
              onChange={(v) => onPropChange("autoplay", v)}
            />
          </Field>
          <Field label="Autoplay Speed (ms)">
            <TextField
              value={p.autoplaySpeed ?? "5000"}
              onChange={(v) => onPropChange("autoplaySpeed", v)}
              placeholder="5000"
            />
          </Field>
          <Field label="Show Arrows">
            <ToggleField
              label="Show Navigation Arrows"
              value={p.showArrows ?? "true"}
              onChange={(v) => onPropChange("showArrows", v)}
            />
          </Field>
          <Field label="Show Dots">
            <ToggleField
              label="Show Pagination Dots"
              value={p.showDots ?? "true"}
              onChange={(v) => onPropChange("showDots", v)}
            />
          </Field>
        </SectionBlock>


        <SectionBlock title="Hero Slides">
          <RepeaterEditor
            items={slides}
            fields={SLIDER_HERO_FIELDS}
            onUpdate={handleSlidesUpdate}
            title="Slides"
            addLabel="+ Add Slide"
            storeId={storeId}
            storeSlug={storeSlug}
            mediaFolder="hero"
          />
        </SectionBlock>
      </div>
    );
  }


  return (
    <div>
      <SectionBlock title="Copy">
        <Field label="Badge">
          <TextField
            value={p.kicker ?? p.badge ?? ""}
            onChange={(v) => onPropChange(p.badge !== undefined && p.kicker === undefined ? "badge" : "kicker", v)}
            placeholder="New season"
          />
        </Field>
        <Field label="Headline">
          <TextField value={p.headline ?? ""} onChange={(v) => onPropChange("headline", v)} placeholder="Your headline" />
        </Field>
        <Field label="Subheadline">
          <TextField value={p.subheadline ?? ""} onChange={(v) => onPropChange("subheadline", v)} placeholder="Supporting text" multiline />
        </Field>
      </SectionBlock>

      <SectionBlock title="Buttons">
        <Field label="Primary button">
          <TextField value={p.buttonText ?? ""} onChange={(v) => onPropChange("buttonText", v)} placeholder="Shop now" />
        </Field>
        <Field label="Primary link">
          <TextField value={p.buttonLink ?? ""} onChange={(v) => onPropChange("buttonLink", v)} placeholder="/shop" />
        </Field>
        {(p.secondaryButtonText !== undefined || section.type === "hero-banner" || section.type === "fullscreen-hero") && (
          <>
            <Field label="Secondary button">
              <TextField value={p.secondaryButtonText ?? ""} onChange={(v) => onPropChange("secondaryButtonText", v)} placeholder="Learn more" />
            </Field>
            <Field label="Secondary link">
              <TextField value={p.secondaryButtonLink ?? ""} onChange={(v) => onPropChange("secondaryButtonLink", v)} placeholder="/about" />
            </Field>
          </>
        )}
      </SectionBlock>

      <SectionBlock title="Background">
        <MediaField
          label="Background image"
          storeId={storeId}
          storeSlug={storeSlug}
          propKey={p.productImage !== undefined ? "productImage" : "imageUrl"}
          sectionProps={p}
          onPropsChange={onPropsChange}
        />
        {p.mobileImageUrl !== undefined || section.type === "hero-banner" ? (
          <MediaField
            label="Mobile image"
            storeId={storeId}
            storeSlug={storeSlug}
            propKey="mobileImageUrl"
            sectionProps={p}
            onPropsChange={onPropsChange}
          />
        ) : null}
        {(section.type === "video-hero" || p.posterImage !== undefined) && (
          <MediaField
            label="Video poster"
            storeId={storeId}
            storeSlug={storeSlug}
            propKey="posterImage"
            sectionProps={p}
            onPropsChange={onPropsChange}
          />
        )}
        {(section.type === "video-hero" || p.videoUrl !== undefined || p.showVideoModal !== undefined) && (
          <Field label="Background / modal video" error={videoError} hint="YouTube, Vimeo, or MP4 URL">
            <TextField value={p.videoUrl ?? ""} onChange={(v) => onPropChange("videoUrl", v)} placeholder="https://..." />
          </Field>
        )}
        {p.overlayColor !== undefined || section.type.includes("hero") ? (
          <>
            <Field label="Overlay color">
              <TextField value={p.overlayColor ?? ""} onChange={(v) => onPropChange("overlayColor", v)} placeholder="rgba(0,0,0,0.4)" />
            </Field>
            {p.overlayOpacity !== undefined && (
              <Field label="Overlay opacity">
                <TextField value={p.overlayOpacity ?? "45"} onChange={(v) => onPropChange("overlayOpacity", v)} placeholder="45" />
              </Field>
            )}
          </>
        ) : null}
        {p.heroHeight !== undefined && (
          <Field label="Height">
            <SelectField
              value={p.heroHeight || "md"}
              onChange={(v) => onPropChange("heroHeight", v)}
              options={[
                { value: "sm", label: "Small" },
                { value: "md", label: "Medium" },
                { value: "lg", label: "Large" },
                { value: "full", label: "Fullscreen" },
              ]}
            />
          </Field>
        )}
        {p.muted !== undefined && <ToggleField label="Mute video" value={p.muted} onChange={(v) => onPropChange("muted", v)} />}
        {p.loop !== undefined && <ToggleField label="Loop video" value={p.loop} onChange={(v) => onPropChange("loop", v)} />}
      </SectionBlock>
    </div>
  );
}
