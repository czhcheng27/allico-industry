export type ApiResponse<T = unknown> = {
  code: number;
  success: boolean;
  message: string;
  data: T;
};

export type PaginatedResult<T> = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  items?: T[];
};
