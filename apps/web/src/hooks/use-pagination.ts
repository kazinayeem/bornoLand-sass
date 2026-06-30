import { useMemo } from "react";

type PaginationOptions = {
  page: number;
  pageSize: number;
  total: number;
};

export function usePagination({ page, pageSize, total }: PaginationOptions) {
  return useMemo(() => {
    const safePageSize = Math.max(1, pageSize);
    const totalPages = Math.max(1, Math.ceil(total / safePageSize));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const offset = (currentPage - 1) * safePageSize;
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    return {
      currentPage,
      pageSize: safePageSize,
      total,
      totalPages,
      offset,
      hasNextPage,
      hasPrevPage,
    };
  }, [page, pageSize, total]);
}
