"use client";

import { MediaPicker } from "@/components/media/media-picker";
import { readImageSelection, patchImageSelection } from "@/lib/builder-section-media";
import type { MediaSelection } from "@/lib/media-selection";
import { BUILDER_UPLOAD_FOLDER } from "@/lib/media-folders";

type BuilderMediaFieldProps = {
  storeId: string;
  storeSlug: string;
  propKey: string;
  sectionProps: Record<string, string | undefined>;
  onPropsChange: (props: Record<string, string | undefined>) => void;
  /** Upload destination in the shared Store Media library (default: cms). */
  folder?: string;
};

/**
 * Builder image field — opens the shared Store Media picker (same data as /store/{slug}/media).
 */
export function BuilderMediaField({
  storeId,
  storeSlug,
  propKey,
  sectionProps,
  onPropsChange,
  folder = BUILDER_UPLOAD_FOLDER,
}: BuilderMediaFieldProps) {
  const selection = readImageSelection(sectionProps, propKey);

  const handleChange = (next: MediaSelection) => {
    onPropsChange(patchImageSelection(sectionProps, propKey, next));
  };

  return (
    <MediaPicker
      storeId={storeId}
      billingHref={`/store/${storeSlug}/billing`}
      folder={folder}
      compact
      hideLabel
      allowUrlPaste
      value={selection}
      onChange={handleChange}
    />
  );
}
