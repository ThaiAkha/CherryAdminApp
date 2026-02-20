import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import PageContainer from '../../components/layout/PageContainer';
import { usePageHeader } from '../../context/PageHeaderContext';
import { contentService } from '../../services/content.service';
import WelcomeHero from '../../components/dashboard/WelcomeHero';
import Button from '../../components/ui/button/Button';
import { Plus } from 'lucide-react';
import DashboardNavCard from '../../components/dashboard/DashboardNavCard';

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
            <WelcomeHero
                badge={pageMeta?.badge || 'Staff Only'}
                titleMain={pageMeta?.titleMain || 'Manager'}
                titleHighlight={pageMeta?.titleHighlight || 'Home'}
                description={pageMeta?.description || 'Operational overview, daily metrics, and staff announcements.'}
                imageUrl={pageMeta?.imageUrl}
                icon="LayoutDashboard"
            >
                <Link to="/manager-booking">
                    <Button variant="primary" size="md" startIcon={<Plus className="w-5 h-5" />} className="rounded-2xl h-14 px-8 text-base font-black uppercase tracking-widest shadow-xl shadow-brand-500/20">
                        New Booking
                    </Button>
                </Link>
            </WelcomeHero>

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardNavCard
                    path="/manager-reports"
                    iconName="LineChart"
                    label="Today's Overview"
                    description="Check daily bookings and kitchen status."
                />
                <DashboardNavCard
                    path="/manager-drivers"
                    iconName="Truck"
                    label="Driver Status"
                    description="View active routes and pickup schedules."
                    className="delay-100"
                />
                <DashboardNavCard
                    path="/manager-inventory"
                    iconName="Package"
                    label="Inventory Alerts"
                    description="Low stock items requiring attention."
                    className="delay-200"
                />
            </div>
        </PageContainer>
    );
};

export default ManagerHome;
