import Image, { type ImageProps } from "next/image";

type SmartImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
  fallback?: React.ReactNode;
};

const KNOWN_REMOTE_HOSTS = new Set([
  "res.cloudinary.com",
  "localhost",
  "127.0.0.1",
  "picsum.photos",
  "placehold.co",
]);

function isKnownImageSrc(src: string) {
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    return KNOWN_REMOTE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export function SmartImage({ src, alt, fallback = null, ...props }: SmartImageProps) {
  if (!src) return <>{fallback}</>;
  if (!isKnownImageSrc(src)) return <>{fallback}</>;
  return <Image src={src} alt={alt} {...props} />;
}
