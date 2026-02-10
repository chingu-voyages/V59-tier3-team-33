export interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  status: false;
  message: string;
  errors?: Record<string, string[]>;
  detail?: string;
}

export interface PaginationMeta {
  count: number;
  next: string | null;
  previous: string | null;
}

export interface PaginatedResponse<T> {
  status: boolean;
  message: string;
  data: {
    results: T[];
    pagination: PaginationMeta;
  };
}
