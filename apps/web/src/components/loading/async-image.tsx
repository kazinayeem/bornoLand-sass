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

export function AsyncImage({
  src,
  alt,
  fallback = null,
  className,
  skeletonClassName,
  onError,
  fill,
  unoptimized,
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

  const shouldBeUnoptimized = unoptimized ?? false;

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
        unoptimized={shouldBeUnoptimized}
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
