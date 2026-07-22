"use client";

import { memo } from "react";
import { Copy, ExternalLink, Eye, Link2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import type { DataGridRowAction } from "./types";

type DataGridRowActionsProps<T> = {
  row: T;
  actions: DataGridRowAction<T>[];
};

const ICONS = {
  view: Eye,
  edit: Pencil,
  duplicate: Copy,
  delete: Trash2,
  preview: Eye,
  "copy-link": Link2,
  "copy-id": Copy,
  "open-new-tab": ExternalLink,
};

function DataGridRowActionsInner<T>({ row, actions }: DataGridRowActionsProps<T>) {
  const visible = actions.filter((action) => !action.hidden?.(row));
  if (visible.length === 0) return null;

  return (
    <DropdownMenu
      placement="bottom-end"
      minWidth={180}
      trigger={
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink"
          aria-label="Row actions"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      }
      items={visible.map((action) => {
        const Icon = action.icon ?? ICONS[action.id as keyof typeof ICONS];
        return {
          key: action.id,
          label: action.label,
          icon: Icon,
          danger: action.variant === "danger",
          onClick: () => action.onClick(row),
        };
      })}
    />
  );
}

export const DataGridRowActions = memo(DataGridRowActionsInner) as typeof DataGridRowActionsInner;
