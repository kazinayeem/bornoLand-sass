export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ListQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  category?: string;
  brand?: string;
  storeId?: string;
  role?: string;
  featured?: string;
  stockStatus?: string;
  priceMin?: string | number;
  priceMax?: string | number;
};
