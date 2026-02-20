import React from 'react';
import Avatar from '../../ui/avatar/Avatar';
import Badge from '../../ui/badge/Badge';
import { cn } from '../../../lib/utils';
import { Users } from 'lucide-react';
import { Guest } from '../../../hooks/useManagerPos';

interface PosSidebarProps {
    filteredGuests: Guest[];
    activeGuestId: string | null;
    onSelectGuest: (id: string) => void;
}

const PosSidebar: React.FC<PosSidebarProps> = ({
    filteredGuests,
    activeGuestId,
    onSelectGuest,
}) => {
    return (
        <div className="lg:col-span-2 flex flex-col h-full overflow-hidden border-r border-gray-200 dark:border-gray-800">
            <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
                <Users className="w-4 h-4 text-gray-400" />
                <h6 className="uppercase tracking-widest text-xs font-bold text-gray-500">Guest List</h6>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
                {filteredGuests.map(g => (
                    <button
                        key={g.internal_id}
                        onClick={() => onSelectGuest(g.internal_id)}
                        className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all group",
                            activeGuestId === g.internal_id
                                ? "bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-400"
                                : "bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                        )}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <Avatar src={g.avatar_url || ''} alt={g.full_name} size="xsmall" />
                            <div className="truncate">
                                <span className="block text-xs font-bold truncate">{g.full_name}</span>
                                <span className="block text-[9px] text-gray-400 uppercase">{g.status}</span>
                            </div>
                        </div>
                        <Badge variant="light" color="light" size="sm" className="shrink-0">{g.pax_count}P</Badge>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PosSidebar;
