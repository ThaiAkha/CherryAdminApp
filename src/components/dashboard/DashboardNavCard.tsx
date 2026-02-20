import React from 'react';
import { Link } from 'react-router'; /* Using react-router per the project's setup */
import { ArrowRight } from 'lucide-react';
import { getIcon, type IconName } from '../../lib/iconRegistry';
import { Heading, Paragraph } from '../typography';
import { cn } from '../../lib/utils';

export interface DashboardNavCardProps {
    path: string;
    iconName?: string | IconName;
    label: string;
    description?: string;
    linkLabel?: string;
    className?: string; // Optional extra classes
}

const DashboardNavCard: React.FC<DashboardNavCardProps> = ({
    path,
    iconName,
    label,
    description,
    linkLabel,
    className
}) => {
    // Get icon from registry
    const IconComponent = getIcon(iconName);

    return (
        <Link
            to={path}
            className={cn(
                "group relative flex flex-col p-6 rounded-3xl transition-all duration-300",
                "bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800",
                "hover:shadow-xl hover:shadow-brand-500/5",
                "hover:-translate-y-1 overflow-hidden",
                className
            )}
        >
            {/* Decorative Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Icon Header */}
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 flex items-center justify-center mb-6 transition-all duration-300 shadow-sm group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white">
                <IconComponent className="w-8 h-8" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col">
                <Heading level="h3">
                    {label}
                </Heading>

                {description && (
                    <Paragraph size="base" color="secondary" className="mt-2">
                        {description}
                    </Paragraph>
                )}

                {/* Link Action */}
                {linkLabel && (
                    <div className="mt-auto pt-5 inline-flex items-center text-md font-bold uppercase tracking-wider text-brand-500 group-hover:text-brand-600 transition-colors">
                        {linkLabel}
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </div>
                )}
            </div>
        </Link>
    );
};

export default DashboardNavCard;
