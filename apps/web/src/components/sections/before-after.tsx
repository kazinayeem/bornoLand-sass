"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactBeforeSliderComponent from "react-before-after-slider-component";
import "react-before-after-slider-component/dist/build.css";
import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";
import { useIsBuilder } from "@/lib/device-context";
import { cn } from "@/lib/utils";

const HEIGHT_PRESETS: Record<string, string> = {
  sm: "280px",
  md: "400px",
  lg: "520px",
  xl: "640px",
};

function parsePercent(value: string | undefined, fallback = 50): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, n));
}

function resolveHeight(p: Record<string, string>): string {
  const raw = (p.comparisonHeight || p.height || "md").trim();
  if (HEIGHT_PRESETS[raw]) return HEIGHT_PRESETS[raw];
  if (/^\d+(\.\d+)?(px|%|vh|rem|em)$/i.test(raw)) return raw;
  if (/^\d+$/.test(raw)) return `${raw}px`;
  return HEIGHT_PRESETS.md;
}

function resolveWidth(p: Record<string, string>): string {
  const raw = (p.comparisonWidth || p.width || "100%").trim();
  if (!raw) return "100%";
  if (/^\d+$/.test(raw)) return `${raw}px`;
  return raw;
}

function resolveRadius(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  const v = value.trim();
  return /^\d+$/.test(v) ? `${v}px` : v;
}

type SliderBodyProps = {
  beforeUrl: string;
  afterUrl: string;
  beforeAlt: string;
  afterAlt: string;
  defaultPosition: number;
  delimiterColor: string;
  showLabels: boolean;
  beforeLabel: string;
  afterLabel: string;
};

/**
 * Package layout: firstImage is the full base (right / “after”),
 * secondImage is the clipped overlay (left / “before”).
 */
const ComparisonSlider = memo(function ComparisonSlider({
  beforeUrl,
  afterUrl,
  beforeAlt,
  afterAlt,
  defaultPosition,
  delimiterColor,
  showLabels,
  beforeLabel,
  afterLabel,
}: SliderBodyProps) {
  const [percent, setPercent] = useState(defaultPosition);
  const [touchLock, setTouchLock] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPercent(defaultPosition);
  }, [defaultPosition]);

  // Package does not expose loading=lazy — apply after mount
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.querySelectorAll("img").forEach((img) => {
      img.setAttribute("loading", "lazy");
      img.setAttribute("decoding", "async");
    });
  }, [beforeUrl, afterUrl]);

  const firstImage = useMemo(
    () => ({ imageUrl: afterUrl, alt: afterAlt }),
    [afterUrl, afterAlt],
  );
  const secondImage = useMemo(
    () => ({ imageUrl: beforeUrl, alt: beforeAlt }),
    [beforeUrl, beforeAlt],
  );

  const onChangePercentPosition = useCallback((next: number) => {
    setPercent(next);
  }, []);

  const onChangeMode = useCallback((mode: string) => {
    setTouchLock(mode === "move");
  }, []);

  useEffect(() => {
    if (!touchLock) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [touchLock]);

  return (
    <div ref={rootRef} className="relative h-full w-full">
      <ReactBeforeSliderComponent
        className="bornoland-before-after-slider h-full w-full"
        firstImage={firstImage}
        secondImage={secondImage}
        currentPercentPosition={percent}
        onChangePercentPosition={onChangePercentPosition}
        onChangeMode={onChangeMode as (mode: "move" | "default") => void}
        delimiterColor={delimiterColor}
        withResizeFeel
      />

      {showLabels ? (
        <>
          <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white">
            {beforeLabel}
          </span>
          <span className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white">
            {afterLabel}
          </span>
        </>
      ) : null}

      <label className="sr-only">
        Comparison position
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(percent)}
          onChange={(e) => setPercent(Number(e.target.value))}
        />
      </label>
    </div>
  );
});

