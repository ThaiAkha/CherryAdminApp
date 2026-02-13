import React, { useEffect } from 'react';
import { Link } from 'react-router';
import PageContainer from '../../components/layout/PageContainer';
import Badge from '../../components/ui/badge/Badge';
import {
    Newspaper,
    Zap,
    Calendar,
    ArrowRight,
    Clock,
    Plus,
    TrendingUp,
    Home
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { usePageHeader } from '../../context/PageHeaderContext';
import Button from '../../components/ui/button/Button';
import PageMeta from '../../components/common/PageMeta';

interface NewsItem {
    id: string;
    date: string;
    tag: string;
    title: string;
    content: string;
    isPriority: boolean;
    image?: string;
}

const QuickActions = () => (
    <div className="flex items-center gap-2">
        <Link to="/">
            <Button variant="outline" size="sm" startIcon={<Home className="size-4" />} className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-9">Portal</Button>
        </Link>
        <Link to="/agency-dashboard">
            <Button variant="outline" size="sm" startIcon={<TrendingUp className="size-4" />} className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-9">Dashboard</Button>
        </Link>
        <Link to="/agency-booking">
            <Button variant="primary" size="sm" startIcon={<Plus className="size-4" />} className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-9 shadow-lg shadow-brand-500/20">New Booking</Button>
        </Link>
    </div>
);

const AgencyNews: React.FC = () => {
    const { setPageHeader } = usePageHeader();

    useEffect(() => {
        setPageHeader('News & Updates', 'Stay informed with the latest kitchen updates and partner announcements.', <QuickActions />);
    }, [setPageHeader]);

    const NEWS: NewsItem[] = [
        {
            id: '1',
            date: '2026-02-12',
            tag: 'Promotion',
            title: 'Early Bird 2026: Extra 5% Commission',
            content: 'Register your groups for the upcoming Songkran festival before March 1st to unlock specialized tiered commission rates up to 30%.',
            isPriority: true,
            image: '/images/showcase/Akha01.jpg'
        },
        {
            id: '2',
            date: '2026-02-10',
            tag: 'Update',
            title: 'New Vegan Menu for Evening Sessions',
            content: 'Due to popular demand, we have expanded our evening sunset feast with a dedicated 5-course vegan experience. Perfect for eco-conscious travelers.',
            isPriority: false
        },
        {
            id: '3',
            date: '2026-02-05',
            tag: 'Announcement',
            title: 'Sustainability Award 2025',
            content: 'We are proud to announce that Thai Akha Kitchen has been awarded the Local Hero Sustainability Mark for our zero-waste initiative.',
            isPriority: false
        }
    ];

    return (
        <PageContainer variant="narrow">
            <PageMeta
                title="Admin Dashboard | Thai Akha Kitchen"
                description="To be set up later."
            />
            <div className="pb-20 space-y-8">

                {/* URGENT ALERTS */}
                <div className="bg-brand-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-brand-500/20">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                        <div className="size-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                            <Zap className="w-8 h-8 text-white animate-pulse" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-1">Partner Flash Sale!</h3>
                            <p className="text-sm font-bold opacity-80 uppercase tracking-widest leading-normal">
                                First 100 bookings in March will receive a luxury Thai Spice Kit for each guest.
                            </p>
                        </div>
                        <button className="bg-white text-brand-600 px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg">
                            Claim Bonus
                        </button>
                    </div>
                    {/* Abstract background elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>

                {/* NEWS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {NEWS.map((item) => (
                        <div
                            key={item.id}
                            className={cn(
                                "flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] overflow-hidden transition-all hover:shadow-xl group",
                                item.isPriority ? "md:col-span-2 lg:col-span-2 flex-row" : ""
                            )}
                        >
                            {item.isPriority && (
                                <div className="hidden md:block w-2/5 relative overflow-hidden">
                                    <img
                                        src={item.image || "https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/Akha01.jpg"}
                                        alt="News"
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                                </div>
                            )}

                            <div className="p-8 flex flex-col justify-between flex-1">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <Badge variant="light" color={item.tag === 'Promotion' ? 'warning' : 'info'} size="sm" className="font-black uppercase tracking-[0.2em] px-3">
                                            {item.tag}
                                        </Badge>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                                            <Calendar className="w-3 h-3" />
                                            {item.date}
                                        </div>
                                    </div>
                                    <h4 className={cn(
                                        "font-black uppercase italic tracking-tighter text-gray-900 dark:text-white leading-tight mb-3",
                                        item.isPriority ? "text-3xl" : "text-xl"
                                    )}>
                                        {item.title}
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                                        {item.content}
                                    </p>
                                </div>

                                <button className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-500 hover:text-brand-600 transition-colors">
                                    Read Full Story
                                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ARCHIVE / FOOTER */}
                <div className="p-10 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-200/50 dark:border-gray-700/50 text-center space-y-4">
                    <Newspaper className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <h5 className="font-black uppercase tracking-widest text-gray-400 text-sm">Earlier Updates</h5>
                    <div className="max-w-md mx-auto space-y-2">
                        {[
                            'Sustainability Report Q4 2025 Published',
                            'Partner Portal Technical Maintenance Notice',
                            'New Group Pickup Coordination Guidelines'
                        ].map((text, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors group cursor-pointer text-left">
                                <Clock className="w-4 h-4 text-gray-300 group-hover:text-brand-500" />
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default AgencyNews;
