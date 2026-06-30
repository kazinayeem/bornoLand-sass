"use client";

import type { Store } from "@/redux/api/store-api";
import { SmartImage } from "@/components/ui/smart-image";
import { getStoreBrandColors, getStoreInitials, getStoreLogoUrl } from "@/lib/store-branding";

type StoreBrandMarkProps = {
  store: Pick<Store, "name" | "shortName" | "logoUrl" | "brandColor" | "accentColor">;
  size?: number;
  className?: string;
  roundedClassName?: string;
};

export function StoreBrandMark({
  store,
  size = 40,
  className = "",
  roundedClassName = "rounded-xl",
}: StoreBrandMarkProps) {
  const logoUrl = getStoreLogoUrl(store);
  const initials = getStoreInitials(store.name, store.shortName);
  const { brandColor } = getStoreBrandColors(store);

  if (logoUrl) {
    return (
      <div
        className={`relative overflow-hidden border border-zinc-200 bg-white ${roundedClassName} ${className}`}
        style={{ width: size, height: size }}
      >
        <SmartImage src={logoUrl} alt={store.name} fill sizes={`${size}px`} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center text-sm font-bold text-white ${roundedClassName} ${className}`}
      style={{ width: size, height: size, backgroundColor: brandColor }}
    >
      {initials}
    </div>
  );
}
