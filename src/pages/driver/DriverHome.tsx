import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { authService, UserProfile } from '../../services/auth.service';
import { cn } from '../../lib/utils';
import {
    TrendingUp,
    AlertCircle,
    ArrowUpRight
} from 'lucide-react';

import PageContainer from '../../components/layout/PageContainer';
import Badge from '../../components/ui/badge/Badge';
import StatCard from '../../components/ui/StatCard';
import WelcomeHero from '../../components/dashboard/WelcomeHero';
import { usePageHeader } from '../../context/PageHeaderContext';
import { contentService } from '../../services/content.service';

// --- TYPES ---
interface DriverPayment {
    id: string;
    driver_id: string;
    run_date: string;
    status: 'pending' | 'paid' | 'processing';
    payout_amount: number;
    notes?: string;
    total_stops?: number;
    total_pax?: number;
    session_id?: string;
}

interface DailyStats {
    total_jobs: number;
    completed_jobs: number;
    pending_jobs: number;
    total_pax: number;
}

// Returns the Monday of the current week at midnight
function getStartOfWeek(from: Date): Date {
    const d = new Date(from);
    const day = d.getDay();
    d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    d.setHours(0, 0, 0, 0);
    return d;
}

const EMPTY_STATS: DailyStats = {
    total_jobs: 0,
    completed_jobs: 0,
    pending_jobs: 0,
    total_pax: 0,
};

const ACTIVE_TRANSPORT_STATUSES = ['waiting', 'driver_en_route', 'driver_arrived', 'on_board'];

