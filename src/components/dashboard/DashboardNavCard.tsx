import React from 'react';
import { Link } from 'react-router'; /* Using react-router per the project's setup */
import * as Icons from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DashboardNavCardProps {
    path: string;
    iconName?: string;
    label: string;
    description?: string;
    className?: string; // Optional extra classes
}

const DashboardNavCard: React.FC<DashboardNavCardProps> = ({
    path,
    iconName = 'LayoutDashboard',
    label,
    description,
    className
}) => {
    // Resolve Lucide Icon component correctly
    const IconComponent = (Icons as any)[iconName] || Icons.LayoutDashboard;

    return (
        <Link
            to={path}
            className={cn(
                "group relative flex flex-col p-8 rounded-3xl transition-all duration-300",
                "bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5",
                "hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-500/30",
                "hover:-translate-y-1 overflow-hidden",
                "animate-in zoom-in-95 duration-500",
                className
            )}
        >
            {/* Decorative Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Icon Header */}
            <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <IconComponent className="w-8 h-8" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {label}
                </h3>

                {description && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {description}
                    </p>
                )}

                {/* Link Action */}
                <div className="mt-auto pt-5 flex items-center text-sm font-bold uppercase tracking-wider text-brand-500 group-hover:text-brand-600 transition-colors">
                    Go to {label}
                    <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </Link>
    );
};

export default DashboardNavCard;
