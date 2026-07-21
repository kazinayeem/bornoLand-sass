/** Shared Google Maps embed helpers (builder + storefront). */

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isGoogleMapsEmbed(value: string): boolean {
  if (!value.trim()) return false;
  try {
    const u = new URL(value);
    return (
      (u.hostname.includes("google.com") || u.hostname.includes("google.co")) &&
      (u.pathname.includes("/maps") || u.pathname.includes("/embed"))
    );
  } catch {
    return false;
  }
}

export function buildMapsEmbedFromAddress(address: string): string {
  const q = encodeURIComponent(address.trim());
  return `https://maps.google.com/maps?q=${q}&output=embed`;
}

export function buildMapsEmbedFromCoords(lat: string, lng: string): string {
  const q = encodeURIComponent(`${lat.trim()},${lng.trim()}`);
  return `https://maps.google.com/maps?q=${q}&output=embed`;
}

export function isVideoUrl(value: string): boolean {
  if (!value.trim()) return false;
  const v = value.trim().toLowerCase();
  if (v.includes("youtube.com") || v.includes("youtu.be") || v.includes("vimeo.com")) return true;
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(v)) return isHttpUrl(value);
  return isHttpUrl(value);
}
