import { FaEllipsisV } from 'react-icons/fa';

interface SidebarHeaderProps {
    tripName: string;
}

export function SidebarHeader({ tripName }: SidebarHeaderProps) {
    return (
        <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-bold text-neutral-400 truncate pr-2">
                {tripName}
            </h2>
            <button
                className="shrink-0 p-2 hover:bg-surface-200 rounded-lg transition-colors"
                aria-label="Trip menu"
            >
                <FaEllipsisV className="text-neutral-300" />
            </button>
        </div>
    );
}
