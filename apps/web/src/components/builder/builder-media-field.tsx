"use client";

import { MediaPicker } from "@/components/media/media-picker";
import { readImageSelection, patchImageSelection } from "@/lib/builder-section-media";
import type { MediaSelection } from "@/lib/media-selection";

type BuilderMediaFieldProps = {
  storeId: string;
  storeSlug: string;
  propKey: string;
  sectionProps: Record<string, string | undefined>;
  onPropsChange: (props: Record<string, string | undefined>) => void;
  folder?: string;
};

export function BuilderMediaField({
  storeId,
  storeSlug,
  propKey,
  sectionProps,
  onPropsChange,
  folder = "builder",
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
