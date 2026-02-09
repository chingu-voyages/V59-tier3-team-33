'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to trips
    if (!isLoading && isAuthenticated) {
      router.push('/trips');
    }
  }, [isAuthenticated, isLoading, router]);

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
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-[#F59E0B] hover:bg-[#F7B13B] text-white rounded-lg font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="px-6 py-3 border border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-white rounded-lg font-medium"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
