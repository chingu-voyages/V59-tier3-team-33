import { cookieManager } from './cookies';
import { useAuthStore } from '@/store/authStore';

const API_BASE = process.env.NEXT_PUBLIC_DJANGO_API_BASE?.replace(/\/$/, '') || '';

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
}

/**
 * Fetch helper that works in both client and server
 * Auto-handles auth tokens and refresh on 401
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { requiresAuth = true, headers = {}, ...restOptions } = options;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const token = cookieManager.getAccessToken();

  const fetchOptions: RequestInit = {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(requiresAuth && token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include', // Send cookies (for refresh token)
  };

  try {
    const response = await fetch(url, fetchOptions);

    // Try to refresh token on 401
    if (response.status === 401 && requiresAuth) {
      const refreshed = await refreshAccessToken();
      
      if (refreshed) {
        // Retry with new token
        const newToken = cookieManager.getAccessToken();
        const retryOptions: RequestInit = {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            Authorization: `Bearer ${newToken}`,
          },
        };
        
        const retryResponse = await fetch(url, retryOptions);
        
        if (!retryResponse.ok) {
          throw new Error(`API Error: ${retryResponse.status}`);
        }
        
        // Handle empty responses (like DELETE 204 No Content)
        const retryContentType = retryResponse.headers.get('content-type');
        if (!retryContentType || !retryContentType.includes('application/json')) {
          return {} as T;
        }

        const retryText = await retryResponse.text();
        if (!retryText || retryText.trim() === '') {
          return {} as T;
        }

        const retryData = JSON.parse(retryText);
        return unwrapResponse<T>(retryData);
      } else {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.detail || `API Error: ${response.status}`;
      throw new Error(errorMessage);
    }

    // Handle empty responses (like DELETE 204 No Content)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Return empty object for non-JSON responses
      return {} as T;
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      // Return empty object for empty responses
      return {} as T;
    }

    const data = JSON.parse(text);
    return unwrapResponse<T>(data);
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}

// Unwrap Django's { status, message, data } response structure
function unwrapResponse<T>(response: any): T {
  if (response && typeof response === 'object' && 'status' in response && 'data' in response) {
    return response.data as T;
  }
  return response as T;
}

// Refresh access token using httpOnly refresh cookie
async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/token/refresh/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      const newAccessToken = data.access || data.key;
      
      if (newAccessToken) {
        cookieManager.setAccessToken(newAccessToken);
        
        // Update store if on client side
        if (typeof window !== 'undefined') {
          useAuthStore.getState().accessToken = newAccessToken;
        }
        
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
}

// Convenience methods for common HTTP verbs
export const api = {
  get: <T = any>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = any>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
