import React from 'react';
import { Clock, Info, ShieldCheck } from 'lucide-react';

export interface ZoneInfo {
    id: string;
    name: string;
    color_code: string | null;
    description?: string | null;
    morning_pickup_time?: string | null;
    morning_pickup_end?: string | null;
    evening_pickup_time?: string | null;
    evening_pickup_end?: string | null;
}

interface ZoneInfoCardProps {
    zone: ZoneInfo;
}

const ZoneInfoCard: React.FC<ZoneInfoCardProps> = ({ zone }) => {
    const color = zone.color_code || '#9CA3AF';

    return (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-gray-900 shadow-sm transition-all hover:shadow-md">
            {/* Accent border */}
            <div
                className="absolute top-0 left-0 bottom-0 w-1.5"
                style={{ backgroundColor: color }}
            />

            <div className="p-5 pl-7">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                        />
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">
                            {zone.name}
                        </h3>
                    </div>
                    <div
                        className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter"
                        style={{ backgroundColor: color + '20', color: color }}
                    >
                        Pickup Zone
                    </div>
                </div>

                {/* Description */}
                {zone.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed line-clamp-2">
                        {zone.description}
                    </p>
                )}

                {/* Time Slots */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <Clock className="w-3 h-3" />
                            Morning
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-black text-gray-900 dark:text-white">
                                {zone.morning_pickup_time?.substring(0, 5) || '--:--'}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">→</span>
                            <span className="text-sm font-black text-gray-900 dark:text-white">
                                {zone.morning_pickup_end?.substring(0, 5) || '--:--'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <Clock className="w-3 h-3 text-brand-500" />
                            Evening
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-black text-gray-900 dark:text-white">
                                {zone.evening_pickup_time?.substring(0, 5) || '--:--'}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">→</span>
                            <span className="text-sm font-black text-gray-900 dark:text-white">
                                {zone.evening_pickup_end?.substring(0, 5) || '--:--'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer / Badge */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.03] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-success-600 uppercase tracking-tighter">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Active Zone
                    </div>
                    <Info className="w-3 h-3 text-gray-300 hover:text-gray-500 cursor-help transition-colors" />
                </div>
            </div>
        </div>
    );
};

export default ZoneInfoCard;
