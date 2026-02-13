import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePageHeader } from '../../context/PageHeaderContext';
import PageContainer from '../../components/layout/PageContainer';
import Badge from '../../components/ui/badge/Badge';
import Button from '../../components/ui/button/Button';
import {
    Plus, Calendar, FileText, PieChart, ShoppingBag,
    ArrowRight, TrendingUp, Info
} from 'lucide-react';
import { Link } from 'react-router';
import { supabase } from '../../lib/supabase';
import { contentService } from '../../services/content.service';
import PageMeta from '../../components/common/PageMeta';

const QuickActions = () => (
    <div className="flex items-center gap-2">
        <Link to="/agency-reservations">
            <Button variant="outline" size="sm" startIcon={<Calendar className="size-4" />} className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-9">Reservations</Button>
        </Link>
        <Link to="/agency-dashboard">
            <Button variant="outline" size="sm" startIcon={<TrendingUp className="size-4" />} className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-9">Dashboard</Button>
        </Link>
        <Link to="/agency-booking">
            <Button variant="primary" size="sm" startIcon={<Plus className="size-4" />} className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-9 shadow-lg shadow-brand-500/20">New Booking</Button>
        </Link>
    </div>
);

const AgencyPortal: React.FC = () => {
    const { user } = useAuth();
    const { setPageHeader } = usePageHeader();
    const [stats, setStats] = useState({ totalBookings: 0, monthlyPax: 0, commission: 0 });
    const [pageMeta, setPageMeta] = useState<any>(null);

    useEffect(() => {
        const loadMetadata = async () => {
            const meta = await contentService.getPageMetadata('agency-portal');
            if (meta) {
                setPageMeta(meta);
                setPageHeader(meta.titleMain || 'Agency Portal', meta.description || '', <QuickActions />);
            } else {
                setPageHeader('Agency Portal', 'Your central hub for news, quick actions, and performance stats.', <QuickActions />);
            }
        };
        loadMetadata();
    }, [setPageHeader]);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            const { data: bookings } = await supabase
                .from('bookings')
                .select('pax_count, booking_date, total_price')
                .eq('user_id', user.id)
                .neq('status', 'cancelled');

            if (bookings) {
                const totalBookings = bookings.length;
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                const monthlyPax = bookings
                    .filter(b => {
                        const d = new Date(b.booking_date);
                        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                    })
                    .reduce((sum, b) => sum + (b.pax_count || 0), 0);

                const commission = bookings
                    .reduce((sum, b) => sum + Math.round(b.total_price * ((user.agency_commission_rate || 0) / 100)), 0);

                setStats({ totalBookings, monthlyPax, commission });
            }
        };
        fetchStats();
    }, [user]);

    const quickActions = [
        { name: 'Reservations', path: '/agency-reservations', icon: <Calendar className="size-5" />, description: 'Manage your active bookings' },
        { name: 'Reports', path: '/agency-reports', icon: <PieChart className="size-5" />, description: 'Track your performance & revenue' },
        { name: 'Net Rates', path: '/agency-rates', icon: <FileText className="size-5" />, description: 'View your confidential price list' },
        { name: 'Marketing', path: '/agency-assets', icon: <ShoppingBag className="size-5" />, description: 'Download brand & media kits' },
    ];

    return (
        <PageContainer variant="full">
            <PageMeta
                title="Thai Akha Agency Portal | Thai Akha Kitchen"
                description="To be set up later."
            />
            <div className="pb-20 space-y-8">

                {/* HERO SECTION */}
                <div className="rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03] md:p-12 relative overflow-hidden shadow-sm">
                    <div className="relative z-10 space-y-6 max-w-2xl">
                        <Badge color="primary" className="px-6 py-2 text-lf font-bold uppercase tracking-widest">
                            {pageMeta?.badge || 'Welcome'}
                        </Badge>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-gray-800 dark:text-white leading-none">
                            {pageMeta?.titleMain || 'Sawasdee kha'}, <span className="text-brand-600">{user?.agency_company_name || user?.full_name}</span>!
                        </h1>
                        <p className="text-lg font-medium text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed">
                            {pageMeta?.description || 'Welcome to your central hub. Start by creating a new booking or check your performance updates below.'}
                        </p>
                        <div className="pt-4">
                            <Link to="/agency-booking">
                                <Button variant="primary" size="md" startIcon={<Plus className="w-5 h-5" />} className="rounded-2xl h-14 px-8 text-base font-black uppercase tracking-widest shadow-xl shadow-brand-500/20">
                                    New Booking
                                </Button>
                            </Link>
                        </div>
                    </div>
                    {/* Abstract Decorations */}
                    {pageMeta?.imageUrl ? (
                        <div className="absolute top-0 right-0 w-1/3 h-full opacity-20 pointer-events-none">
                            <img src={pageMeta.imageUrl} alt="" className="w-full h-full object-cover rounded-l-full grayscale" />
                        </div>
                    ) : (
                        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                            <TrendingUp className="w-64 h-64 text-brand-600" />
                        </div>
                    )}
                </div>

                {/* STATS ROW */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    {[
                        { label: 'Upcoming Bookings', value: stats.totalBookings, icon: <Calendar className="text-brand-600" />, trend: 'Active' },
                        { label: 'Total Earnings', value: `${stats.commission.toLocaleString()} ฿`, icon: <TrendingUp className="text-green-600" />, trend: '+12%' },
                        { label: 'Monthly Pax', value: stats.monthlyPax, icon: <Plus className="text-blue-600" />, trend: 'This Month' }
                    ].map((stat, i) => (
                        <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm hover:border-brand-500/20 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <div className="size-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-800 dark:text-white">
                                    {stat.icon}
                                </div>
                                <Badge color={i === 1 ? 'success' : 'primary'} size="sm">{stat.trend}</Badge>
                            </div>
                            <div>
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                                <h4 className="mt-1 text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tighter">{stat.value}</h4>
                            </div>
                        </div>
                    ))}
                </div>

                {/* QUICK ACTIONS GRID */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Quick Portal Navigation</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {quickActions.map((action, idx) => (
                            <Link key={idx} to={action.path} className="group">
                                <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] hover:border-brand-500/30 transition-all hover:shadow-lg">
                                    <div className="size-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 mb-4 group-hover:scale-110 transition-transform">
                                        {action.icon}
                                    </div>
                                    <h4 className="text-lg font-black uppercase italic tracking-tighter text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">
                                        {action.name}
                                    </h4>
                                    <p className="text-xs font-medium text-gray-400 mt-1">{action.description}</p>
                                    <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-500 opacity-0 group-hover:opacity-100 transition-all">
                                        Go Now <ArrowRight className="size-3" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* NEWS BANNER */}
                <div className="rounded-3xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.02] p-8 flex flex-col md:flex-row items-center gap-8 border-dashed">
                    <div className="size-20 rounded-full bg-brand-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand-500/20">
                        <Info className="size-10" />
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-1">
                        <Badge color="warning" size="sm" className="mb-2">Announcement</Badge>
                        <h4 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">Seasonal Menu Update incoming!</h4>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">We are introducing new vegan options for the Songkran festival sessions. Stay tuned for updated net rates.</p>
                    </div>
                    <Link to="/agency-news">
                        <Button variant="outline" className="rounded-xl px-8 font-black uppercase text-xs tracking-widest whitespace-nowrap">
                            Read Updates
                        </Button>
                    </Link>
                </div>

            </div>
        </PageContainer>
    );
};

export default AgencyPortal;
