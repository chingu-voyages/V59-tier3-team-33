'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TripCreate() {
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_DJANGO_API_BASE;

  const djangoBase = useMemo(() => {
    if (!apiBase) throw new Error('Missing NEXT_PUBLIC_DJANGO_API_BASE');
    return apiBase.replace(/\/$/, '');
  }, [apiBase]);

  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function createTrip() {
    setSaving(true);
    setStatus(null);

    const jwt = localStorage.getItem('access_token');
    if (!jwt) {
      setStatus('No access token. Please log in.');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${djangoBase}/trips/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          name: 'My Trip',
          start_date: '2026-02-03',
          end_date: '2026-02-05',
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Trip create failed (${res.status}). ${text}`);
      }

      const trip = await res.json();
      setStatus('Trip created ✅');
      router.push(`/trips/${trip.data.id}`);
    } catch (err: any) {
      setStatus(err?.message ?? 'Trip create failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <button disabled={saving} onClick={createTrip}>
        {saving ? 'Creating…' : 'Create Trip'}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
}