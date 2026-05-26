"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { StorefrontSectionLike } from "./storefront-types";

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function VideoSection({ section }: { section?: StorefrontSectionLike }) {
  const props = section?.props ?? {};
  const videoUrl = (props.videoUrl as string) || "";
  const posterUrl = (props.posterUrl as string) || "";
  const title = (props.title as string) || "";
  const caption = (props.caption as string) || "";
  const buttonText = (props.buttonText as string) || "";
  const buttonLink = (props.buttonLink as string) || "#";
  const bg = (props.backgroundColor as string) || "";
  const [showModal, setShowModal] = useState(false);

  const youtubeId = getYouTubeId(videoUrl);

  return (
    <section className="py-12 sm:py-16" style={{ backgroundColor: bg || undefined }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{title}</h2>
            {caption && <p className="mt-1 text-sm text-zinc-500">{caption}</p>}
          </div>
        )}
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl">
          <button onClick={() => setShowModal(true)} className="group relative block w-full">
            <div className="aspect-video bg-zinc-200">
              {posterUrl ? (
                <img src={posterUrl} alt={title || "Video"} className="h-full w-full object-cover" />
              ) : youtubeId ? (
                <img src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                  alt="Video thumbnail" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-300" />
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition group-hover:scale-105">
                <Play className="ml-0.5 h-6 w-6 text-zinc-900" />
              </div>
            </div>
          </button>
        </div>
        {buttonText && (
          <div className="mt-6 text-center">
            <Link href={buttonLink} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 underline underline-offset-4">
              {buttonText}
            </Link>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowModal(false)}
                className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70">
                <X className="h-4 w-4" />
              </button>
              <div className="aspect-video">
                {youtubeId ? (
                  <iframe src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                    title={title || "Video"} allow="autoplay; encrypted-media" allowFullScreen
                    className="h-full w-full" />
                ) : videoUrl ? (
                  <video src={videoUrl} controls autoPlay className="h-full w-full" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-500">No video URL provided</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
