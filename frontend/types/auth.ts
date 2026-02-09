export interface User {
  pk?: string;
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuthTokens {
  access: string;
  refresh?: string;
}

export interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
}

export interface LoginResponseData {
  access: string;
  refresh?: string;
  user: User;
}

export interface LoginResponse {
  access?: string;
  key?: string;
  user?: User;
  status?: boolean;
  message?: string;
  data?: LoginResponseData;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}
