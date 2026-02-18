import React from 'react';
import { cn } from '../../lib/utils';

interface SectionHeaderProps {
    title: string;
    className?: string;
    variant?: 'sidebar' | 'inspector' | 'title' | 'default';
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    className,
    variant = 'default'
}) => {
    return (
        <h6 className={cn(
            "font-black uppercase tracking-[0.2em]",
            variant === 'title' && "text-xs tracking-[0.25em] text-gray-800 dark:text-gray-200",
            variant === 'sidebar' && "text-[10px] text-gray-400 mb-3 ml-1",
            variant === 'inspector' && "text-[10px] text-gray-400 mb-1",
            variant === 'default' && "text-[10px] text-gray-400 mb-2",
            className
        )}>
            {title}
        </h6>
    );
};

export default SectionHeader;
