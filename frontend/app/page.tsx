'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { FaChevronRight } from 'react-icons/fa';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-no-repeat bg-top-left"
        style={{ backgroundImage: 'url(/home_background.jpg)' }}
      >
        {/* White Overlay */}
        <div className="absolute inset-0 bg-surface-50 opacity-60" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-neutral-400 leading-tight">
                Plan Smarter.
                <br />
                Travel Faster.
              </h1>

              <p className="text-xl text-neutral-300 max-w-md">
                Turn your destinations into the most efficient route.
              </p>

              <div className="pt-4">
                {isAuthenticated ? (
                  <Link
                    href="/trips"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-secondary-400 hover:bg-secondary-300 text-neutral-400 rounded-lg font-semibold text-base transition-colors shadow-lg"
                  >
                    My Trips
                    <FaChevronRight className="text-sm" />
                  </Link>
                ) : (
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-secondary-400 hover:bg-secondary-300 text-neutral-400 rounded-lg font-semibold text-base transition-colors shadow-lg"
                  >
                    Get Started
                    <FaChevronRight className="text-sm" />
                  </Link>
                )}
              </div>
            </div>

            {/* Right Side - Image Grid */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {/* Top Row */}
                <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="/home_pic1.png"
                    alt="Destination 1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="/home_pic2.png"
                    alt="Destination 2"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Bottom Row */}
                <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="/home_pic3.png"
                    alt="Destination 3"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="/home_pic4.jpg"
                    alt="Destination 4"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Decorative Dots */}
              <div className="absolute -top-8 right-1/4 w-3 h-3 bg-primary-300 rounded-full opacity-60" />
              <div className="absolute top-1/3 -right-4 w-4 h-4 bg-secondary-300 rounded-full opacity-60" />
              <div className="absolute -bottom-4 left-1/3 w-3 h-3 bg-primary-400 rounded-full opacity-60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
