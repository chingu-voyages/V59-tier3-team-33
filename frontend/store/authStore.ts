import { create } from 'zustand';
import type { AuthState, User } from '@/types/auth';
import { cookieManager } from '@/lib/cookies';

const API_BASE = process.env.NEXT_PUBLIC_DJANGO_API_BASE?.replace(/\/$/, '') || '';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user: User, accessToken: string) => {
    cookieManager.setAccessToken(accessToken);
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  clearAuth: () => {
    cookieManager.removeAccessToken();
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  logout: async () => {
    try {
      await fetch(`${API_BASE}/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(get().accessToken && {
            Authorization: `Bearer ${get().accessToken}`,
          }),
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      get().clearAuth();
    }
  },

  checkAuth: async () => {
    const token = cookieManager.getAccessToken();
    
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/user/`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.data || data;
        
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        get().clearAuth();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      get().clearAuth();
    }
  },
}));
