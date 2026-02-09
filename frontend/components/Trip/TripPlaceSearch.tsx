import { TripPlace } from "./types";

// /Users/chrismckenzie/.codex/worktrees/8377/V59-tier3-team-33/frontend/components/Trip/TripSavedPlaceSearch.tsx
type RetrieveDetailsArgs = {
  mapboxId: string;
  token: string;
  sessionToken: string;
  signal?: AbortSignal;
};

async function retrieveDetails({
  mapboxId,
  token,
  sessionToken,
  signal,
}: RetrieveDetailsArgs): Promise<TripPlace> {
  const params = new URLSearchParams({
    access_token: token,
    session_token: sessionToken, // must match the token used in /suggest
    language: 'en',
  });

  const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(
    mapboxId,
  )}?${params.toString()}`;

  const res = await fetch(url, { signal });
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      json?.message || json?.error || json?.detail || `Retrieve failed (${res.status})`;
    throw new Error(msg);
  }

  const feature = json?.features?.[0];
  const coords = feature?.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) {
    throw new Error('Retrieve returned no coordinates');
  }

  const [lng, lat] = coords;
  const props = feature?.properties ?? {};
  const category = Array.isArray(props?.poi_category)
    ? props.poi_category[0]
    : props?.poi_category ?? null;

  return {
    mapbox_id: props?.mapbox_id ?? feature?.id ?? mapboxId,
    name: props?.name ?? props?.full_address ?? 'Unknown place',
    full_address: props?.full_address ?? props?.place_formatted ?? null,
    latitude: Number(lat),
    longitude: Number(lng),
    category,
  };
}
