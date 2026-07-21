"use client";

import { MediaPicker } from "@/components/media/media-picker";
import { Field, MediaField, SectionBlock, SelectField, TextField, ToggleField } from "./shared";
import { isVideoUrl, type SectionEditorProps } from "./types";
import { readImageSelection, patchImageSelection } from "@/lib/builder-section-media";

export function VideoEditor({
  section,
  storeId,
  storeSlug,
  onPropChange,
  onPropsChange,
}: SectionEditorProps) {
  const p = section.props;
  const url = p.videoUrl || p.videoId || "";
  const error = url && !isVideoUrl(url) && section.type !== "youtube-embed"
    ? "Enter a valid YouTube, Vimeo, or MP4 URL"
    : undefined;

  const videoSelection = readImageSelection(p, "videoUrl");

  return (
    <div>
      <SectionBlock title="Video">
        <Field label="Title">
          <TextField value={p.title ?? ""} onChange={(v) => onPropChange("title", v)} placeholder="Watch" />
        </Field>
        {p.description !== undefined && (
          <Field label="Description">
            <TextField value={p.description ?? ""} onChange={(v) => onPropChange("description", v)} multiline />
          </Field>
        )}

        <Field label="Video source" hint="Paste YouTube / Vimeo / MP4 URL, or pick an MP4 from the library" error={error}>
          <div className="space-y-2">
            <TextField
              value={url}
              onChange={(v) => {
                if (section.type === "youtube-embed") onPropChange("videoId", v);
                else onPropChange("videoUrl", v);
              }}
              placeholder="https://youtube.com/watch?v=… or https://….mp4"
            />
            <MediaPicker
              storeId={storeId}
              billingHref={`/store/${storeSlug}/billing`}
              compact
              hideLabel
              allowUrlPaste
              label="MP4 from library"
              value={videoSelection}
              onChange={(selection) => {
                onPropsChange(patchImageSelection({ ...p, videoUrl: selection.url }, "videoUrl", selection));
                if (section.type === "youtube-embed") onPropChange("videoId", selection.url);
              }}
            />
          </div>
        </Field>

        <MediaField
          label="Thumbnail / poster"
          storeId={storeId}
          storeSlug={storeSlug}
          propKey="posterImage"
          sectionProps={p}
          onPropsChange={onPropsChange}
        />
      </SectionBlock>

      <SectionBlock title="Playback">
        <ToggleField label="Autoplay" value={p.autoplay ?? "false"} onChange={(v) => onPropChange("autoplay", v)} />
        <ToggleField label="Mute" value={p.muted ?? "true"} onChange={(v) => onPropChange("muted", v)} />
        <ToggleField label="Loop" value={p.loop ?? "false"} onChange={(v) => onPropChange("loop", v)} />
        <ToggleField
          label="Show controls"
          value={p.controls ?? p.showControls ?? "true"}
          onChange={(v) => onPropChange(p.showControls !== undefined ? "showControls" : "controls", v)}
        />
        {p.aspectRatio !== undefined && (
          <Field label="Aspect ratio">
            <SelectField
              value={p.aspectRatio || "16:9"}
              onChange={(v) => onPropChange("aspectRatio", v)}
              options={[
                { value: "16:9", label: "16:9" },
                { value: "4:3", label: "4:3" },
                { value: "1:1", label: "Square" },
                { value: "9:16", label: "9:16" },
              ]}
            />
          </Field>
        )}
      </SectionBlock>

      {url && isVideoUrl(url) ? (
        <SectionBlock title="Preview">
          <div className="overflow-hidden rounded-xl border border-apple-hairline bg-zinc-100 aspect-video">
            {url.includes("youtube") || url.includes("youtu.be") || section.type === "youtube-embed" ? (
              <iframe
                title="Video preview"
                src={`https://www.youtube.com/embed/${(url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]+)/)?.[1] || url)}`}
                className="h-full w-full"
                allow="autoplay; fullscreen"
              />
            ) : url.includes("vimeo") ? (
              <iframe
                title="Video preview"
                src={`https://player.vimeo.com/video/${url.match(/vimeo\.com\/(\d+)/)?.[1] || url}`}
                className="h-full w-full"
                allow="autoplay; fullscreen"
              />
            ) : (
              <video src={url} controls poster={p.posterImage || undefined} className="h-full w-full object-cover" />
            )}
          </div>
        </SectionBlock>
      ) : null}
    </div>
  );
}
