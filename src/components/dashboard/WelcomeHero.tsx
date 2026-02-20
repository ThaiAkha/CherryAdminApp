import React from 'react';
import Badge from '../ui/badge/Badge';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';

export interface WelcomeHeroProps {
    badge?: string;
    titleMain: string;
    titleHighlight?: string;
    description: string;
    imageUrl?: string;
    icon?: string;
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
    const IconComponent = (Icons as any)[icon];

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
                <div className="absolute top-0 right-0 w-1/3 h-full opacity-20 pointer-events-none">
                    <img src={imageUrl} alt="" className="w-full h-full object-cover rounded-l-full grayscale" />
                    {/* Gradient to smooth the image fade out on the left */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-gray-900 to-transparent" />
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
