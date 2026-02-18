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
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Trip = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
};

export default function TripsPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'date-asc' | 'date-desc'>('date-desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteClick = (trip: Trip, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTripToDelete(trip);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tripToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/trips/${tripToDelete.id}/`);
      // Remove from local state
      setTrips(trips.filter(t => t.id !== tripToDelete.id));
      setDeleteDialogOpen(false);
      setTripToDelete(null);
    } catch (error) {
      console.error('Failed to delete trip:', error);
      alert('Failed to delete trip. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    alert('Edit feature coming soon!');
  };

  const filteredAndSortedTrips = trips
    .filter(trip => {
      if (searchQuery.length < 3) return true;
      const query = searchQuery.toLowerCase();
      return trip.name.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'date-asc':
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        case 'date-desc':
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
        default:
          return 0;
      }
    });

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
        <div className="flex flex-col sm:flex-row gap-4 mb-2">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-100" />
              <input
                type="text"
                placeholder="Search trips (min 3 characters)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-surface-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
              />
            </div>
            {searchQuery.length > 0 && searchQuery.length < 3 && (
              <p className="text-xs text-amber-600 mt-1.5 ml-1">
                Type at least 3 characters to search
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-surface-500 rounded-xl hover:bg-surface-100 transition-colors shadow-sm">
                <FaSlidersH className="text-neutral-300" />
                <span className="text-neutral-400 font-medium hidden sm:inline">Sort</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setSortBy('name-asc')}>
                <span className={sortBy === 'name-asc' ? 'font-semibold' : ''}>
                  Name (A-Z)
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('name-desc')}>
                <span className={sortBy === 'name-desc' ? 'font-semibold' : ''}>
                  Name (Z-A)
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('date-asc')}>
                <span className={sortBy === 'date-asc' ? 'font-semibold' : ''}>
                  Trip Date (Oldest First)
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('date-desc')}>
                <span className={sortBy === 'date-desc' ? 'font-semibold' : ''}>
                  Trip Date (Newest First)
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Trips List */}
        {filteredAndSortedTrips.length === 0 && trips.length === 0 ? (
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
            <button
              onClick={() => router.push('/trips/create')}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors font-medium"
            >
              Create Your First Trip
            </button>
          </div>
        ) : filteredAndSortedTrips.length === 0 ? (
          <div className="my-4 text-center py-16">
            <div className="w-20 h-20 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSearch className="text-3xl text-neutral-300" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-300 mb-2">
              No trips found
            </h2>
            <p className="text-neutral-200 mb-6">
              Try adjusting your search query
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => router.push('/trips/create')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-secondary-400 rounded-xl hover:bg-secondary-300 transition-colors shadow-sm my-4"
            >
              <FaPlus className="text-surface-100" />
              <span className="text-surface-100 font-medium">
                Create New Plan
              </span>
            </button>

            {filteredAndSortedTrips.map((trip) => (
              <div
                key={trip.id}
                className="group relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Menu Dropdown */}
                <div className="absolute top-4 right-4 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-2 text-neutral-100 hover:text-neutral-200 rounded-full hover:bg-surface-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaEllipsisV className="text-sm" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={handleEditClick}>
                        <FaEdit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                        <span className="ml-auto text-xs text-neutral-300">Soon</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteClick(trip, e as any)}
                        className="text-danger-600 focus:text-danger-600"
                      >
                        <FaTrash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Trip</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{tripToDelete?.name}"? This action cannot be undone and will permanently delete all events, accommodations, and saved places associated with this trip.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-danger-600 hover:bg-danger-700 focus:ring-danger-600"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
