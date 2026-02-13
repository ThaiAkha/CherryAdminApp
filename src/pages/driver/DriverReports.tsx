import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import Badge from '../../components/ui/badge/Badge';
import { cn } from '../../lib/utils';
import {
    BarChart3,
    DollarSign,
    Users,
    TrendingUp,
    PieChart,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Calendar,
    Briefcase
} from 'lucide-react';
import { usePageHeader } from '../../context/PageHeaderContext';
import { useEffect } from 'react';

import { contentService } from '../../services/content.service';

// --- TYPES ---
interface ReportCard {
    id: string;
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: React.ReactNode;
    category: 'financial' | 'customer' | 'agency';
    details: string;
}

const DriverReports: React.FC = () => {
    const [selectedReportId, setSelectedReportId] = useState<string | null>('income');
    const { setPageHeader } = usePageHeader();

    useEffect(() => {
        const loadMetadata = async () => {
            const meta = await contentService.getPageMetadata('reports');
            if (meta) {
                setPageHeader(meta.titleMain || 'Driver Reports', meta.description || '');
            } else {
                setPageHeader('Driver Reports', 'Analyze performance, revenue, and guest flow.');
            }
        };
        loadMetadata();
    }, [setPageHeader]);

    const REPORTS: ReportCard[] = [
        {
            id: 'income',
            title: 'Total Revenue',
            value: '฿124,500',
            change: '+12.5%',
            isPositive: true,
            icon: <DollarSign className="w-5 h-5" />,
            category: 'financial',
            details: 'Detailed breakdown of daily, weekly, and monthly revenue from all cooking classes. Includes direct and agency bookings.'
        },
        {
            id: 'customers',
            title: 'Total Guests',
            value: '482',
            change: '+5.2%',
            isPositive: true,
            icon: <Users className="w-5 h-5" />,
            category: 'customer',
            details: 'Guest demographics and participation statistics. Track the number of adult and child participants across all sessions.'
        },
        {
            id: 'commissions',
            title: 'Agency Commissions',
            value: '฿18,200',
            change: '-2.4%',
            isPositive: false,
            icon: <Briefcase className="w-5 h-5" />,
            category: 'agency',
            details: 'Commissions owed and paid to travel agencies and partners. Filter by agency to see top performers.'
        },
        {
            id: 'average',
            title: 'Avg. Booking Value',
            value: '฿1,250',
            change: '+1.8%',
            isPositive: true,
            icon: <TrendingUp className="w-5 h-5" />,
            category: 'financial',
            details: 'The average revenue generated per booking. Helpful for pricing strategy and promotional planning.'
        }
    ];

    const selectedReport = REPORTS.find(r => r.id === selectedReportId);

    const renderMasterList = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {REPORTS.map((report) => (
                    <div
                        key={report.id}
                        onClick={() => setSelectedReportId(report.id)}
                        className={cn(
                            "group cursor-pointer p-6 rounded-3xl border transition-all duration-300",
                            selectedReportId === report.id
                                ? "bg-white dark:bg-gray-800 border-brand-500 shadow-lg shadow-brand-500/10"
                                : "bg-white dark:bg-[#1a1a1a]/80 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                        )}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn(
                                "size-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                                report.isPositive ? "bg-brand-500" : "bg-amber-500"
                            )}>
                                {report.icon}
                            </div>
                            <div className={cn(
                                "flex items-center gap-1 text-xs font-black",
                                report.isPositive ? "text-green-500" : "text-red-500"
                            )}>
                                {report.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {report.change}
                            </div>
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{report.title}</h4>
                        <p className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">{report.value}</p>
                    </div>
                ))}
            </div>

            {/* Additional Info / Future Charts Placeholder */}
            <div className="bg-white dark:bg-[#1a1a1a]/80 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h4 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none mb-1">Growth Analysis</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Last 30 days Performance</p>
                    </div>
                    <Badge variant="light" color="primary">Live Data</Badge>
                </div>
                <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-black/20 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                    <div className="text-center">
                        <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase text-gray-400">Interactive Charts Loading...</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDetailPanel = () => {
        if (!selectedReport) return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-white/5 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                <PieChart className="w-12 h-12 text-gray-200 mb-4" />
                <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Select a metric for details</p>
            </div>
        );

        return (
            <div className="bg-white dark:bg-[#1a1a1a]/80 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                    <div className="size-14 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-lg">
                        {selectedReport.icon}
                    </div>
                    <div>
                        <h4 className="text-2xl font-black uppercase text-gray-900 dark:text-white leading-none mb-1">{selectedReport.title}</h4>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Deep Dive Breakdown</p>
                    </div>
                </div>

                <div className="flex-1 space-y-8">
                    <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                        <h5 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">Summary Overview</h5>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed italic">
                            "{selectedReport.details}"
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                            <span className="text-[9px] text-gray-400 font-black uppercase block mb-1">Total Target</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black text-gray-900 dark:text-white">฿200k</span>
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                            <span className="text-[9px] text-gray-400 font-black uppercase block mb-1">Completion</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black text-brand-500">62%</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-2">Key Drivers</h5>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-brand-500 group-hover:animate-pulse" />
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Factor Detail #{i}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 dark:border-gray-800 mt-auto">
                    <button className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 h-12 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                        Export Full PDF Report
                    </button>
                </div>
            </div>
        );
    };

    return (
        <PageContainer variant="narrow" className="h-[calc(100vh-64px)] flex flex-col">
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm h-10">
                        <Calendar className="w-4 h-4 text-brand-500" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">February 2026</span>
                    </div>
                    <button className="size-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:text-brand-500 transition-colors shadow-sm">
                        <Search className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-12 gap-6 pb-12">
                    {/* MASTER LIST */}
                    <div className="col-span-12 lg:col-span-8">
                        {renderMasterList()}
                    </div>

                    {/* DETAIL PANEL */}
                    <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-0 h-fit">
                        {renderDetailPanel()}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default DriverReports;
