import React from 'react';
import { cn } from '../../../lib/utils';
import { Users, User } from 'lucide-react';

interface BookingMember {
    guest_name: string;
    pax_count: number;
}

interface SessionBookingCardProps {
    title: string;
    status: 'OPEN' | 'FULL' | 'CLOSED';
    seats: number;
    capacity: number;
    bookings: BookingMember[];
    className?: string;
}

const SessionBookingCard: React.FC<SessionBookingCardProps> = ({
    title,
    status,
    seats,
    capacity,
    bookings,
    className
}) => {
    const isClosed = status === 'CLOSED';
    const isFull = status === 'FULL';
    const bookedPax = Math.max(0, capacity - seats);

    return (
        <div className={cn(
            "rounded-2xl border bg-white dark:bg-gray-900 overflow-hidden flex flex-col transition-all min-h-[140px] flex-1",
            isClosed ? "border-gray-200 dark:border-gray-800 opacity-80" : "border-gray-100 dark:border-white/[0.05]",
            className
        )}>
            {/* Header */}
            <div className={cn(
                "px-4 py-3 flex items-center justify-between border-b shrink-0",
                isClosed ? "bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800" : "bg-gray-50/30 dark:bg-white/[0.02] border-gray-100 dark:border-white/[0.05]"
            )}>
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "p-1.5 rounded-lg text-white font-black text-[10px] uppercase shrink-0",
                        title.toLowerCase().includes('morning') ? "bg-orange-500" : "bg-purple-500"
                    )}>
                        {title.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h6 className="uppercase tracking-[0.2em] text-[10px] font-black text-gray-800 dark:text-gray-200 truncate">
                            {title}
                        </h6>
                        <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest",
                            isClosed ? "text-gray-400" : isFull ? "text-red-500" : "text-green-600 dark:text-green-400"
                        )}>
                            {status}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                    <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Booked:</span>
                            <span className="text-[10px] font-black text-gray-900 dark:text-white leading-none">{bookedPax}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Seats Left:</span>
                            <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 leading-none">{seats}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Guest List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar bg-gray-50/10 dark:bg-white/[0.01]">
                {bookings.length > 0 ? (
                    bookings.map((booking, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:border-brand-500/30 transition-colors shadow-sm"
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="shrink-0 size-5 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-center">
                                    <User className="w-2.5 h-2.5 text-gray-400" />
                                </div>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                                    {booking.guest_name}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 bg-brand-50 dark:bg-brand-900/20 px-1.5 py-0.5 rounded-md border border-brand-100 dark:border-brand-900/30 shrink-0">
                                <Users className="w-2.5 h-2.5 text-brand-500" />
                                <span className="text-[10px] font-black text-brand-600 dark:text-brand-400">{booking.pax_count}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full py-6 flex flex-col items-center justify-center opacity-30">
                        <Users className="w-6 h-6 mb-1.5 text-gray-300" />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Empty Session</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SessionBookingCard;
