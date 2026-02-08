'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Trip = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
};

export default function TripsPage() {
  const apiBase = process.env.NEXT_PUBLIC_DJANGO_API_BASE;

  const djangoBase = useMemo(() => {
    if (!apiBase) throw new Error('Missing NEXT_PUBLIC_DJANGO_API_BASE');
    return apiBase.replace(/\/$/, '');
  }, [apiBase]);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrips() {
      setLoading(true);
      setError(null);

      const jwt = localStorage.getItem('access_token');
      if (!jwt) {
        setError('Not logged in. Please sign in.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${djangoBase}/trips/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
          },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Failed to load trips (${res.status}). ${text}`);
        }

        const data = await res.json();
        // If your API returns a wrapper like { data: [...] }, support that too:
        const list = Array.isArray(data) ? data : data.data;

        setTrips(list ?? []);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load trips');
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, [djangoBase]);

  if (loading) return <div style={{ padding: 16 }}>Loading trips…</div>;

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <p style={{ color: 'crimson' }}>{error}</p>
        <Link href="/auth/login" style={{ textDecoration: 'underline' }}>
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <main style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Your trips</h1>

      {trips.length === 0 ? (
        <p style={{ marginTop: 12, opacity: 0.8 }}>
          No trips yet. Create one.
        </p>
      ) : (
        <ul style={{ marginTop: 12, display: 'grid', gap: 12, padding: 0, listStyle: 'none' }}>
          {trips.map((t) => (
            <li key={t.id} style={{ border: '1px solid #e5e5e5', borderRadius: 12, padding: 12 }}>
              <Link href={`/trips/${t.id}`} style={{ display: 'block' }}>
                <div style={{ fontWeight: 700 }}>{t.name}</div>
                <div style={{ opacity: 0.8, marginTop: 4 }}>
                  {t.start_date} → {t.end_date}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