function EmptyState({ beforeLabel, afterLabel }: { beforeLabel: string; afterLabel: string }) {
  return (
    <div className="flex h-full min-h-[220px] w-full flex-col items-center justify-center gap-2 bg-apple-canvas-parchment px-4 text-center">
      <p className="text-sm font-medium text-apple-ink-muted-80">Add before & after images</p>
      <p className="text-xs text-apple-ink-muted-48">
        {beforeLabel} · {afterLabel}
      </p>
    </div>
  );
}

export function BeforeAfter({ section }: { section: SectionData }) {
  const p = section.props;
  const isBuilder = useIsBuilder();
  const beforeUrl = (p.beforeImage || "").trim();
  const afterUrl = (p.afterImage || "").trim();
  const beforeLabel = p.beforeLabel || "Before";
  const afterLabel = p.afterLabel || "After";
  const altBase = (p.altText || "").trim();
  const beforeAlt = (p.beforeAlt || "").trim() || (altBase ? `${altBase} — ${beforeLabel}` : beforeLabel);
  const afterAlt = (p.afterAlt || "").trim() || (altBase ? `${altBase} — ${afterLabel}` : afterLabel);
  const defaultPosition = parsePercent(p.sliderPosition ?? p.defaultPosition, 50);
  const delimiterColor = p.delimiterColor || "#ffffff";
  const showLabels = p.showLabels !== "false";
  const showOverlay = p.showOverlay === "true";
  const overlayColor = p.overlayColor || "rgba(0,0,0,0.15)";
  const caption = (p.caption || "").trim();
  const height = resolveHeight(p);
  const width = resolveWidth(p);
  const radius = resolveRadius(p.comparisonRadius || p.imageBorderRadius);
  const ready = Boolean(beforeUrl && afterUrl);

  const frameRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(isBuilder);

  useEffect(() => {
    if (isBuilder) {
      setInView(true);
      return;
    }
    const el = frameRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isBuilder]);

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto w-full px-4" style={{ maxWidth: width === "100%" ? undefined : width }}>
        <SectionTitle title={p.title || ""} textColor={p.textColor} textAlignment={p.textAlignment} />

        <div
          ref={frameRef}
          className={cn(
            "relative w-full overflow-hidden bg-apple-canvas-parchment",
            !radius && "rounded-2xl",
          )}
          style={{
            height,
            maxWidth: "100%",
            borderRadius: radius,
          }}
          role="img"
          aria-label={`${beforeLabel} and ${afterLabel} image comparison`}
        >
          {ready && inView ? (
            <ComparisonSlider
              beforeUrl={beforeUrl}
              afterUrl={afterUrl}
              beforeAlt={beforeAlt}
              afterAlt={afterAlt}
              defaultPosition={defaultPosition}
              delimiterColor={delimiterColor}
              showLabels={showLabels}
              beforeLabel={beforeLabel}
              afterLabel={afterLabel}
            />
          ) : ready ? (
            <div className="flex h-full w-full items-center justify-center" aria-hidden>
              <div className="h-8 w-8 animate-pulse rounded-full bg-apple-hairline" />
            </div>
          ) : (
            <EmptyState beforeLabel={beforeLabel} afterLabel={afterLabel} />
          )}

          {showOverlay ? (
            <div
              className="pointer-events-none absolute inset-0 z-[5]"
              style={{ backgroundColor: overlayColor }}
              aria-hidden
            />
          ) : null}
        </div>

        {caption ? (
          <p className="mt-3 text-center text-caption text-apple-ink-muted-48">{caption}</p>
        ) : null}
      </div>

      <style jsx global>{`
        .bornoland-before-after-slider,
        .bornoland-before-after-slider.before-after-slider {
          height: 100%;
          width: 100%;
        }
        .bornoland-before-after-slider img {
          height: 100%;
          width: 100%;
          object-fit: cover;
        }
        .bornoland-before-after-slider .before-after-slider__first-photo-container,
        .bornoland-before-after-slider .before-after-slider__second-photo-container {
          height: 100%;
        }
        .bornoland-before-after-slider .before-after-slider__delimiter-icon {
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </SectionWrapper>
  );
}
