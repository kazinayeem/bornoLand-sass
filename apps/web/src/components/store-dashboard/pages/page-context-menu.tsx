"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Pencil, Copy, Trash2, Archive, RotateCcw,
  Globe, EyeOff, Clock, ExternalLink, FilePlus,
  Layers, Download, ChevronRight, FileText, Lock,
} from "lucide-react";
import type { StorePage } from "@/redux/api/store-page-api";

type Props = {
  page: StorePage;
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: string, page: StorePage) => void;
};

export function PageContextMenu({ page, x, y, onClose, onAction }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const menuX = Math.min(x, window.innerWidth - 220);
  const menuY = Math.min(y, window.innerHeight - 460);

  const items: Array<{ label: string; icon: typeof Pencil; action: string; disabled?: boolean; divider?: boolean }> = [
    { label: "Open in Builder", icon: Layers as typeof Pencil, action: "open-builder" },
    { label: "Preview", icon: ExternalLink as typeof Pencil, action: "preview" },
    { label: "Generate Preview Link", icon: Lock as typeof Pencil, action: "generate-preview" },
    { label: "Rename", icon: Pencil, action: "rename" },
    { label: "Duplicate", icon: Copy, action: "duplicate", disabled: page.isHomePage },
    { label: "Copy Slug", icon: FileText, action: "copy-slug" },
    { label: "Copy URL", icon: Download, action: "copy-url" },
    { label: "———", icon: Pencil, action: "divider1", divider: true },
    ...(page.status === "published"
      ? [{ label: "Unpublish", icon: EyeOff as typeof Pencil, action: "unpublish" }]
      : page.status === "archived"
      ? [{ label: "Restore from Archive", icon: RotateCcw as typeof Pencil, action: "restore" }]
      : [{ label: "Publish", icon: Globe as typeof Pencil, action: "publish" }]
    ),
    { label: "Schedule Publish", icon: Clock as typeof Pencil, action: "schedule", disabled: page.isHomePage },
    { label: "———", icon: Pencil, action: "divider2", divider: true },
    { label: "Archive", icon: Archive as typeof Pencil, action: "archive", disabled: page.isHomePage },
    { label: "Move to Trash", icon: Trash2 as typeof Pencil, action: "delete", disabled: page.isHomePage },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed z-[100] w-52 rounded-xl border border-apple-hairline bg-white py-1 shadow-xl"
      style={{ left: menuX, top: menuY }}
    >
      <div className="px-3 py-2 border-b border-apple-divider-soft">
        <p className="text-xs font-semibold text-apple-ink truncate">{page.title}</p>
        <p className="text-[10px] text-apple-ink-muted-48 truncate">{page.slug}</p>
      </div>
      {items.map((item) => {
        if (item.divider) return <div key={item.action} className="my-1 border-t border-apple-divider-soft" />;
        const Icon = item.icon;
        return (
          <button
            key={item.action}
            disabled={item.disabled}
            onClick={() => { onAction(item.action, page); onClose(); }}
            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Icon className="h-3.5 w-3.5 text-apple-ink-muted-48" />
            {item.label}
          </button>
        );
      })}
    </motion.div>
  );
}
