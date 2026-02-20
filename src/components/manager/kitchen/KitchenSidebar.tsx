import React from 'react';
import Badge from '../../ui/badge/Badge';
import { Users } from 'lucide-react';

interface KitchenSidebarProps {
    stats: {
        totalPax: number;
        totalBookings: number;
        dietaryCounts: Record<string, number>;
    };
}

const KitchenSidebar: React.FC<KitchenSidebarProps> = ({ stats }) => {
    return (
        <div className="lg:col-span-2 flex flex-col h-full overflow-hidden border-r border-gray-200 dark:border-gray-800">

            {/* Summary Header */}
            <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
                <Users className="w-4 h-4 text-gray-400" />
                <h6 className="uppercase tracking-widest text-xs font-bold text-gray-500">Kitchen Stats</h6>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">

                {/* Total Counts */}
                <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20">
                    <p className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400 tracking-widest mb-2">Total Cooks</p>
                    <p className="text-3xl font-black text-brand-700 dark:text-brand-300">{stats.totalBookings}</p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Total Pax</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.totalPax}</p>
                </div>

                {/* Dietary Breakdown */}
                <div className="space-y-2">
                    <h6 className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Dietary</h6>
                    {Object.entries(stats.dietaryCounts).map(([diet, count]) => {
                        const isSpecial = diet !== 'regular';
                        return (
                            <div key={diet} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                <Badge
                                    variant={isSpecial ? "solid" : "light"}
                                    color={isSpecial ? "warning" : "light"}
                                    size="sm"
                                >
                                    {diet.toUpperCase()}
                                </Badge>
                                <span className="text-sm font-black text-gray-900 dark:text-white">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default KitchenSidebar;
