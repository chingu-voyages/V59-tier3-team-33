import { FaHeart } from 'react-icons/fa';
import { useTripStore } from '@/store/tripStore';
import { PlaceCard } from '@/components/PlaceCard';

export function FavoritesTab() {
    const { favoritesById, favoriteIds, selectPlaceFromFavorite } = useTripStore();

    const favorites = favoriteIds.map(id => favoritesById[id]);

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
            {favorites.map((favorite) => (
                <PlaceCard
                    key={favorite.id}
                    data={favorite}
                    type="favorite"
                    onClick={() => selectPlaceFromFavorite(favorite.id)}
                />
            ))}
        </div>
    );
}
