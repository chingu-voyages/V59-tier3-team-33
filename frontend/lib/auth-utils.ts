import { useAuthStore } from '@/store/authStore';

// Check if user is authenticated (use outside React components)
export function isAuthenticated(): boolean {
  return useAuthStore.getState().isAuthenticated;
}

// Get current user (use outside React components)
export function getCurrentUser() {
  return useAuthStore.getState().user;
}

// Get access token (use outside React components)
export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

// Throw error if not authenticated (useful for protecting functions)
export function requireAuth() {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }
}
