export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sort?: Record<string, 1 | -1>;
}

export interface ListQueryParams extends PaginationParams {
  search?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  status?: string;
  category?: string;
  brand?: string;
  storeId?: string;
  role?: string;
  featured?: string;
  stockStatus?: string;
  priceMin?: number;
  priceMax?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  /** @deprecated use hasNextPage */
  hasNext?: boolean;
  /** @deprecated use hasPreviousPage */
  hasPrev?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, parseInt(String(query.page ?? "1"), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit ?? "20"), 10) || 20));
  const skip = (page - 1) * limit;

  let sort: Record<string, 1 | -1> | undefined;
  if (query.sort) {
    const [field, order] = String(query.sort).split(":");
    if (field) sort = { [field]: order === "asc" ? 1 : -1 };
  }

  return { page, limit, skip, sort };
}

export function parseListQuery(query: Record<string, unknown>): ListQueryParams {
  const base = parsePagination(query);
  const sortBy = String(query.sortBy || (base.sort ? Object.keys(base.sort)[0] : "") || "createdAt");
  const sortOrder = String(query.sortOrder || (base.sort?.[sortBy] === 1 ? "asc" : "desc")) === "asc" ? "asc" : "desc";

  const priceMinRaw = query.priceMin ?? query.minPrice;
  const priceMaxRaw = query.priceMax ?? query.maxPrice;

  return {
    ...base,
    sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 },
    sortBy,
    sortOrder,
    search: query.search ? String(query.search).trim() : undefined,
    status: query.status ? String(query.status) : undefined,
    category: query.category ? String(query.category) : undefined,
    brand: query.brand ? String(query.brand) : undefined,
    storeId: query.storeId ? String(query.storeId) : undefined,
    role: query.role ? String(query.role) : undefined,
    featured: query.featured !== undefined ? String(query.featured) : undefined,
    stockStatus: query.stockStatus ? String(query.stockStatus) : undefined,
    priceMin: priceMinRaw !== undefined && priceMinRaw !== "" ? Number(priceMinRaw) : undefined,
    priceMax: priceMaxRaw !== undefined && priceMaxRaw !== "" ? Number(priceMaxRaw) : undefined,
  };
}

export function buildPaginationMeta(total: number, params: Pick<PaginationParams, "page" | "limit">): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / params.limit));
  const hasNextPage = params.page < totalPages;
  const hasPreviousPage = params.page > 1;
  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    hasNext: hasNextPage,
    hasPrev: hasPreviousPage,
  };
}

export function paginatedResponse<T>(data: T[], total: number, params: PaginationParams): PaginatedResponse<T> {
  return {
    data,
    pagination: buildPaginationMeta(total, params),
  };
}

export function buildTextSearchFilter(
  search: string | undefined,
  fields: string[],
): Record<string, unknown> | undefined {
  if (!search?.trim()) return undefined;
  const q = escapeRegex(search.trim());
  return {
    $or: fields.map((field) => ({ [field]: { $regex: q, $options: "i" } })),
  };
}
