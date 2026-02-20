/**
 * 🏠 MANAGER HOME - Editorial Storyboard Layout
 *
 * Magazine-style dashboard with operational overview
 * Features, navigation cards, and quick booking CTA
 */

import React, { useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { usePageHeader } from '../../context/PageHeaderContext';
import { contentService } from '../../services/content.service';
import WelcomeHero from '../../components/dashboard/WelcomeHero';
import FeatureCardsGrid from '../../components/dashboard/FeatureCardsGrid';
import DashboardNavCard from '../../components/dashboard/DashboardNavCard';
import CTABanner from '../../components/dashboard/CTABanner';

const ManagerHome: React.FC = () => {
    const { setPageHeader } = usePageHeader();
    const [pageMeta, setPageMeta] = useState<any>(null);
    const [homeCards, setHomeCards] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const meta = await contentService.getPageMetadata('manager-home');
                if (meta) {
                    setPageMeta(meta);
                    setPageHeader(meta.titleMain || '', meta.description || '');
                }

                // Load home cards from database (filtered for manager role)
                const cards = await contentService.getHomeCards();
                const managerCards = cards.filter((card: any) => card.role === 'manager');
                console.log('🏠 Manager Home Cards loaded:', managerCards);
                setHomeCards(managerCards || []);
            } catch (error) {
                console.error("Failed to load manager home data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [setPageHeader]);

    if (isLoading) {
        return (
            <PageContainer variant="full">
                <LoadingSpinner variant="fullscreen" />
            </PageContainer>
        );
    }

    // Separate cards by type from database
    const featureCards = homeCards.filter(card => card.card_type === 'feature');
    const navCards = homeCards.filter(card => card.card_type === 'nav');
    const ctaBanners = homeCards.filter(card => card.card_type === 'cta');

    return (
        <PageContainer variant="wide">
            <div>
                {/* ROW 1: HERO SECTION (full width) */}
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

                {/* ROW 2: SIDEBAR + MAIN CONTENT */}
                <div className="grid grid-cols-12 gap-8">
                    {/* SIDEBAR (3 col) - Nav cards */}
                    <div className="col-span-12 md:col-span-4 lg:col-span-3">
                        <div className="flex flex-col gap-8">
                            {navCards.map((card: any) => (
                                <div key={card.id}>
                                    <DashboardNavCard
                                        path={card.target_path || card.page_slug ? `/${card.target_path || card.page_slug}` : '#'}
                                        iconName={card.icon_name}
                                        label={card.title || card.card_title}
                                        description={card.description || card.card_description}
                                        linkLabel={card.link_label}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MAIN CONTENT (9 col) - Features + CTA */}
                    <div className="col-span-12 md:col-span-8 lg:col-span-9">
                        {/* Features Grid */}
                        <FeatureCardsGrid cards={featureCards} />

                        {/* CTA Banners */}
                        <div className="space-y-6">
                            {ctaBanners.map((card: any) => (
                                <CTABanner
                                    key={card.id}
                                    title={card.title || card.card_title}
                                    description={card.description || card.card_description}
                                    ctaLabel={card.cta_label || card.link_label || 'View More'}
                                    ctaPath={card.target_path || card.page_slug ? `/${card.target_path || card.page_slug}` : '#'}
                                    variant={card.variant || 'dark'}
                                    className="flex items-center justify-between gap-6 p-13"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default ManagerHome;
