'use client';

import { MapSearch } from '@/components/Map/MapSearch';
import type { NominatimResult } from '@/services/nominatim';

export default function TestSearchPage() {
    const handleLocationSelect = (result: NominatimResult) => {
        console.log('Selected location:', result);
        alert(`Selected: ${result.display_name}`);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Test Map Search</h1>

                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold mb-4">Search for a location:</h2>
                    <MapSearch onLocationSelect={handleLocationSelect} />

                    <div className="mt-6 p-4 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">
                            Try searching for: "New York", "Paris", "Tokyo", "London", etc.
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                            Open the browser console (F12) to see the selected location data.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
