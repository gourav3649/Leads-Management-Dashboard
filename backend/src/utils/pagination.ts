import type { PaginationMeta } from '../types/api.types.js';

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

export const calculatePagination = ({
  page,
  limit,
  total,
}: PaginationOptions): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
};

export const getPaginationParams = (
  page?: number,
  limit?: number
): { page: number; limit: number } => {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(10, Math.max(1, Number(limit) || 10));
  return { page: p, limit: l };
};
