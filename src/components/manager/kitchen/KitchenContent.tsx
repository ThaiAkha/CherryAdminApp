import React from 'react';
import Badge from '../../ui/badge/Badge';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table';
import { cn } from '../../../lib/utils';

interface KitchenContentProps {
    loading: boolean;
    bookings: any[];
    selectedBookingId: string | null;
    onSelectBooking: (booking: any) => void;
}

const KitchenContent: React.FC<KitchenContentProps> = ({
    loading,
    bookings,
    selectedBookingId,
    onSelectBooking,
}) => {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* List Header */}
            <div className="p-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-brand-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                        Live Prep List &bull; {bookings.length} Cooks
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar">
                {loading && bookings.length === 0 ? (
                    <div className="p-24 text-center">
                        <span className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">Syncing Kitchen...</span>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-gray-50/50 dark:bg-white/5 sticky top-0 z-10">
                            <TableRow className="border-b border-gray-100 dark:border-white/5">
                                <TableCell isHeader className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Cook Profile</TableCell>
                                <TableCell isHeader className="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Pax</TableCell>
                                <TableCell isHeader className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Dietary</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                            {bookings.length > 0 ? bookings.map((b: any) => {
                                const profile = b.profiles || {};
                                const diet = (profile.dietary_profile || 'regular').replace('diet_', '');
                                const isSpecial = diet !== 'regular';
                                const isActive = selectedBookingId === b.internal_id;

                                return (
                                    <TableRow
                                        key={b.internal_id}
                                        onClick={() => onSelectBooking(b)}
                                        className={cn(
                                            "cursor-pointer transition-all duration-300",
                                            isActive
                                                ? "bg-brand-50/50 dark:bg-brand-500/5 ring-1 ring-brand-500/20 z-10"
                                                : "hover:bg-gray-50/50 dark:hover:bg-white/5"
                                        )}
                                    >
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "size-10 rounded-xl flex items-center justify-center text-xs font-black transition-colors",
                                                    isActive ? "bg-brand-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                                )}>
                                                    {profile.full_name?.charAt(0) || 'G'}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-gray-900 dark:text-white block leading-tight">{b.guest_name || profile.full_name || 'Guest'}</span>
                                                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{b.pickup_time || '--:--'}</span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="px-6 py-4 text-center">
                                            <span className="font-black text-lg text-gray-900 dark:text-white">{b.pax_count}</span>
                                        </TableCell>

                                        <TableCell className="px-6 py-4">
                                            <Badge variant={isSpecial ? "solid" : "light"} color={isSpecial ? "warning" : "light"} size="sm">
                                                {diet.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            }) : (
                                <TableRow>
                                    <TableCell className="px-6 py-24 text-center text-gray-400 italic" isHeader={false}>
                                        No bookings found for this session.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
};

export default KitchenContent;
