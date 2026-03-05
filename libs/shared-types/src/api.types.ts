// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  status: 'success';
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedApiResponse<T> {
  status: 'success';
  data: T;
  pagination: PaginationMeta;
}

export interface ApiErrorResponse {
  status: 'error';
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Standard Error Codes
export const ERROR_CODES = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  ALREADY_REGISTERED: 'ALREADY_REGISTERED',
  TIER_SOLD_OUT: 'TIER_SOLD_OUT',
  EVENT_NOT_PUBLISHED: 'EVENT_NOT_PUBLISHED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
