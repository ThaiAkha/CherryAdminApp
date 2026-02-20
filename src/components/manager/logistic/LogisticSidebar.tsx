import React from 'react';
import Badge from '../../ui/badge/Badge';
import { cn } from '../../../lib/utils';
import { Sun, Moon, CarTaxiFront, UserRound } from 'lucide-react';
import { SessionType } from '../../common/ClassPicker';
import { LogisticsItem, SessionSummary } from '../../../hooks/useManagerLogistic';

interface LogisticSidebarProps {
    upcomingSessions: SessionSummary[];
    unassignedItems: LogisticsItem[];
    selectedDate: string;
    selectedSessionId: SessionType;
    selectedBookingId: string | null;
    onSelectSession: (date: string, sessionId: SessionType) => void;
    onSelectBooking: (id: string) => void;
}

const LogisticSidebar: React.FC<LogisticSidebarProps> = ({
    upcomingSessions,
    unassignedItems,
    selectedDate,
    selectedSessionId,
    selectedBookingId,
    onSelectSession,
    onSelectBooking,
}) => {
    return (
        <div className="lg:col-span-2 flex flex-col h-full gap-0 overflow-hidden border-r border-gray-200 dark:border-gray-800">

            {/* Sessions List */}
            <div className="flex flex-col overflow-hidden max-h-[50%]">
                <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
                    <h6 className="uppercase tracking-widest text-xs font-bold text-gray-500">Upcoming Sessions</h6>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
                    {upcomingSessions.map((s) => (
                        <button
                            key={`${s.date}_${s.session_id}`}
                            onClick={() => onSelectSession(s.date, s.session_id as SessionType)}
                            className={cn(
                                "w-full p-3 rounded-xl border text-left transition-all group",
                                selectedDate === s.date && selectedSessionId === s.session_id
                                    ? "bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-400 font-medium shadow-sm"
                                    : "bg-white dark:bg-gray-800 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-mono text-xs font-bold">{s.date}</span>
                                {s.session_id.includes('morning') ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                    {s.session_id.replace('_class', '')}
                                </span>
                                {s.unassigned_count > 0 && (
                                    <Badge variant="solid" color="error" size="sm">
                                        {s.unassigned_count} NEW
                                    </Badge>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Unassigned Staging */}
            <div className="flex-1 flex flex-col overflow-hidden border-t border-gray-200 dark:border-gray-800">
                <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
                    <h6 className="uppercase tracking-widest text-xs font-bold text-gray-500">Staging Area</h6>
                    <Badge variant="light" color="light">{unassignedItems.length}</Badge>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
                    {unassignedItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => onSelectBooking(item.id)}
                            className={cn(
                                "p-3 rounded-xl border cursor-pointer transition-all",
                                selectedBookingId === item.id
                                    ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-500/20"
                                    : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-500/50"
                            )}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <UserRound className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs font-bold uppercase truncate">{item.guest_name}</span>
                                </div>
                                <Badge variant="light" color="light" size="sm" className="shrink-0">{item.pax}p</Badge>
                            </div>
                        </div>
                    ))}
                    {unassignedItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-gray-600 gap-2">
                            <CarTaxiFront className="w-8 h-8" />
                            <span className="text-xs font-medium">All assigned</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LogisticSidebar;
