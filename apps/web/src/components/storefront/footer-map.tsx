"use client";

import { cn } from "@/lib/utils";

type FooterMapProps = {
  embedUrl?: string;
  coordinates?: { lat: string; lng: string } | null;
  className?: string;
  title?: string;
};

export function FooterMap({ embedUrl, coordinates, className, title = "Store location" }: FooterMapProps) {
  if (embedUrl) {
    return (
      <div className={cn("overflow-hidden rounded-apple-lg border border-apple-hairline", className)}>
        <iframe
          title={title}
          src={embedUrl}
          className="h-48 w-full border-0 sm:h-56"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    );
  }

  if (coordinates?.lat && coordinates?.lng) {
    const src = `https://maps.google.com/maps?q=${encodeURIComponent(`${coordinates.lat},${coordinates.lng}`)}&z=14&output=embed`;
    return (
      <div className={cn("overflow-hidden rounded-apple-lg border border-apple-hairline", className)}>
        <iframe
          title={title}
          src={src}
          className="h-48 w-full border-0 sm:h-56"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    );
  }

  return null;
}
