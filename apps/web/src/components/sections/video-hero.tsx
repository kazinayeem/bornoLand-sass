"use client";

import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, type SectionData } from "./section-renderer";

export function VideoHero({ section }: { section: SectionData }) {
  const p = section.props;
  const isYouTube = p.videoUrl?.includes("youtube.com") || p.videoUrl?.includes("youtu.be");

  return (
    <SectionWrapper section={section} className="relative overflow-hidden min-h-[500px] md:min-h-[700px] flex items-center">
      {p.videoUrl && !isYouTube && (
        <video
          autoPlay muted={p.muted !== "false"} loop={p.loop !== "false"} playsInline
          poster={p.posterImage || undefined}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={p.videoUrl} type="video/mp4" />
        </video>
      )}
      {p.videoUrl && isYouTube && (
        <div className="absolute inset-0">
          <iframe
            src={`https://www.youtube.com/embed/${extractYouTubeId(p.videoUrl)}?autoplay=1&mute=${p.muted !== "false" ? "1" : "0"}&loop=${p.loop !== "false" ? "1" : "0"}&controls=0&showinfo=0&rel=0`}
            className="h-full w-full pointer-events-none"
            style={{ filter: "brightness(0.6)" }}
          />
        </div>
      )}
      {!p.videoUrl && (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
      )}
      <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
        {p.headline && (
          <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{p.headline}</h1>
        )}
        {p.subheadline && (
          <p className="mt-4 text-sm text-white/80 sm:text-base">{p.subheadline}</p>
        )}
        {p.buttonText && (
          <Link href={p.buttonLink || "#"}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-apple-ink hover:bg-apple-canvas-parchment">
            {p.buttonText}
          </Link>
        )}
      </div>
    </SectionWrapper>
  );
}

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : "";
}
