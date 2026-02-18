import { ChangeEvent, ReactNode } from 'react';
import { cn } from '../../../lib/utils';

interface SelectFieldProps {
    value: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    disabled?: boolean;
    className?: string;
    children: ReactNode;
}

const SelectField = ({ value, onChange, disabled = false, className, children }: SelectFieldProps) => {
    return (
        <select
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={cn(
                "h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700",
                "bg-white dark:bg-gray-900 px-3 text-sm text-gray-800 dark:text-white/90 shadow-sm",
                "focus:outline-none focus:ring-2 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800",
                "transition-all",
                disabled && "opacity-60 cursor-not-allowed bg-gray-50/50",
                className
            )}
        >
            {children}
        </select>
    );
};

export default SelectField;
