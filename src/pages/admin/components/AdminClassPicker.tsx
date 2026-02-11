import React from 'react';
import { Sun, Moon, List } from 'lucide-react';
import { cn } from '../../../lib/utils';

// --- TYPES ---
export type SessionType = 'morning_class' | 'evening_class' | 'all';

interface ClassPickerProps {
    date: string;
    onDateChange: (date: string) => void;
    session: SessionType;
    onSessionChange: (session: SessionType) => void;
    className?: string;
}

const SESSIONS: { id: SessionType; label: string; icon: React.ReactNode }[] = [
    { id: 'morning_class', label: 'Morning', icon: <Sun className="w-5 h-5" /> },
    { id: 'evening_class', label: 'Evening', icon: <Moon className="w-5 h-5" /> },
    { id: 'all', label: 'All Day', icon: <List className="w-5 h-5" /> }
];

const AdminClassPicker: React.FC<ClassPickerProps> = ({
    date,
    onDateChange,
    session,
    onSessionChange,
    className
}) => {
    return (
        <div className={cn(
            "flex flex-col md:flex-row items-center gap-3 bg-brand-500/10 p-2 rounded-2xl border border-brand-500/20 shadow-sm backdrop-blur-xl",
            className
        )}>

            {/* A. DATE PICKER */}
            <div className="relative group w-full md:w-auto">
                <input
                    type="date"
                    value={date}
                    onChange={(e) => onDateChange(e.target.value)}
                    onKeyDown={(e) => e.preventDefault()}
                    onClick={(e) => e.currentTarget.showPicker()}
                    className={cn(
                        "w-full md:w-auto min-w-[160px] cursor-pointer text-center appearance-none outline-none transition-all duration-300",
                        "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 py-3 px-4 rounded-xl",
                        "text-sm font-bold font-mono tracking-wide text-gray-900 dark:text-white",
                        "hover:bg-gray-50 dark:hover:bg-gray-800",
                        "focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    )}
                />
            </div>

            {/* DIVIDER (Desktop) */}
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 hidden md:block mx-1"></div>

            {/* B. SESSION SWITCH */}
            <div className="flex w-full md:w-auto bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800">
                {SESSIONS.map((s) => {
                    const isActive = session === s.id;
                    return (
                        <button
                            key={s.id}
                            onClick={() => onSessionChange(s.id)}
                            className={cn(
                                "flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
                                isActive
                                    ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
                            )}
                        >
                            {s.icon}
                            <span className="hidden md:inline">{s.label}</span>
                            <span className="md:hidden">
                                {s.label === 'All Day' ? 'All' : s.label.slice(0, 1)}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default AdminClassPicker;
