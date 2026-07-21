"use client";

import { useState, useCallback, type ReactNode } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export type AsyncImageProps = Omit<ImageProps, "onLoad" | "onError"> & {
  src?: string | null;
  fallback?: ReactNode;
  skeletonClassName?: string;
  onError?: () => void;
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
    return KNOWN_REMOTE_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}

export function AsyncImage({
  src,
  alt,
  fallback = null,
  className,
  skeletonClassName,
  onError,
  fill,
  ...props
}: AsyncImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => setLoaded(true), []);
  const handleError = useCallback(() => {
    setError(true);
    onError?.();
  }, [onError]);

  if (!src || error) return <>{fallback}</>;
  if (!isKnownImageSrc(src)) return <>{fallback}</>;

  return (
    <span className={cn("relative block h-full w-full overflow-hidden", fill && "absolute inset-0")}>
      {!loaded && (
        <Skeleton
          className={cn("absolute inset-0 h-full w-full rounded-[inherit]", skeletonClassName)}
          aria-hidden
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        {...props}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300 motion-reduce:transition-none",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
      />
    </span>
  );
}
