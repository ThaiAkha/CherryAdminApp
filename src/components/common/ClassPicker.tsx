import React from 'react';
import { ChevronLeft, ChevronRight, Sun, Moon, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';

export type SessionType = 'morning_class' | 'evening_class' | 'all';

interface ClassPickerProps {
    date: string;
    onDateChange: (date: string) => void;
    session: SessionType;
    onSessionChange: (session: SessionType) => void;
    className?: string;
}

const ClassPicker: React.FC<ClassPickerProps> = ({
    date,
    onDateChange,
    session,
    onSessionChange,
    className
}) => {
    // Date Helpers
    const currentDate = new Date(date);
    const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const changeDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        onDateChange(newDate.toISOString().split('T')[0]);
    };

    const SESSIONS: { id: SessionType; label: string; icon: React.ReactNode }[] = [
        { id: 'all', label: 'All', icon: <Layers className="w-4 h-4" /> },
        { id: 'morning_class', label: 'AM', icon: <Sun className="w-4 h-4" /> },
        { id: 'evening_class', label: 'EVE', icon: <Moon className="w-4 h-4" /> },
    ];

    return (
        <div className={cn("flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-black/20 p-1.5 rounded-xl border border-gray-200 dark:border-white/10", className)}>

            {/* Date Picker */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-lg p-1">
                <button
                    onClick={() => changeDate(-1)}
                    className="p-1 hover:bg-white dark:hover:bg-white/10 rounded-md transition-colors text-gray-500"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div
                    className="flex flex-col items-center min-w-[100px] cursor-pointer"
                    onClick={() => (document.getElementById('date-trigger') as HTMLInputElement)?.showPicker()}
                >
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                        {formatDate(currentDate)}
                    </span>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="w-0 h-0 opacity-0 absolute"
                        id="date-trigger"
                    />
                </div>

                <button
                    onClick={() => changeDate(1)}
                    className="p-1 hover:bg-white dark:hover:bg-white/10 rounded-md transition-colors text-gray-500"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-white/10 hidden sm:block" />

            {/* Session Selector */}
            <div className="flex bg-gray-100 dark:bg-black/40 p-1 rounded-lg">
                {SESSIONS.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => onSessionChange(s.id)}
                        className={cn(
                            "flex items-center justify-center min-w-[44px] px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                            session === s.id
                                ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm"
                                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        )}
                        title={s.label}
                    >
                        <span className="md:hidden">{s.icon}</span>
                        <span className="hidden md:inline">{s.label}</span>
                    </button>
                ))}
            </div>

        </div>
    );
};

export default ClassPicker;
