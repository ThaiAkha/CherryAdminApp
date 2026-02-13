import { useEffect } from "react";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentBookings from "../../components/booking/RecentBookings";
import AgencyRecentBookings from "../../components/booking/AgencyRecentBookings";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import PageContainer from "../../components/layout/PageContainer";
import { usePageHeader } from "../../context/PageHeaderContext";
import { contentService } from "../../services/content.service";
import { Link } from 'react-router';
import { Calendar, Plus, Home } from 'lucide-react';
import Button from '../../components/ui/button/Button';

const QuickActions = () => (
    <div className="flex items-center gap-2">
        <Link to="/">
            <Button variant="outline" size="sm" startIcon={<Home className="size-4" />} className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-9">Portal</Button>
        </Link>
        <Link to="/agency-reservations">
            <Button variant="outline" size="sm" startIcon={<Calendar className="size-4" />} className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-9">Reservations</Button>
        </Link>
        <Link to="/agency-booking">
            <Button variant="primary" size="sm" startIcon={<Plus className="size-4" />} className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-9 shadow-lg shadow-brand-500/20">New Booking</Button>
        </Link>
    </div>
);

export default function AgencyDashboard() {
    const { setPageHeader } = usePageHeader();

    useEffect(() => {
        const loadMetadata = async () => {
            const meta = await contentService.getPageMetadata('ecommerce-dashboard');
            if (meta) {
                setPageHeader(
                    meta.titleMain || 'Agency Dashboard',
                    meta.description || 'Overview of sales, revenue, and guest demographics.',
                    <QuickActions />
                );
            } else {
                setPageHeader('Agency Dashboard', 'Overview of sales, revenue, and guest demographics.', <QuickActions />);
            }
        };
        loadMetadata();
    }, [setPageHeader]);

    return (
        <>
            <PageMeta
                title="Admin 1122 Dashboard | Thai Akha Kitchen"
                description="To be set up later."
            />
            <PageContainer variant="full">
                <div className="pb-20 space-y-8">
                    <div className="col-span-12 space-y-6">
                        <EcommerceMetrics />

                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 xl:col-span-7">
                                <MonthlySalesChart />
                            </div>
                            <div className="col-span-12 xl:col-span-5">
                                <MonthlyTarget />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Booking Tables */}
                    <div className="col-span-12 xl:col-span-6">
                        <AgencyRecentBookings />
                    </div>

                    <div className="col-span-12 xl:col-span-6">
                        <RecentBookings />
                    </div>

                    {/* Row 3: Demographic */}
                    <div className="col-span-12">
                        <DemographicCard />
                    </div>
                </div>
            </PageContainer>
        </>
    );
}
