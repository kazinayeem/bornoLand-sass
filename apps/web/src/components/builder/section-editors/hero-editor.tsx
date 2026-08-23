"use client";

import { Field, SectionBlock, SelectField, TextField, ToggleField } from "./shared";
import type { SectionEditorProps } from "./types";
import { isVideoUrl } from "./types";
import { RepeaterEditor, type RepeaterField } from "../repeater-editor";

const SLIDER_HERO_FIELDS: RepeaterField[] = [
  { key: "image", label: "Desktop Image", type: "image" },
  { key: "mobileImage", label: "Mobile Image", type: "image" },
  { key: "badge", label: "Badge / Kicker", type: "text", placeholder: "Special Offer" },
  { key: "title", label: "Heading Title", type: "text", placeholder: "Main Banner Title" },
  { key: "subtitle", label: "Subtitle Description", type: "textarea", placeholder: "High quality products at best price" },
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
        const parsed = typeof p.slides === "string" ? JSON.parse(p.slides) : p.slides;
        if (Array.isArray(parsed)) {
          slides = parsed.map((item: any, idx: number) => {
            const img = item.image || item.imageUrl || item.desktopImage || item.desktop_image || "";
            const mobImg = item.mobileImage || item.mobileImageUrl || item.mobile_image || "";
            return {
              id: item.id || `slide-${idx + 1}`,
              image: img,
              desktopImage: img,
              mobileImage: mobImg,
              badge: item.badge || item.kicker || "",
              title: item.title || item.headline || "",
              subtitle: item.subtitle || item.subheadline || item.description || "",
              buttonText: item.buttonText || item.primaryButtonText || "",
              buttonLink: item.buttonLink || item.primaryButtonLink || "/shop",
              secondaryButtonText: item.secondaryButtonText || "",
              secondaryButtonLink: item.secondaryButtonLink || "",
            };
          });
        }
      }
    } catch {
      slides = [];
    }

    if (!slides.length) {
      const count = Number(p.slideCount) || 2;
      slides = Array.from({ length: count }, (_, i) => {
        const idx = i + 1;
        const fallbackImage = i === 0 ? (p.imageUrl || p.image || p.desktopImage || "") : "";
        const img = p[`slide${idx}Image`] || p[`slide${idx}DesktopImage`] || fallbackImage;
        const mobImg = p[`slide${idx}MobileImage`] || "";
        return {
          id: `slide-${idx}`,
          image: img,
          desktopImage: img,
          mobileImage: mobImg,
          badge: p[`slide${idx}Badge`] || (i === 0 ? "Featured Deal" : ""),
          title: p[`slide${idx}Title`] || (i === 0 ? (p.headline || "Welcome to Our Store") : `Special Collection ${idx}`),
          subtitle: p[`slide${idx}Subtitle`] || (i === 0 ? (p.subheadline || "Discover our latest trending products at exclusive prices.") : "High quality products at best price."),
          buttonText: p[`slide${idx}ButtonText`] || (p.buttonText || "Shop Now"),
          buttonLink: p[`slide${idx}ButtonLink`] || (p.buttonLink || "/shop"),
          secondaryButtonText: p[`slide${idx}SecondaryButtonText`] || "",
          secondaryButtonLink: p[`slide${idx}SecondaryButtonLink`] || "",
        };
      });
    }

    const handleSlidesUpdate = (newSlides: Record<string, string>[]) => {
      // Normalize and sync desktopImage & image keys so both always contain the latest value
      const normalized = newSlides.map((s) => {
        const img = s.image || s.desktopImage || "";
        const mobImg = s.mobileImage || "";
        return {
          ...s,
          image: img,
          desktopImage: img,
          mobileImage: mobImg,
        };
      });
      onPropsChange({
        ...p,
        slides: JSON.stringify(normalized),
        slideCount: String(normalized.length),
      });
    };

    return (
      <div className="space-y-4">
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

        <SectionBlock title="Hero Style & Appearance">
          <Field label="Text Alignment">
            <SelectField
              value={p.textAlignment ?? "left"}
              onChange={(v) => onPropChange("textAlignment", v)}
              options={[
                { value: "left", label: "Left Aligned" },
                { value: "center", label: "Centered" },
                { value: "right", label: "Right Aligned" },
              ]}
            />
          </Field>
          <Field label="Overlay Darkness">
            <SelectField
              value={p.overlayDarkness ?? "medium"}
              onChange={(v) => {
                const color =
                  v === "light"
                    ? "rgba(0, 0, 0, 0.25)"
                    : v === "heavy"
                    ? "rgba(0, 0, 0, 0.65)"
                    : v === "none"
                    ? "rgba(0, 0, 0, 0)"
                    : "rgba(0, 0, 0, 0.45)";
                onPropsChange({
                  ...p,
                  overlayDarkness: v,
                  overlayColor: color,
                });
              }}
              options={[
                { value: "none", label: "None (0%)" },
                { value: "light", label: "Light (25%)" },
                { value: "medium", label: "Medium (45%)" },
                { value: "heavy", label: "Heavy (65%)" },
              ]}
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
            minItems={1}
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
              <TextField value={p.secondaryButtonLink ?? ""} onChange={(v) => onPropChange("secondaryButtonLink", v)} placeholder="/contact" />
            </Field>
          </>
        )}
      </SectionBlock>
    </div>
  );
}
