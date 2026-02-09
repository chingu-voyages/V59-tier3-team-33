'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold">Welcome to Trip Planner</h1>
        <p className="text-xl text-foreground-light">
          Plan your perfect journey with ease
        </p>

        <div className="flex gap-4 justify-center mt-8">
          {isAuthenticated ? (
            <Link
              href="/trips"
              className="px-6 py-3 bg-primary-400 hover:bg-primary-500 text-surface-50 rounded-lg font-medium"
            >
              My Trips
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-6 py-3 bg-secondary-400 hover:bg-secondary-300 text-surface-50 rounded-lg font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-6 py-3 border border-secondary-400 text-secondary-400 hover:bg-secondary-400 hover:text-surface-50 rounded-lg font-medium transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
