"use client";

import { Monitor, Smartphone, Tablet, Undo2, Redo2, ZoomIn, ZoomOut, Maximize, Minimize } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { setDevice, setZoom } from "@/redux/slices/preview-slice";
import { setFullscreen, undoBuilder, redoBuilder } from "@/redux/slices/builder-slice";
import { cn } from "@/lib/utils";

const devices = [
  { key: "desktop" as const, icon: Monitor, label: "Desktop" },
  { key: "laptop" as const, icon: Monitor, label: "Laptop" },
  { key: "tablet" as const, icon: Tablet, label: "Tablet" },
  { key: "mobile" as const, icon: Smartphone, label: "Mobile" },
];

export function BuilderFloatingToolbar() {
  const dispatch = useDispatch();
  const device = useSelector((s: RootState) => s.preview.device);
  const zoom = useSelector((s: RootState) => s.preview.zoom);
  const pastCount = useSelector((s: RootState) => s.builder.past.length);
  const futureCount = useSelector((s: RootState) => s.builder.future.length);
  const fullscreen = useSelector((s: RootState) => s.builder.fullscreen);

  const btn =
    "flex h-9 w-9 items-center justify-center rounded-xl text-apple-ink-muted-48 transition hover:bg-apple-canvas-parchment hover:text-apple-ink disabled:opacity-30";

  return (
    <div
      className="pointer-events-auto fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-apple-hairline/80 bg-apple-canvas/95 p-1.5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)] backdrop-blur-xl"
      role="toolbar"
      aria-label="Canvas controls"
    >
      <div className="flex items-center gap-0.5 rounded-xl border border-apple-hairline/60 bg-apple-canvas-parchment/50 p-0.5">
        <button type="button" className={btn} onClick={() => dispatch(setZoom(zoom - 25))} title="Zoom out" aria-label="Zoom out">
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="min-w-[3rem] px-1 text-center text-[11px] font-semibold tabular-nums text-apple-ink-muted-80">
          {zoom}%
        </span>
        <button type="button" className={btn} onClick={() => dispatch(setZoom(zoom + 25))} title="Zoom in" aria-label="Zoom in">
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      <div className="mx-0.5 h-6 w-px bg-apple-hairline/80" />

      <div className="flex items-center gap-0.5 rounded-xl border border-apple-hairline/60 bg-apple-canvas-parchment/50 p-0.5">
        {devices.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            type="button"
            title={label}
            aria-label={label}
            onClick={() => dispatch(setDevice(key))}
            className={cn(
              btn,
              device === key && "bg-apple-canvas text-apple-ink shadow-sm ring-1 ring-apple-hairline/50"
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      <div className="mx-0.5 h-6 w-px bg-apple-hairline/80" />

      <button
        type="button"
        className={btn}
        onClick={() => dispatch(setFullscreen(!fullscreen))}
        title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
        aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
      >
        {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
      </button>

      <div className="mx-0.5 h-6 w-px bg-apple-hairline/80" />

      <button
        type="button"
        className={btn}
        disabled={pastCount === 0}
        onClick={() => dispatch(undoBuilder())}
        title="Undo"
        aria-label="Undo"
      >
        <Undo2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={btn}
        disabled={futureCount === 0}
        onClick={() => dispatch(redoBuilder())}
        title="Redo"
        aria-label="Redo"
      >
        <Redo2 className="h-4 w-4" />
      </button>
    </div>
  );
}
