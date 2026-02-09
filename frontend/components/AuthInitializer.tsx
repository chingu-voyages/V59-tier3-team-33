'use client';

import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

// Initialize auth state on app load
export function AuthInitializer() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return null;
}
