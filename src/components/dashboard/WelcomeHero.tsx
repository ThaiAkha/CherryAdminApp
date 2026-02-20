import React from 'react';
import Badge from '../ui/badge/Badge';
import { getIcon, type IconName } from '../../lib/iconRegistry';
import { cn } from '../../lib/utils';

export interface WelcomeHeroProps {
    badge?: string;
    titleMain: string;
    titleHighlight?: string;
    description: string;
    imageUrl?: string;
    icon?: string | IconName;
    children?: React.ReactNode;
    className?: string; // Additional classes for the container
}

const WelcomeHero: React.FC<WelcomeHeroProps> = ({
    badge = 'Dashboard',
    titleMain,
    titleHighlight,
    description,
    imageUrl,
    icon = 'LayoutDashboard',
    children,
    className
}) => {
    const IconComponent = getIcon(icon);

    return (
        <div className={cn(
            "rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03] md:p-12 relative overflow-hidden shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500",
            className
        )}>
            <div className="relative z-10 space-y-6 max-w-2xl">
                {badge && (
                    <Badge color="primary" className="px-6 py-2 text-sm font-bold uppercase tracking-widest drop-shadow-sm">
                        {badge}
                    </Badge>
                )}
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-gray-800 dark:text-white leading-none">
                    {titleMain} {titleHighlight && <span className="text-brand-600 drop-shadow-sm">{titleHighlight}</span>}
                </h1>
                <p className="text-lg font-medium text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed">
                    {description}
                </p>
                {/* Optional interactive actions (like New Booking button) */}
                {children && (
                    <div className="pt-2">
                        {children}
                    </div>
                )}
            </div>

            {/* Background Decorator (Image or Icon) */}
            {imageUrl ? (
                <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none">
                    {/* Photo with color - no grayscale */}
                    <img
                        src={imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                    {/* Multi-layer gradient for smooth blend - matches card background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-white/[0.03] dark:via-white/[0.02] dark:to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/30 dark:to-white/[0.08]" />
                </div>
            ) : (
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-10 pointer-events-none">
                    {IconComponent && <IconComponent className="w-64 h-64 text-brand-600" />}
                </div>
            )}
        </div>
    );
};

export default WelcomeHero;
