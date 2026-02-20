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

    // Separate cards by type OR use fallback data
    const featureCards = homeCards.filter(card => card.card_type === 'feature');
    const navCards = homeCards.filter(card => card.card_type === 'nav');
    const ctaBanners = homeCards.filter(card => card.card_type === 'cta');

    // Fallback: if no cards in database, show default cards
    const defaultFeatureCards = [
        {
            id: 'inventory',
            title: 'Inventory Store',
            description: 'Manage product catalog, stock levels, and precise ingredient pricing.',
            image_url: 'https://images.unsplash.com/photo-1556910101-ff37c7cb3668?w=800&auto=format&fit=crop',
            icon: 'Package',
            target_path: 'admin-inventory',
            link_label: 'Go to Store'
        },
        {
            id: 'hotels',
            title: 'Hotel List',
            description: 'Add hotels, map GPS coordinates, and assign dynamic pickup zones for classes.',
            image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
            icon: 'Hotel',
            target_path: 'admin-hotels',
            link_label: 'Go to Hotel List'
        },
        {
            id: 'calendar',
            title: 'Manage Calendar',
            description: 'Coordinate class sessions, seasonal closures, and guide availability in real-time.',
            image_url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop',
            icon: 'CalendarDays',
            target_path: 'admin-calendar',
            link_label: 'Go to Calendar'
        }
    ];

    const defaultNavCards = [
        {
            id: 'database',
            title: 'System Database',
            description: 'Core logs, system health, and raw data viewer.',
            icon: 'Database',
            target_path: 'admin-database'
        },
        {
            id: 'storage',
            title: 'Media Storage',
            description: 'Manage high-res uploads and brand assets.',
            icon: 'FolderOpen',
            target_path: 'admin-storage'
        }
    ];

    const defaultCtaBanners = [
        {
            id: 'reports',
            title: 'Executive Reports & Intelligence',
            description: 'Track revenue stats, driver payroll efficiency, and operational KPIs for the current quarter.',
            cta_label: 'View Reports',
            target_path: 'admin-reports',
            icon: 'BarChart3',
            variant: 'dark'
        }
    ];

    const displayFeatureCards = featureCards.length > 0 ? featureCards : defaultFeatureCards;
    const displayNavCards = navCards.length > 0 ? navCards : defaultNavCards;
    const displayCtaBanners = ctaBanners.length > 0 ? ctaBanners : defaultCtaBanners;

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

                    {/* FEATURE CARDS - Dynamic from database */}
                    {displayFeatureCards.map((card, index) => (
                        <div
                            key={card.id}
                            className={index === 0 ? "col-span-12 md:col-span-6 lg:col-span-4 h-[400px]" : "col-span-12 md:col-span-6 lg:col-span-4"}
                        >
                            <FeatureCard
                                title={card.title || card.card_title}
                                description={card.description || card.card_description}
                                imageUrl={card.image_url || card.card_image}
                                icon={card.icon}
                                path={card.target_path || card.page_slug ? `/${card.target_path || card.page_slug}` : '#'}
                                linkLabel={card.link_label}
                                aspectRatio="aspect-[4/3]"
                                className={index === 0 ? "h-full" : ""}
                            />
                        </div>
                    ))}

                    {/* QUICK ACCESS CARDS STACK - 4 columns */}
                    {displayNavCards.length > 0 && (
                        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                            {displayNavCards.map(card => (
                                <DashboardNavCard
                                    key={card.id}
                                    path={card.target_path || card.page_slug ? `/${card.target_path || card.page_slug}` : '#'}
                                    iconName={card.icon}
                                    label={card.title || card.card_title}
                                    description={card.description || card.card_description}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* CTA BANNERS - Dynamic from database */}
                {displayCtaBanners.map(card => (
                    <CTABanner
                        key={card.id}
                        title={card.title || card.card_title}
                        description={card.description || card.card_description}
                        ctaLabel={card.cta_label || card.link_label || 'View More'}
                        ctaPath={card.target_path || card.page_slug ? `/${card.target_path || card.page_slug}` : '#'}
                        icon={card.icon}
                        variant={card.variant || 'dark'}
                    />
                ))}
            </div>
        </PageContainer>
    );
};

export default AdminHome;
