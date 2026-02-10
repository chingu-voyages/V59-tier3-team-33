import { FaRegHeart } from 'react-icons/fa';
import { Tab, TabId } from '@/types/trip';

interface TabPillsProps {
    tabs: Tab[];
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export function TabPills({ tabs, activeTab, onTabChange }: TabPillsProps) {
    return (
        <div className="flex gap-2 p-4 overflow-x-auto scrollbar-thin scrollbar-thumb-surface-500 scrollbar-track-transparent border-b">
            {tabs.map((tab) => {
                const isActive = tab.id === activeTab;
                const isFavorites = tab.id === 'favorites';

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`
                        flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap border
                        ${isActive
                                ? 'bg-primary-50 text-primary shadow-md'
                                : 'bg-surface-200 text-neutral-300 hover:bg-surface-300'
                            }
                        `}
                    >
                        {/* Favorites: Only show outline heart icon */}
                        {isFavorites ? (
                            <FaRegHeart className="text-lg" />
                        ) : (
                            <>
                                {/* Other tabs: Only show label */}
                                <span>{tab.label}</span>
                                {tab.date && (
                                    <span className={`text-xs ${isActive ? 'opacity-90' : 'opacity-70'}`}>
                                        ({tab.date})
                                    </span>
                                )}
                            </>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
