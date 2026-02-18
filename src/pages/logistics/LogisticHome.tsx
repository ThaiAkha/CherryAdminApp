import React, { useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { usePageHeader } from '../../context/PageHeaderContext';
import { contentService } from '../../services/content.service';
import Badge from '../../components/ui/badge/Badge';
import { Truck } from 'lucide-react';

const LogisticHome: React.FC = () => {
    const { setPageHeader } = usePageHeader();
    const [pageMeta, setPageMeta] = useState<any>(null);

    useEffect(() => {
        const loadMeta = async () => {
            const meta = await contentService.getPageMetadata('logistic-home');
            if (meta) {
                setPageMeta(meta);
                setPageHeader(meta.titleMain || 'Logistics', meta.description || '');
            } else {
                setPageHeader('Logistics', 'Route planning, driver coordination, and delivery tracking.');
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
                        {pageMeta?.titleMain || 'Logistic'} <span className="text-brand-600">{pageMeta?.titleHighlight || 'Home'}</span>
                    </h1>
                    <p className="text-lg font-medium text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed">
                        {pageMeta?.description || 'Route planning, driver coordination, and delivery tracking.'}
                    </p>
                </div>
                {pageMeta?.imageUrl ? (
                    <div className="absolute top-0 right-0 w-1/3 h-full opacity-20 pointer-events-none">
                        <img src={pageMeta.imageUrl} alt="" className="w-full h-full object-cover rounded-l-full grayscale" />
                    </div>
                ) : (
                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                        <Truck className="w-64 h-64 text-brand-600" />
                    </div>
                )}
            </div>
        </PageContainer>
    );
};

export default LogisticHome;
