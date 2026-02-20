/**
 * 🏠 ADMIN HOME - Editorial Storyboard Layout
 *
 * Magazine-style dashboard with feature cards and CTA banners
 * Inspired by Stitch "Editorial Storyboard V3" design
 */

import React, { useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { usePageHeader } from '../../context/PageHeaderContext';
import { contentService } from '../../services/content.service';
import WelcomeHero from '../../components/dashboard/WelcomeHero';
import FeatureCard from '../../components/dashboard/FeatureCard';
import DashboardNavCard from '../../components/dashboard/DashboardNavCard';
import CTABanner from '../../components/dashboard/CTABanner';

const AdminHome: React.FC = () => {
    const { setPageHeader } = usePageHeader();
    const [pageMeta, setPageMeta] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const meta = await contentService.getPageMetadata('admin-home');
                if (meta) {
                    setPageMeta(meta);
                    setPageHeader(meta.titleMain || 'Admin Home', meta.description || '');
                } else {
                    setPageHeader('Admin Home', 'Central command for operations');
                }
            } catch (error) {
                console.error("Failed to load admin home data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [setPageHeader]);

    if (isLoading) {
        return (
            <PageContainer variant="full">
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer variant="full">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* EDITORIAL GRID LAYOUT */}
                <div className="grid grid-cols-12 gap-8">
                    {/* HERO LARGE - 8 columns */}
                    <div className="col-span-12 lg:col-span-8 h-[400px]">
                        <WelcomeHero
                            badge={pageMeta?.badge || 'Dashboard'}
                            titleMain={pageMeta?.titleMain || 'ADMIN'}
                            titleHighlight={pageMeta?.titleHighlight || 'HOME'}
                            description={pageMeta?.description || 'Central command for Thai Akha Kitchen operations. Streamlining hospitality through modern storytelling and data.'}
                            imageUrl={pageMeta?.imageUrl || 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=2070&auto=format&fit=crop'}
                            icon="TrendingUp"
                            className="h-full shadow-2xl"
                        />
                    </div>

                    {/* FEATURE CARD - Inventory Store - 4 columns */}
                    <div className="col-span-12 md:col-span-6 lg:col-span-4 h-[400px]">
                        <FeatureCard
                            title="Inventory Store"
                            description="Manage product catalog, stock levels, and precise ingredient pricing."
                            imageUrl="https://images.unsplash.com/photo-1556910101-ff37c7cb3668?w=800&auto=format&fit=crop"
                            icon="Package"
                            path="/admin-inventory"
                            linkLabel="Go to Store"
                            aspectRatio="aspect-[4/3]"
                            className="h-full"
                        />
                    </div>

                    {/* FEATURE CARD - Hotel List - 4 columns */}
                    <div className="col-span-12 md:col-span-6 lg:col-span-4">
                        <FeatureCard
                            title="Hotel List"
                            description="Add hotels, map GPS coordinates, and assign dynamic pickup zones for classes."
                            imageUrl="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop"
                            icon="Hotel"
                            path="/admin-hotels"
                            linkLabel="Go to Hotel List"
                        />
                    </div>

                    {/* FEATURE CARD - Calendar - 4 columns */}
                    <div className="col-span-12 md:col-span-6 lg:col-span-4">
                        <FeatureCard
                            title="Manage Calendar"
                            description="Coordinate class sessions, seasonal closures, and guide availability in real-time."
                            imageUrl="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop"
                            icon="CalendarDays"
                            path="/admin-calendar"
                            linkLabel="Go to Calendar"
                        />
                    </div>

                    {/* QUICK ACCESS CARDS STACK - 4 columns */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                        {/* Database */}
                        <DashboardNavCard
                            path="/admin-database"
                            iconName="Database"
                            label="System Database"
                            description="Core logs, system health, and raw data viewer."
                        />

                        {/* Storage */}
                        <DashboardNavCard
                            path="/admin-storage"
                            iconName="FolderOpen"
                            label="Media Storage"
                            description="Manage high-res uploads and brand assets."
                        />
                    </div>
                </div>

                {/* CTA BANNER - Full Width */}
                <CTABanner
                    title="Executive Reports & Intelligence"
                    description="Track revenue stats, driver payroll efficiency, and operational KPIs for the current quarter."
                    ctaLabel="View Reports"
                    ctaPath="/admin-reports"
                    icon="BarChart3"
                    variant="dark"
                />
            </div>
        </PageContainer>
    );
};

export default AdminHome;
