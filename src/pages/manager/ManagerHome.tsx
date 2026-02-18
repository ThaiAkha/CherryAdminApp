import React, { useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { usePageHeader } from '../../context/PageHeaderContext';
import { contentService } from '../../services/content.service';
import Badge from '../../components/ui/badge/Badge';
import { LayoutDashboard, Plus } from 'lucide-react';
import Button from '../../components/ui/button/Button';
import { Link } from 'react-router';

const ManagerHome: React.FC = () => {
    const { setPageHeader } = usePageHeader();
    const [pageMeta, setPageMeta] = useState<any>(null);

    useEffect(() => {
        const loadMeta = async () => {
            const meta = await contentService.getPageMetadata('manager-home');
            if (meta) {
                setPageMeta(meta);
                setPageHeader(meta.titleMain || 'Manager', meta.description || '');
            } else {
                setPageHeader('Manager', 'Operational overview, daily metrics, and staff announcements.');
            }
        };
        loadMeta();
    }, [setPageHeader]);

    return (
        <PageContainer variant="full">
            {/* HERO SECTION */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03] md:p-12 relative overflow-hidden shadow-sm mb-8">
                <div className="relative z-10 space-y-6 max-w-2xl">
                    <Badge color="primary" className="px-6 py-2 text-lf font-bold uppercase tracking-widest">
                        {pageMeta?.badge || 'Staff Only'}
                    </Badge>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-gray-800 dark:text-white leading-none">
                        {pageMeta?.titleMain || 'Manager'} <span className="text-brand-600">{pageMeta?.titleHighlight || 'Home'}</span>
                    </h1>
                    <p className="text-lg font-medium text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed">
                        {pageMeta?.description || 'Operational overview, daily metrics, and staff announcements.'}
                    </p>
                    <div className="pt-4">
                        <Link to="/admin-booking">
                            <Button variant="primary" size="md" startIcon={<Plus className="w-5 h-5" />} className="rounded-2xl h-14 px-8 text-base font-black uppercase tracking-widest shadow-xl shadow-brand-500/20">
                                New Booking
                            </Button>
                        </Link>
                    </div>
                </div>
                {/* Hero Image */}
                {pageMeta?.imageUrl ? (
                    <div className="absolute top-0 right-0 w-1/3 h-full opacity-20 pointer-events-none">
                        <img src={pageMeta.imageUrl} alt="" className="w-full h-full object-cover rounded-l-full grayscale" />
                    </div>
                ) : (
                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                        <LayoutDashboard className="w-64 h-64 text-brand-600" />
                    </div>
                )}
            </div>

            {/* Placeholder for Dashboard Content - can be expanded later */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Today's Overview</h3>
                    <p className="text-sm text-gray-500">Check daily bookings and kitchen status.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Driver Status</h3>
                    <p className="text-sm text-gray-500">View active routes and pickup schedules.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Inventory Alerts</h3>
                    <p className="text-sm text-gray-500">Low stock items requiring attention.</p>
                </div>
            </div>
        </PageContainer>
    );
};

export default ManagerHome;
