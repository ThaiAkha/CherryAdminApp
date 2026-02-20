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
    const [homeCards, setHomeCards] = useState<any[]>([]);
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

                // Load home cards from database
                const cards = await contentService.getHomeCards();
                console.log('🏠 Home Cards loaded:', cards);
                setHomeCards(cards || []);
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

    // Separate cards by type from database
    const featureCards = homeCards.filter(card => card.card_type === 'feature');
    const navCards = homeCards.filter(card => card.card_type === 'nav');
    const ctaBanners = homeCards.filter(card => card.card_type === 'cta');

    return (
        <PageContainer variant="full">
            <div className="max-w-[1600px] mx-auto">
                {/* ROW 1: HERO SECTION (full width) */}
                <div className="mb-8">
                    <div className="h-[300px]">
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
                </div>

                {/* ROW 2: SIDEBAR + MAIN CONTENT */}
                <div className="grid grid-cols-12 gap-8">
                    {/* SIDEBAR (3 col) - Nav cards */}
                    <div className="col-span-12 md:col-span-4 lg:col-span-3">
                        <div className="flex flex-col gap-6 sticky top-8">
                            {navCards.map((card: any) => (
                                <div key={card.id}>
                                    <DashboardNavCard
                                        path={card.target_path || card.page_slug ? `/${card.target_path || card.page_slug}` : '#'}
                                        iconName={card.icon}
                                        label={card.title || card.card_title}
                                        description={card.description || card.card_description}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MAIN CONTENT (9 col) - Features + CTA */}
                    <div className="col-span-12 md:col-span-8 lg:col-span-9">
                        {/* Features Grid */}
                        {featureCards.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {featureCards.map((card: any) => (
                                    <FeatureCard
                                        key={card.id}
                                        title={card.title || card.card_title}
                                        description={card.description || card.card_description}
                                        imageUrl={card.image_url || card.card_image}
                                        icon={card.icon}
                                        path={card.target_path || card.page_slug ? `/${card.target_path || card.page_slug}` : '#'}
                                        linkLabel={card.link_label}
                                        aspectRatio="aspect-[3/1]"
                                    />
                                ))}
                            </div>
                        )}

                        {/* CTA Banners */}
                        <div className="space-y-6">
                            {ctaBanners.map((card: any) => (
                                <CTABanner
                                    key={card.id}
                                    title={card.title || card.card_title}
                                    description={card.description || card.card_description}
                                    ctaLabel={card.cta_label || card.link_label || 'View More'}
                                    ctaPath={card.target_path || card.page_slug ? `/${card.target_path || card.page_slug}` : '#'}
                                    icon={card.icon}
                                    variant={card.variant || 'dark'}
                                    className="flex items-center justify-between gap-6 p-12"

                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default AdminHome;
