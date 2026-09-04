"use client";

import React, { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LightboxImageInfo {
  src: string;
  titleBn: string;
  titleEn: string;
  route: string;
  module: string;
  role: string;
}

interface LightboxModalProps {
  isOpen: boolean;
  images: LightboxImageInfo[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function LightboxModal({
  isOpen,
  images,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxModalProps) {
  const [isZoomed, setIsZoomed] = React.useState(false);

  const current = images[currentIndex];

  const handlePrev = useCallback(() => {
    setIsZoomed(false);
    onNavigate((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    setIsZoomed(false);
    onNavigate((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Screenshot lightbox preview"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/90 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200"
    >
      {/* Top Bar */}
      <div className="flex w-full max-w-7xl items-center justify-between gap-4 py-2 text-white">
        <div className="flex items-center gap-3 truncate">
          <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-300 border border-blue-500/30">
            {current.role}
          </span>
          <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-mono text-zinc-300">
            {current.module}
          </span>
          <h2 className="text-base sm:text-lg font-semibold truncate">
            {current.titleBn} <span className="text-zinc-400 font-normal text-sm">({current.titleEn})</span>
          </h2>
          <span className="hidden md:inline-flex items-center gap-1 text-xs text-zinc-400 font-mono">
            {current.route}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsZoomed((z) => !z)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
            title={isZoomed ? "Zoom Out (100%)" : "Zoom In (150%)"}
            aria-label={isZoomed ? "Zoom Out" : "Zoom In"}
          >
            {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800/80 text-zinc-300 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
            title="Close (Esc)"
            aria-label="Close Lightbox"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex flex-1 w-full max-w-7xl items-center justify-center overflow-auto my-2 select-none">
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white hover:bg-blue-600 transition-all backdrop-blur-xs cursor-pointer"
            title="Previous (Left arrow)"
            aria-label="Previous screenshot"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Image Container */}
        <div
          className={cn(
            "relative transition-transform duration-200 flex items-center justify-center",
            isZoomed ? "scale-125 cursor-zoom-out" : "scale-100 cursor-zoom-in"
          )}
          onClick={() => setIsZoomed((z) => !z)}
        >
          <img
            src={current.src}
            alt={`${current.titleEn} screenshot`}
            className="max-h-[75vh] w-auto max-w-full rounded-lg border border-zinc-700/60 shadow-2xl object-contain"
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white hover:bg-blue-600 transition-all backdrop-blur-xs cursor-pointer"
            title="Next (Right arrow)"
            aria-label="Next screenshot"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Bottom Counter & Caption */}
      <div className="flex w-full max-w-7xl items-center justify-between text-xs text-zinc-400 py-2 border-t border-zinc-800">
        <div>
          <span>BornoLand Real UI Documentation</span> &bull;{" "}
          <span className="text-zinc-300">Image {currentIndex + 1} of {images.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Use &larr; &rarr; arrows to navigate</span>
        </div>
      </div>
    </div>
  );
}
