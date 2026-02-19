'use client';

import { useState } from 'react';
import { FaEllipsisV, FaShare } from 'react-icons/fa';
import { ShareDialog } from '@/components/ShareDialog';
import { useTripStore } from '@/store/tripStore';

interface SidebarHeaderProps {
    tripName: string;
    tripId: string;
}

export function SidebarHeader({ tripName, tripId }: SidebarHeaderProps) {
    const [showShareDialog, setShowShareDialog] = useState(false);
    const { trip, toggleTripPublic } = useTripStore();

    const handleTogglePublic = async (isPublic: boolean) => {
        await toggleTripPublic(tripId, isPublic);
    };

    return (
        <>
            <div className="flex items-center justify-between p-4">
                <h2 className="text-xl font-bold text-neutral-400 truncate pr-2">
                    {tripName}
                </h2>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => setShowShareDialog(true)}
                        className="p-2 hover:bg-surface-200 rounded-lg transition-colors"
                        aria-label="Share trip"
                    >
                        <FaShare className="text-neutral-300" />
                    </button>
                    <button
                        className="p-2 hover:bg-surface-200 rounded-lg transition-colors"
                        aria-label="Trip menu"
                    >
                        <FaEllipsisV className="text-neutral-300" />
                    </button>
                </div>
            </div>

            <ShareDialog
                open={showShareDialog}
                onOpenChange={setShowShareDialog}
                isPublic={trip?.is_public || false}
                publicUrl={trip?.public_url}
                onTogglePublic={handleTogglePublic}
            />
        </>
    );
}
