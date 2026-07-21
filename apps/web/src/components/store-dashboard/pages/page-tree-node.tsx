"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText, Folder, FolderOpen, ChevronRight, ChevronDown,
  Globe, EyeOff, Clock, Archive, MoreHorizontal,
  ExternalLink, Copy, Pencil, Trash2, FilePlus, Layers,
  Eye, Download, Lock,
} from "lucide-react";
import type { StorePage } from "@/redux/api/store-page-api";
import { isBuilderEditablePage } from "@/lib/storefront/system-pages";
import { cn } from "@/lib/utils";

type Props = {
  page: StorePage & { children?: StorePage[] };
  depth: number;
  selectedId: string | null;
  onSelect: (page: StorePage) => void;
  onDoubleClick: (page: StorePage) => void;
  onContextMenu: (e: React.MouseEvent, page: StorePage) => void;
};

const statusConfig: Record<string, { icon: typeof Globe; className: string; label: string }> = {
  published: { icon: Globe, className: "text-emerald-600 bg-emerald-50 border-emerald-200", label: "Published" },
  draft: { icon: EyeOff, className: "text-apple-ink-muted-80 bg-apple-canvas-parchment border-apple-hairline", label: "Draft" },
  scheduled: { icon: Clock, className: "text-blue-600 bg-blue-50 border-blue-200", label: "Scheduled" },
  archived: { icon: Archive, className: "text-apple-ink-muted-48 bg-apple-canvas-parchment border-apple-hairline", label: "Archived" },
};

export function PageTreeNode({ page, depth, selectedId, onSelect, onDoubleClick, onContextMenu }: Props) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = page.children && page.children.length > 0;
  const isSelected = selectedId === page._id;
  const StatusIcon = statusConfig[page.status]?.icon ?? EyeOff;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm cursor-pointer transition-all",
          "hover:bg-apple-canvas-parchment",
          isSelected && "bg-apple-canvas-parchment ring-1 ring-zinc-300",
          depth > 0 && "ml-0"
        )}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
        onClick={() => { onSelect(page); if (hasChildren) setExpanded(!expanded); }}
        onDoubleClick={() => onDoubleClick(page)}
        onContextMenu={(e) => onContextMenu(e, page)}
      >
        {/* Expand/collapse for folders */}
        {page.isFolder ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-zinc-200"
          >
            {expanded ? <ChevronDown className="h-3.5 w-3.5 text-apple-ink-muted-48" /> : <ChevronRight className="h-3.5 w-3.5 text-apple-ink-muted-48" />}
          </button>
        ) : hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-zinc-200"
          >
            {expanded ? <ChevronDown className="h-3.5 w-3.5 text-apple-ink-muted-48" /> : <ChevronRight className="h-3.5 w-3.5 text-apple-ink-muted-48" />}
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* Icon */}
        {page.isFolder ? (
          expanded ? <FolderOpen className="h-4 w-4 text-amber-500" /> : <Folder className="h-4 w-4 text-amber-500" />
        ) : (
          <FileText className={cn("h-4 w-4", page.isHomePage ? "text-blue-500" : "text-apple-ink-muted-48")} />
        )}

        {/* Title */}
        <span className={cn("flex-1 truncate font-medium", isSelected ? "text-apple-ink" : "text-apple-ink-muted-80")}>
          {page.title}
          {page.isHomePage && <span className="ml-1.5 text-[10px] font-normal text-blue-500">HOME</span>}
        </span>

        {/* Status badge */}
        <span className={cn(
          "hidden sm:inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
          statusConfig[page.status]?.className ?? ""
        )}>
          <StatusIcon className="h-3 w-3" />
          {statusConfig[page.status]?.label}
        </span>

        {/* Actions (visible on hover) */}
        <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
          {isBuilderEditablePage(page) ? (
            <button
              onClick={(e) => { e.stopPropagation(); onDoubleClick(page); }}
              className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-zinc-200 text-apple-ink-muted-48 hover:text-apple-ink-muted-80"
              title="Open in Builder"
            >
              <Layers className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <button
            onClick={(e) => { e.stopPropagation(); onContextMenu(e, page); }}
            className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-zinc-200 text-apple-ink-muted-48 hover:text-apple-ink-muted-80"
            title="More actions"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          {page.children!.map((child) => (
            <PageTreeNode
              key={child._id}
              page={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onDoubleClick={onDoubleClick}
              onContextMenu={onContextMenu}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
