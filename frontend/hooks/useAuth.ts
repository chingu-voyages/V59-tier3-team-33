import { useAuthStore } from '@/store/authStore';

// Hook for accessing auth state (like Vue composables)
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const logout = useAuthStore((state) => state.logout);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    checkAuth,
  };
}
