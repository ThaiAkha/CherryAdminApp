import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Sun, Moon, Layers, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Dropdown } from '../ui/dropdown/Dropdown';
import MiniCalendar from './MiniCalendar';

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
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Date Helpers
    const currentDate = new Date(date);
    const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const changeDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        onDateChange(newDate.toISOString().split('T')[0]);
    };

    const handleDateSelect = (newDate: Date) => {
        onDateChange(newDate.toISOString().split('T')[0]);
        setIsCalendarOpen(false);
    };

    const SESSIONS: { id: SessionType; label: string; icon: React.ReactNode }[] = [
        { id: 'all', label: 'All', icon: <Layers className="w-4 h-4" /> },
        { id: 'morning_class', label: 'Morning', icon: <Sun className="w-4 h-4" /> },
        { id: 'evening_class', label: 'Evening', icon: <Moon className="w-4 h-4" /> },
    ];

    return (
        <div className={cn("flex items-center gap-3 bg-white dark:bg-black/20 p-1 rounded-xl border border-gray-200 dark:border-white/10", className)}>

            {/* Date Picker */}
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 rounded-lg p-1 relative">
                <button
                    onClick={() => changeDate(-1)}
                    className="p-1 hover:bg-white dark:hover:bg-white/10 rounded-md transition-colors text-gray-500"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="relative">
                    <button
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        className="dropdown-toggle flex items-center gap-2 min-w-[120px] px-2 py-1 hover:bg-white dark:hover:bg-white/10 rounded-md transition-colors"
                    >
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                            {formatDate(currentDate)}
                        </span>
                    </button>

                    <Dropdown
                        isOpen={isCalendarOpen}
                        onClose={() => setIsCalendarOpen(false)}
                        className="left-0 mt-2 w-[280px]"
                    >
                        <MiniCalendar
                            value={currentDate}
                            onChange={handleDateSelect}
                            className="border-0 shadow-none"
                        />
                    </Dropdown>
                </div>

                <button
                    onClick={() => changeDate(1)}
                    className="p-1 hover:bg-white dark:hover:bg-white/10 rounded-md transition-colors text-gray-500"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-white/10" />

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
