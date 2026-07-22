"use client";

import { Pagination } from "@/components/ui/pagination";

type DataGridPaginationProps = {
  page: number;
  totalPages: number;
  total?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isLoading?: boolean;
};

export function DataGridPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading,
}: DataGridPaginationProps) {
  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      total={total}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      isLoading={isLoading}
    />
  );
}