const DriverHome: React.FC = () => {
    const navigate = useNavigate();
    const { setPageHeader } = usePageHeader();
    const [payments, setPayments] = useState<DriverPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DailyStats>(EMPTY_STATS);

    const activeDate = new Date().toISOString().split('T')[0];

    // 1. Header metadata
    useEffect(() => {
        const subtitle = `System 4.8 / Driver Portal • ${activeDate}`;
        contentService.getPageMetadata('driver-home').then(meta => {
            if (meta) {
                setPageHeader(meta.titleMain || 'My Earnings', meta.description || subtitle);
            } else {
                setPageHeader('My Earnings', subtitle);
            }
        });
    }, [activeDate, setPageHeader]);

    // 2. Data init + 30s refresh
    useEffect(() => {
        const fetchPayments = async (uid: string) => {
            const { data, error } = await supabase
                .from('driver_payments')
                .select('*')
                .eq('driver_id', uid)
                .order('run_date', { ascending: false });

            if (error) {
                console.error("Error fetching payments:", error);
                return;
            }
            setPayments(data || []);
        };

        const fetchStats = async (profile: UserProfile) => {
            try {
                let query = supabase
                    .from('bookings')
                    .select('pax_count, transport_status, pickup_driver_uid')
                    .eq('booking_date', activeDate)
                    .neq('status', 'cancelled');

                if (profile.role === 'driver') {
                    query = query.or(`pickup_driver_uid.eq.${profile.id}, pickup_driver_uid.is.null`);
                }

                const { data, error } = await query;
                if (error) throw error;

                if (data) {
                    const calculated = data.reduce<DailyStats>((acc, b) => {
                        acc.total_jobs += 1;
                        acc.total_pax += (b.pax_count || 0);
                        if (b.transport_status === 'dropped_off') {
                            acc.completed_jobs += 1;
                        } else if (ACTIVE_TRANSPORT_STATUSES.includes(b.transport_status)) {
                            acc.pending_jobs += 1;
                        }
                        return acc;
                    }, { ...EMPTY_STATS });

                    setStats(calculated);
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        const init = async () => {
            setLoading(true);
            try {
                const profile = await authService.getCurrentUserProfile();
                if (profile) {
                    await Promise.all([fetchPayments(profile.id), fetchStats(profile)]);
                }
            } catch (error) {
                console.error("Error initializing DriverHome:", error);
            } finally {
                setLoading(false);
            }
        };

        init();
        const interval = setInterval(init, 30000);
        return () => clearInterval(interval);
    }, [activeDate]);

    // 3. Week boundary — computed once, shared between both useMemos
    const weekBoundaries = useMemo(() => {
        const now = new Date();
        const startOfThisWeek = getStartOfWeek(now);
        const startOfLastWeek = new Date(startOfThisWeek);
        startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
        return { startOfThisWeek, startOfLastWeek };
    }, []);

    const weeklyTotal = useMemo(() =>
        payments
            .filter(p => new Date(p.run_date) >= weekBoundaries.startOfThisWeek)
            .reduce((acc, curr) => acc + (curr.payout_amount || 0), 0),
        [payments, weekBoundaries]);

    const lastWeekPayment = useMemo(() =>
        payments.find(p => {
            const d = new Date(p.run_date);
            return d >= weekBoundaries.startOfLastWeek && d < weekBoundaries.startOfThisWeek;
        }),
        [payments, weekBoundaries]);

    // 4. Render helpers
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return {
            day: d.getDate(),
            month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
        };
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
        );
    }

    const subtitle = `System 4.8 / Driver Portal • ${activeDate}`;

    return (
        <PageContainer variant="narrow" className="pb-24">
            <WelcomeHero
                badge="Driver Portal"
                titleMain="My Earnings"
                titleHighlight=""
                description={subtitle}
                icon="Wallet"
            />

            <div className="space-y-6">
                {/* 1. Reports Today (Priority Row) */}
                {stats.total_jobs > 0 && (
                    <div
                        onClick={() => navigate('/driver')}
                        className="group cursor-pointer relative overflow-hidden rounded-[2.5rem] border border-brand-500/30 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-theme-xs hover:border-brand-500/60 transition-all animate-in zoom-in-95"
                    >
                        <div className="absolute inset-0 bg-brand-500/5 animate-pulse" />
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4 sm:gap-5">
                                <div className="size-14 sm:size-16 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-lg">
                                    <TrendingUp className="w-7 h-7 sm:w-8 h-8" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white leading-tight">Reports Today</h3>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-500">
                                            {stats.total_jobs} Total Jobs
                                        </p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-success-500">
                                            {stats.completed_jobs} Done
                                        </p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                                            {stats.pending_jobs} Pending
                                        </p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            {stats.total_pax} Pax
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="size-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-white group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Secondary Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <StatCard
                        title="Weekly Earnings"
                        value={`฿${weeklyTotal.toLocaleString()}`}
                        icon="TrendingUp"
                        color="success"
                    />
                    <StatCard
                        title="Last Payment"
                        value={lastWeekPayment ? `฿${lastWeekPayment.payout_amount.toLocaleString()}` : "฿0"}
                        icon="Wallet"
                        color="action"
                    />
                </div>

                {/* History List */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Payment History</h4>
                    </div>

                    <div className="space-y-3 text-left">
                        {payments.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[2rem]">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">No payments found</p>
                            </div>
                        ) : (
                            payments.map((p, idx) => {
                                const dateInfo = formatDate(p.run_date);
                                const isPaid = p.status === 'paid';

                                return (
                                    <div
                                        key={p.id}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-[1.8rem] border shadow-theme-xs transition-all duration-300",
                                            "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-500/30",
                                            "animate-in slide-in-from-bottom-4"
                                        )}
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        {/* Date Box */}
                                        <div className="size-14 rounded-2xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-white/10 flex flex-col items-center justify-center shrink-0">
                                            <span className="text-xl font-black leading-none text-gray-900 dark:text-white">{dateInfo.day}</span>
                                            <span className="text-[8px] font-black text-gray-400 uppercase">{dateInfo.month}</span>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="solid" size="sm" color={isPaid ? "success" : "warning"} className="h-4 text-[8px] font-black px-1.5 uppercase tracking-tighter">
                                                    {p.status}
                                                </Badge>
                                            </div>
                                            <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate">
                                                {p.notes || `${p.total_stops || 0} Stops • ${p.total_pax || 0} Pax`}
                                            </h5>
                                        </div>

                                        {/* Amount */}
                                        <div className="text-right">
                                            <div className={cn(
                                                "text-lg font-black font-mono leading-none mb-1",
                                                isPaid ? "text-success-600 dark:text-brand-400" : "text-warning-600 dark:text-amber-400"
                                            )}>
                                                {p.payout_amount.toLocaleString()}
                                            </div>
                                            <div className="text-[9px] font-black tracking-widest text-gray-400 uppercase">THB</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default DriverHome;
