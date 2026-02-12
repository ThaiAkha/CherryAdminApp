import React from 'react';
import { cn } from '../../lib/utils';

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'narrow' | 'full';
}

const PageContainer: React.FC<PageContainerProps> = ({ children, className, variant = 'default' }) => {
    return (
        <div className={cn(
            "w-full mx-auto px-2 py-4 md:p-3 lg:p-4 animate-in fade-in duration-500",
            variant === 'default' && "max-w-[1920px]", // Full HD optimized
            variant === 'narrow' && "max-w-7xl",
            variant === 'full' && "max-w-full",
            className
        )}>
            {children}
        </div>
    );
};

export default PageContainer;
