export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sort?: Record<string, 1 | -1>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function parsePagination(query: Record<string, any>): PaginationParams {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20));
  const skip = (page - 1) * limit;

  let sort: Record<string, 1 | -1> | undefined;
  if (query.sort) {
    const [field, order] = (query.sort as string).split(":");
    if (field) {
      sort = { [field]: order === "asc" ? 1 : -1 };
    }
  }

  return { page, limit, skip, sort };
}

export function paginatedResponse<T>(data: T[], total: number, params: PaginationParams): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
      hasNext: params.page * params.limit < total,
      hasPrev: params.page > 1,
    },
  };
}
