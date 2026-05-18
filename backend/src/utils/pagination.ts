export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const paginate = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> => ({
  data,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit) || 1,
});

export const getPaginationParams = (query: {
  page?: string;
  limit?: string;
}): { page: number; limit: number; offset: number } => {
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

export const getCountQuery = (sql: string): string => {
  return `SELECT COUNT(*) AS total FROM (${sql}) AS _count`;
};
