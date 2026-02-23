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
const MAX_RETRIES = 2;
const INITIAL_RETRY_DELAY = 1000; // 1 second

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
        headers: {
          'User-Agent': 'TripPlanner/1.0',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('RATE_LIMIT');
        }
        throw new Error(`Search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error as Error;
      
      if (lastError.message === 'RATE_LIMIT' && attempt < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }
      
      if (attempt < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }
    }
  }

  return [];
}
