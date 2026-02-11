export interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
  boundingbox: [string, string, string, string]; // [south, north, west, east]
  type: string;
  importance: number;
}

export interface SearchOptions {
  limit?: number;
  countrycodes?: string;
  format?: 'json' | 'xml';
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export async function searchLocation(
  query: string,
  options: SearchOptions = {}
): Promise<NominatimResult[]> {
  if (!query.trim()) {
    return [];
  }

  const params = new URLSearchParams({
    q: query,
    format: options.format || 'json',
    limit: String(options.limit || 5),
    addressdetails: '1',
  });

  if (options.countrycodes) {
    params.append('countrycodes', options.countrycodes);
  }

  try {
    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
      headers: {
        'User-Agent': 'TripPlanner/1.0', // Nominatim requires a User-Agent
      },
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Nominatim search error:', error);
    throw error;
  }
}
