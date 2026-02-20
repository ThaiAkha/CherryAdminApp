import React, { useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { usePageHeader } from '../../context/PageHeaderContext';
import { contentService } from '../../services/content.service';
import WelcomeHero from '../../components/dashboard/WelcomeHero';
import DashboardNavCard from '../../components/dashboard/DashboardNavCard';

const LogisticHome: React.FC = () => {
    const { setPageHeader } = usePageHeader();
    const [pageMeta, setPageMeta] = useState<any>(null);

    useEffect(() => {
        const loadMeta = async () => {
            const meta = await contentService.getPageMetadata('logistics-home');
            if (meta) {
                setPageMeta(meta);
                setPageHeader(meta.titleMain || 'Logistics', meta.description || '');
            } else {
                setPageHeader('Logistics', 'Stock movements, driver routes, and supply chain.');
            }
        };
        loadMeta();
    }, [setPageHeader]);

    return (
        <PageContainer variant="narrow">
            {/* HERO SECTION */}
            <WelcomeHero
                badge={pageMeta?.badge || 'Dashboard'}
                titleMain={pageMeta?.titleMain || 'Logistics'}
                titleHighlight={pageMeta?.titleHighlight || 'Home'}
                description={pageMeta?.description || 'Stock movements, driver routes, and supply chain.'}
                imageUrl={pageMeta?.imageUrl}
                icon="Truck"
            />

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardNavCard
                    path="/logistics-routes"
                    iconName="Map"
                    label="Today's Routes"
                    description="Check active delivery routes."
                />
                <DashboardNavCard
                    path="/logistics-transfers"
                    iconName="ArrowRightLeft"
                    label="Inventory Transfers"
                    description="Pending stock movements."
                    className="delay-100"
                />
                <DashboardNavCard
                    path="/logistics-vehicles"
                    iconName="CarFront"
                    label="Vehicle Status"
                    description="Maintenance alerts and availability."
                    className="delay-200"
                />
            </div>
        </PageContainer>
    );
};

export default LogisticHome;
