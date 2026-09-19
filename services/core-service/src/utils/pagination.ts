/**
 * Pagination utility for MongoDB queries.
 *
 * Usage:
 *   const { page, limit, skip } = parsePagination(req.query);
 *   const items = await Model.find(filter).skip(skip).limit(limit);
 *   const total = await Model.countDocuments(filter);
 *   return sendPaginated(res, items, buildPaginationMeta(page, limit, total));
 */

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ParsedPagination {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Parses and clamps page/limit from the request query string.
 * Always returns safe values — no need to validate in individual repositories.
 */
export function parsePagination(query: {
  page?: unknown;
  limit?: unknown;
}): ParsedPagination {
  const rawPage = parseInt(String(query.page ?? DEFAULT_PAGE), 10);
  const rawLimit = parseInt(String(query.limit ?? DEFAULT_LIMIT), 10);

  const page = isNaN(rawPage) || rawPage < 1 ? DEFAULT_PAGE : rawPage;
  const limit = isNaN(rawLimit) || rawLimit < 1
    ? DEFAULT_LIMIT
    : Math.min(rawLimit, MAX_LIMIT);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

/**
 * Builds the pagination metadata object for API responses.
 */
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
