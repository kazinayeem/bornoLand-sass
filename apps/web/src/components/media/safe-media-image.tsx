"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SafeMediaImageProps = {
  src: string;
  alt: string;
  className?: string;
  lazy?: boolean;
  onClick?: () => void;
};

export function SafeMediaImage({ src, alt, className, lazy = true, onClick }: SafeMediaImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!lazy);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!lazy || visible) return;
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [lazy, visible]);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        ref={ref}
        className={cn("flex h-full w-full flex-col items-center justify-center gap-1 bg-zinc-100 text-apple-ink-muted-48", className)}
        onClick={onClick}
        role={onClick ? "button" : undefined}
      >
        <ImageIcon className="h-8 w-8" />
        <span className="text-[10px] font-medium uppercase tracking-wide">No preview</span>
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("relative h-full w-full overflow-hidden bg-zinc-100", className)} onClick={onClick}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-zinc-200" />}
      {visible && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={lazy ? "lazy" : "eager"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0",
            onClick ? "cursor-pointer" : ""
          )}
        />
      )}
    </div>
  );
}
