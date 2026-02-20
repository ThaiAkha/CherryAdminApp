import React, { useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { usePageHeader } from '../../context/PageHeaderContext';
import { contentService } from '../../services/content.service';
import WelcomeHero from '../../components/dashboard/WelcomeHero';
import DashboardNavCard from '../../components/dashboard/DashboardNavCard';

// Definizione dei path desiderati e del loro ordine forzato
const TARGET_PAGES = [
    { key: 'Hotels', slugs: ['admin-hotels'] },
    { key: 'Calendar', slugs: ['admin-calendar'] },
    { key: 'Inventory', slugs: ['admin-inventory'] },
    { key: 'Database', slugs: ['admin-database'] },
    { key: 'Storage', slugs: ['admin-storage'] },
    { key: 'Reports', slugs: ['admin-reports'] }
];

const AdminHome: React.FC = () => {
    const { setPageHeader } = usePageHeader();
    const [pageMeta, setPageMeta] = useState<any>(null);
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Carica metadati pagina
                const meta = await contentService.getPageMetadata('admin-home');
                if (meta) {
                    setPageMeta(meta);
                    setPageHeader(meta.titleMain || 'Admin', meta.description || '');
                } else {
                    setPageHeader('Admin', 'Central command.');
                }

                // Carica elementi menu
                const items = await contentService.getMenuItems() || [];

                // Filtra solo gli item desiderati e assegna l'ordine basato su TARGET_PAGES
                const matchedItems: any[] = [];

                TARGET_PAGES.forEach((targetConfig, index) => {
                    const match = items.find(item =>
                        item.page_slug && targetConfig.slugs.includes(item.page_slug)
                    );
                    if (match) {
                        // Assegna il targetIndex per il sorting
                        matchedItems.push({ ...match, targetIndex: index });
                    }
                });

                // Ordina in base all'ordine richiesto (Hotels prima)
                matchedItems.sort((a, b) => a.targetIndex - b.targetIndex);

                setMenuItems(matchedItems);
            } catch (error) {
                console.error("Failed to load admin home data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [setPageHeader]);

    return (
        <PageContainer variant="narrow">
            {/* HERO SECTION */}
            <WelcomeHero
                badge={pageMeta?.badge || 'Dashboard'}
                titleMain={pageMeta?.titleMain || 'Admin'}
                titleHighlight={pageMeta?.titleHighlight || 'Home'}
                description={pageMeta?.description || 'Central command for Thai Akha Kitchen operations. Select an area below to manage your system.'}
                imageUrl={pageMeta?.imageUrl}
                icon="TrendingUp"
            />

            {/* NAVIGATION GRID */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((item) => (
                        <DashboardNavCard
                            key={item.page_slug}
                            path={`/${item.page_slug}`}
                            iconName={item.header_icon}
                            label={item.menu_label}
                            description={item.page_description}
                        />
                    ))}
                </div>
            )}
        </PageContainer>
    );
};

export default AdminHome;
