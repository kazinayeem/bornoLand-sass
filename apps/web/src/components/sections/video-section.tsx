"use client";

import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";

function getYouTubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return m ? m[1] : url;
}

function getVimeoId(url: string) {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : url;
}

export function VideoSection({ section }: { section: SectionData }) {
  const p = section.props;
  const videoUrl = p.videoUrl || p.videoId || "";
  const isYouTube = videoUrl.includes("youtube") || videoUrl.includes("youtu.be") || section.type === "youtube-embed";
  const isVimeo = videoUrl.includes("vimeo") || section.type === "vimeo-embed";
  const aspectRatio = p.aspectRatio || "16:9";
  const ratioClass = aspectRatio === "4:3" ? "aspect-[4/3]" : aspectRatio === "1:1" ? "aspect-square" : aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-video";

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-3xl px-4">
        <SectionTitle title={p.title || ""} subtitle={p.description || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
        <div className={`${ratioClass} rounded-xl overflow-hidden bg-zinc-100`}>
          {isYouTube ? (
            <iframe src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}?autoplay=${p.autoplay === "true" ? 1 : 0}&controls=${p.showControls !== "false" ? 1 : 0}&loop=${p.loop === "true" ? 1 : 0}`}
              className="h-full w-full" allow="autoplay; fullscreen" />
          ) : isVimeo ? (
            <iframe src={`https://player.vimeo.com/video/${getVimeoId(videoUrl)}?autoplay=${p.autoplay === "true" ? 1 : 0}`}
              className="h-full w-full" allow="autoplay; fullscreen" />
          ) : videoUrl ? (
            <video src={videoUrl} controls={p.controls !== "false"} poster={p.posterImage || undefined} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-300">Video Embed</div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
