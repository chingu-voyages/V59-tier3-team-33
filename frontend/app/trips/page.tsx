'use client';

import { useAuth } from '@/hooks/useAuth';

export default function TripsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">
        {user ? `${user.first_name}'s Trips` : 'Your Trips'}
      </h1>
      <p className="text-gray-600">Coming soon...</p>
    </div>
  );
}
