import { FaHeart, FaMapMarkerAlt } from 'react-icons/fa';
import { SavedPlace } from '@/types/trip';

interface FavoritesTabProps {
    favorites: SavedPlace[];
}

export function FavoritesTab({ favorites }: FavoritesTabProps) {
    if (favorites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                    <FaHeart className="text-3xl text-primary-300" />
                </div>
                <p className="text-neutral-300 font-medium mb-1">No favorites yet</p>
                <p className="text-neutral-200 text-sm">
                    Search and save places you love
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-3">
            {favorites.map((savedPlace) => (
                <div
                    key={savedPlace.id}
                    className="p-4 bg-surface-100 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer flex justify-between items-center gap-3"
                >
                    <div className="shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FaMapMarkerAlt className="text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0 flex-col gap-4">
                        <h3 className="text-neutral-400 truncate">
                            {savedPlace.place_details.name}
                        </h3>
                        {/* <p className="text-sm text-neutral-200 truncate">
                            {savedPlace.place_details.address}
                        </p> */}
                        <p className="text-sm text-neutral-200 font-thin">
                            Details
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
