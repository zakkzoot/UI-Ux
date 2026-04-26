import { PaginationQuery, PaginatedResult } from '../types';

export const parsePagination = (
  query: Record<string, string | undefined>,
): Required<Pick<PaginationQuery, 'page' | 'limit'>> & PaginationQuery => {
  const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10) || 20));
  const sortBy = query.sortBy;
  const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';
  return { page, limit, sortBy, sortOrder };
};

export const buildPaginatedResult = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> => ({
  data,
  meta: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  },
});

export const getPrismaSkipTake = (
  page: number,
  limit: number,
): { skip: number; take: number } => ({
  skip: (page - 1) * limit,
  take: limit,
});
