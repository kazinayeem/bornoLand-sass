"use client";

import { EmptyState, NoResults } from "@/components/ui/empty-state";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type DataGridEmptyProps = {
  search?: string;
  onClearSearch?: () => void;
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: ReactNode;
};

export function DataGridEmpty({
  search,
  onClearSearch,
  icon,
  title = "No data",
  description,
  action,
}: DataGridEmptyProps) {
  if (search) {
    return <NoResults search={search} onClear={onClearSearch} />;
  }
  return <EmptyState icon={icon} title={title} description={description} action={action} />;
}
