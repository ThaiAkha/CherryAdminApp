import React from 'react';
import Avatar from '../../ui/avatar/Avatar';
import Badge from '../../ui/badge/Badge';
import Button from '../../ui/button/Button';
import { cn } from '../../../lib/utils';
import { CarTaxiFront, MapPin, Wand2, Printer } from 'lucide-react';
import { LogisticsItem, DriverProfile } from '../../../hooks/useManagerLogistic';

interface LogisticContentProps {
    loading: boolean;
    items: LogisticsItem[];
    drivers: DriverProfile[];
    selectedBookingId: string | null;
    onSelectBooking: (id: string) => void;
}

const LogisticContent: React.FC<LogisticContentProps> = ({
    loading,
    items,
    drivers,
    selectedBookingId,
    onSelectBooking,
}) => {
    return (
        <div className="flex flex-col h-full overflow-hidden relative">
            {loading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="loader font-black uppercase text-xs tracking-widest animate-pulse">Syncing...</div>
                </div>
            )}

            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <Badge variant="solid" color="primary">LIVE BOARD</Badge>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" startIcon={<Wand2 className="w-4 h-4" />}>Auto</Button>
                    <Button size="sm" variant="outline" startIcon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>Print</Button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 no-scrollbar">
                <div className="flex h-full gap-4 min-w-max">
                    {drivers.map(driver => {
                        const driverItems = items.filter(i => i.pickup_driver_uid === driver.id);
                        return (
                            <div key={driver.id} className="w-[300px] flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                                <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex items-center gap-3">
                                    <Avatar src={driver.avatar_url || ''} alt={driver.full_name} size="small" />
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">{driver.full_name}</div>
                                        <div className="text-[10px] text-gray-500 font-mono">{driverItems.length} Stops</div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50/50 dark:bg-gray-900/50 no-scrollbar">
                                    {driverItems.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => onSelectBooking(item.id)}
                                            className={cn(
                                                "p-3 rounded-xl border transition-all cursor-pointer bg-white dark:bg-gray-800 shadow-sm",
                                                selectedBookingId === item.id
                                                    ? "border-brand-500 ring-1 ring-brand-500"
                                                    : "border-gray-100 dark:border-gray-700 hover:border-brand-300"
                                            )}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-1 text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                                                    <span className="bg-brand-50 dark:bg-brand-900/30 px-1.5 py-0.5 rounded text-xs">{item.pickup_time}</span>
                                                </div>
                                                <Badge variant="light" color="light" size="sm">{item.pax} PAX</Badge>
                                            </div>
                                            <div className="font-bold text-sm text-gray-900 dark:text-white uppercase truncate">{item.guest_name}</div>
                                            <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500 truncate">
                                                <MapPin className="w-3 h-3" />
                                                {item.hotel_name}
                                            </div>
                                        </div>
                                    ))}
                                    {driverItems.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center opacity-30 gap-2">
                                            <CarTaxiFront className="w-8 h-8" />
                                            <span className="text-[10px] font-bold uppercase">No Route</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LogisticContent;
