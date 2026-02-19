'use client';

import { useState } from 'react';
import { FaLink, FaCheck } from 'react-icons/fa';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface ShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isPublic: boolean;
    publicUrl?: string;
    onTogglePublic: (isPublic: boolean) => Promise<void>;
}

export function ShareDialog({
    open,
    onOpenChange,
    isPublic,
    publicUrl,
    onTogglePublic,
}: ShareDialogProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleToggle = async (checked: boolean) => {
        setIsUpdating(true);
        try {
            await onTogglePublic(checked);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCopyLink = async () => {
        if (!publicUrl) return;

        try {
            await navigator.clipboard.writeText(publicUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-neutral-400">
                        Share Trip
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Public Toggle */}
                    <div className="flex items-center justify-between p-4 bg-surface-100 rounded-lg">
                        <div className="flex-1 pr-4">
                            <h3 className="font-medium text-neutral-400 mb-1">
                                Make trip public
                            </h3>
                            <p className="text-sm text-neutral-300">
                                Anyone with the link can view this trip
                            </p>
                        </div>
                        <Switch
                            className={isPublic ? 'bg-primary-600' : 'bg-neutral-100'}
                            checked={isPublic}
                            onCheckedChange={handleToggle}
                            disabled={isUpdating}
                        />
                    </div>

                    {/* Share Link */}
                    {isPublic && publicUrl && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-400">
                                Share Link
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={publicUrl}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-surface-100 border border-surface-500 rounded-lg text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                                />
                                <button
                                    onClick={handleCopyLink}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 font-medium"
                                >
                                    {copied ? (
                                        <>
                                            <FaCheck className="text-sm" />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaLink className="text-sm" />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-neutral-300">
                                Share this link with anyone to let them view your trip itinerary
                            </p>
                        </div>
                    )}

                    {/* Info when not public */}
                    {!isPublic && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800">
                                Your trip is currently private. Enable public sharing to get a shareable link.
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
