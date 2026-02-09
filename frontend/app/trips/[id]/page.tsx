'use client';

import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import { SidebarShell } from '@/components/SidebarShell';

export default function TripDetailPage() {
    const router = useRouter();

    return (
        <div className="relative h-screen w-full overflow-hidden">
            {/* Base Layer: Map Placeholder */}
            <div className="relative">
                {/* Map will be integrated here later */}

                <div className="absolute top-0 left-0 md:left-1/4 right-0 z-10 p-4">
                    <div className="flex items-center gap-3">
                        {/* Back Button */}
                        <button
                            onClick={() => router.back()}
                            className="shrink-0 w-12 h-12 bg-surface-50 rounded-full shadow-lg border border-surface-500 flex items-center justify-center hover:bg-surface-100 transition-colors"
                            aria-label="Go back"
                        >
                            <FaArrowLeft className="text-neutral-400 text-lg" />
                        </button>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-md relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-200" />
                            <input
                                type="text"
                                placeholder="Search places..."
                                className="w-full pl-12 pr-4 py-3 bg-surface-50 border border-surface-500 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Shell */}
            <SidebarShell>
                <div>
                    <p className="p-6 text-neutral-400">
                        Sidebar content placeholder...
                    </p>
                </div>
            </SidebarShell>
        </div>
    );
}
