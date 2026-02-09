'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { formatDateRange } from '@/lib/date-utils';
import {
  FaSearch,
  FaEllipsisV,
  FaRegCalendarAlt,
  FaMapMarkerAlt,
  FaPlus,
  FaSlidersH,
} from 'react-icons/fa';
import Link from 'next/link';

type Trip = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
};

export default function TripsPage() {
  const { isLoading: authLoading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await api.get<Trip[]>('/trips/');
        setTrips(data);
      } catch (error) {
        console.error('Failed to fetch trips:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchTrips();
    }
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-400 py-8 bg-[url('/auth_background.png')] bg-cover">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Title */}
        <h1 className="text-4xl font-semibold text-neutral-400 mb-8 text-left md:text-center">
          My Trips
        </h1>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-100" />
            <input
              type="text"
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-surface-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
            />
          </div>

          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-surface-500 rounded-xl hover:bg-surface-400 transition-colors shadow-sm">
            <FaSlidersH className="text-neutral-100" />
          </button>
        </div>

        {/* Trips List */}
        {trips.length === 0 ? (
          <div className="my-4 text-center py-16">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaMapMarkerAlt className="text-3xl text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-200 mb-2">
              No trips yet
            </h2>
            <p className="text-neutral-100 mb-6">
              Start planning your next adventure!
            </p>
            <button className="px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium">
              Create Your First Trip
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-secondary rounded-xl hover:bg-secondary-300 transition-colors shadow-sm my-4">
              <FaPlus className="text-surface-100" />
              <span className="text-surface-100 font-medium">
                Create New Plan
              </span>
            </button>

            {trips.map((trip) => (
              <div
                key={trip.id}
                className="group relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Menu Icon */}
                <button className="absolute top-4 right-4 p-2 text-neutral-100 hover:text-neutral-200 rounded-full hover:bg-surface-400 transition-colors z-10">
                  <FaEllipsisV className="text-sm" />
                </button>

                <Link
                  href={`/trips/${trip.id}`}
                  className="flex gap-4 items-center"
                >
                  {/* Left Icon Box */}
                  <div className="shrink-0 w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center">
                    <FaMapMarkerAlt className="text-2xl text-primary" />
                  </div>

                  {/* Trip Details */}
                  <div className="flex flex-col flex-1 gap-1.5 py-1">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-neutral-400 leading-tight">
                      {trip.name}
                    </h3>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-neutral-100 text-sm font-medium">
                      <FaRegCalendarAlt className="text-neutral-100" />
                      <span>
                        {formatDateRange(trip.start_date, trip.end_date)}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
