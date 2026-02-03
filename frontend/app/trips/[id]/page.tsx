'use client';

import { use } from 'react';
import TripSavedPlaceSearch from '@/components/Trip/TripSavedPlaceSearch';

export default function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <main style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Trip</h1>
      <p style={{ opacity: 0.8, marginTop: 4 }}>Trip ID: {id}</p>

      <div style={{ marginTop: 16 }}>
        <TripSavedPlaceSearch />
      </div>
    </main>
  );
}
