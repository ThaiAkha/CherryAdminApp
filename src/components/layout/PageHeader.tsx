import React from "react";
import { cn } from "../../lib/utils";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
    className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    children,
    className,
}) => {
    return (
        <div
            className={cn(
                "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8",
                className
            )}
        >
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">
                    {title}
                </h1>
                {subtitle && (
                    <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {subtitle}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-3">
                {children}
            </div>
        </div>
    );
};

export default PageHeader;
