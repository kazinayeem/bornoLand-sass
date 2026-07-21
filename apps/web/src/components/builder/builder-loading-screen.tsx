"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const LOADING_MESSAGES = [
  "Preparing your workspace…",
  "Loading your store…",
  "Syncing builder state…",
  "Restoring your latest edits…",
  "Loading sections…",
  "Applying theme…",
  "Almost ready…",
] as const;

const MESSAGE_INTERVAL_MS = 2400;
const DEFAULT_MIN_VISIBLE_MS = 700;
const EXIT_FADE_MS = 280;

/**
 * Keeps the loading UI visible for at least `minMs`, then fades out.
 * Clears immediately after the minimum once data is ready.
 */
export function useMinimumLoading(isLoading: boolean, minMs = DEFAULT_MIN_VISIBLE_MS) {
  const [phase, setPhase] = useState<"hidden" | "shown" | "exiting">(
    isLoading ? "shown" : "hidden",
  );
  const startedAtRef = useRef<number | null>(isLoading ? performance.now() : null);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;

    if (isLoading) {
      if (startedAtRef.current == null) startedAtRef.current = performance.now();
      setPhase("shown");
      return () => {
        if (hideTimer) clearTimeout(hideTimer);
        if (fadeTimer) clearTimeout(fadeTimer);
      };
    }

    // Data ready — honor minimum visible time, then fade out
    const started = startedAtRef.current ?? performance.now();
    const remaining = Math.max(0, minMs - (performance.now() - started));

    hideTimer = setTimeout(() => {
      setPhase("exiting");
      fadeTimer = setTimeout(() => {
        setPhase("hidden");
        startedAtRef.current = null;
      }, EXIT_FADE_MS);
    }, remaining);

    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, [isLoading, minMs]);

  return {
    show: phase !== "hidden",
    exiting: phase === "exiting",
  };
}

function useRotatingMessage(enabled: boolean) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, MESSAGE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [enabled]);

  return LOADING_MESSAGES[index];
}

function BuilderSkeletonBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.55]" aria-hidden>
      <div className="flex h-full min-h-screen flex-col bg-apple-canvas-parchment">
        <div className="flex h-12 shrink-0 items-center gap-3 border-b border-apple-hairline/70 bg-apple-canvas/80 px-4">
          <div className="h-7 w-7 rounded-apple-sm bg-apple-hairline/80" />
          <div className="h-3 w-28 rounded-full bg-apple-hairline/70" />
          <div className="ml-auto flex gap-2">
            <div className="h-7 w-16 rounded-apple-pill bg-apple-hairline/60" />
            <div className="h-7 w-20 rounded-apple-pill bg-apple-primary/20" />
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="hidden w-[260px] shrink-0 border-r border-apple-hairline/60 bg-apple-canvas/70 p-3 sm:block">
            <div className="mb-3 h-8 rounded-apple-pill bg-apple-hairline/50" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-apple-lg bg-apple-hairline/40" />
              ))}
            </div>
          </div>

          <div className="min-w-0 flex-1 p-4 sm:p-6">
            <div className="mx-auto flex h-full max-w-4xl flex-col gap-4 rounded-apple-lg border border-apple-hairline/50 bg-apple-canvas/60 p-4 shadow-sm">
              <div className="h-40 rounded-apple-md bg-gradient-to-br from-apple-hairline/50 to-apple-canvas-parchment" />
              <div className="h-4 w-2/3 rounded-full bg-apple-hairline/50" />
              <div className="h-3 w-1/2 rounded-full bg-apple-hairline/40" />
              <div className="mt-2 grid grid-cols-3 gap-3">
                <div className="aspect-square rounded-apple-md bg-apple-hairline/35" />
                <div className="aspect-square rounded-apple-md bg-apple-hairline/35" />
                <div className="aspect-square rounded-apple-md bg-apple-hairline/35" />
              </div>
            </div>
          </div>

          <div className="hidden w-[300px] shrink-0 border-l border-apple-hairline/60 bg-apple-canvas/70 p-3 lg:block">
            <div className="mb-3 h-3 w-24 rounded-full bg-apple-hairline/50" />
            <div className="space-y-3">
              <div className="h-9 rounded-apple-pill bg-apple-hairline/40" />
              <div className="h-9 rounded-apple-pill bg-apple-hairline/40" />
              <div className="h-24 rounded-apple-lg bg-apple-hairline/35" />
              <div className="h-9 rounded-apple-pill bg-apple-hairline/40" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-apple-canvas-parchment/40 backdrop-blur-[6px] motion-reduce:backdrop-blur-none" />
    </div>
  );
}

type BuilderLoadingScreenProps = {
  className?: string;
  exiting?: boolean;
  message?: string;
  compact?: boolean;
};

export function BuilderLoadingScreen({
  className,
  exiting = false,
  message,
  compact = false,
}: BuilderLoadingScreenProps) {
  const rotating = useRotatingMessage(!message);
  const label = message ?? rotating;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className={cn(
        "relative flex min-h-screen items-center justify-center overflow-hidden bg-apple-canvas-parchment transition-opacity duration-300 ease-out motion-reduce:transition-none",
        exiting ? "opacity-0" : "opacity-100",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,255,255,0.92) 0%, transparent 70%), linear-gradient(180deg, #f5f5f7 0%, #ececef 55%, #f5f5f7 100%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-multiply motion-reduce:hidden"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      {!compact && <BuilderSkeletonBackdrop />}

      <div className="relative z-10 w-full max-w-[420px] px-6 py-12 text-center">
        <div className="relative mx-auto mb-8 flex h-[72px] w-[72px] items-center justify-center">
          <div
            className="builder-load-ring pointer-events-none absolute -inset-6 rounded-full border border-apple-primary/15 motion-reduce:hidden"
            aria-hidden
          />
          <div className="builder-load-orb relative flex h-[72px] w-[72px] items-center justify-center rounded-[18px] bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] ring-1 ring-apple-hairline">
            <Image
              src="/logo.png"
              alt=""
              width={36}
              height={36}
              priority
              className="builder-load-logo h-9 w-9 object-contain"
            />
          </div>
        </div>

        <p key={label} className="builder-load-message text-body-strong text-apple-ink">
          {label}
        </p>
        <p className="mt-2 text-caption text-apple-ink-muted-48">
          Setting up a calm, ready-to-edit workspace
        </p>

        <div className="mx-auto mt-8 h-[2px] w-full max-w-[240px] overflow-hidden rounded-full bg-apple-hairline/80">
          <div className="builder-load-progress h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-apple-primary to-transparent motion-reduce:w-full motion-reduce:animate-none motion-reduce:bg-apple-primary/50" />
        </div>
      </div>
    </div>
  );
}
