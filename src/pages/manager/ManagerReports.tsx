/**
 * 📊 MANAGER REPORTS
 *
 * Dashboard with analytics, metrics, and operational reports
 * (To be populated with data visualization and statistics)
 */

import React, { useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { usePageHeader } from '../../context/PageHeaderContext';
import { contentService } from '../../services/content.service';
import WelcomeHero from '../../components/dashboard/WelcomeHero';

const ManagerReports: React.FC = () => {
    const { setPageHeader } = usePageHeader();
    const [pageMeta, setPageMeta] = useState<any>(null);

    useEffect(() => {
        const loadMeta = async () => {
            const meta = await contentService.getPageMetadata('manager-reports');
            if (meta) {
                setPageMeta(meta);
                setPageHeader(meta.titleMain || '', meta.description || '');
            } else {
                setPageHeader('Reports', 'Analytics and operational insights');
            }
        };
        loadMeta();
    }, [setPageHeader]);

    return (
        <PageContainer variant="wide">
            <div>
                {/* HERO SECTION */}
                {pageMeta && (
                    <WelcomeHero
                        badge={pageMeta.badge}
                        titleMain={pageMeta.titleMain}
                        titleHighlight={pageMeta.titleHighlight}
                        description={pageMeta.description}
                        imageUrl={pageMeta.imageUrl}
                        icon={pageMeta.icon}
                    />
                )}

                {/* PLACEHOLDER: Reports content will be added here */}
                <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        📊 Reports dashboard coming soon...
                    </p>
                </div>
            </div>
        </PageContainer>
    );
};

export default ManagerReports;
