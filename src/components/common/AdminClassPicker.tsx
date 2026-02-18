import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Sun, Moon, Calendar as CalendarIcon } from 'lucide-react';
import BookingCalendarModal from '../booking/BookingCalendarModal';

interface AdminClassPickerProps {
    date: string;
    session: 'morning_class' | 'evening_class';
    onDateChange: (date: string) => void;
    onSessionChange: (session: 'morning_class' | 'evening_class') => void;
}

const AdminClassPicker: React.FC<AdminClassPickerProps> = ({ date, session, onDateChange, onSessionChange }) => {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const handleDateSelect = (newDate: Date) => {
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, '0');
        const day = String(newDate.getDate()).padStart(2, '0');
        onDateChange(`${year}-${month}-${day}`);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Date Picker */}
            <div>
                <label className="block text-[10px] uppercase font-black text-gray-500 mb-1">Date</label>
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="flex-1 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 text-sm font-bold uppercase outline-none focus:border-brand-500 transition-colors"
                    />
                    <button
                        onClick={() => setIsCalendarOpen(true)}
                        className="size-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center hover:bg-brand-100 transition-all active:scale-95"
                    >
                        <CalendarIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <BookingCalendarModal
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                currentDate={new Date(date)}
                onSelectDate={handleDateSelect}
                allowSelectionOnFullDays={true}
            />

            {/* Session Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <button
                    onClick={() => onSessionChange('morning_class')}
                    className={cn(
                        "py-3 rounded-lg text-xs font-black uppercase transition-all flex flex-col items-center gap-1",
                        session === 'morning_class' ? "bg-white dark:bg-gray-700 text-brand-600 shadow-md" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <Sun className="w-4 h-4" />
                    Morning
                </button>
                <button
                    onClick={() => onSessionChange('evening_class')}
                    className={cn(
                        "py-3 rounded-lg text-xs font-black uppercase transition-all flex flex-col items-center gap-1",
                        session === 'evening_class' ? "bg-white dark:bg-gray-700 text-indigo-600 shadow-md" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <Moon className="w-4 h-4" />
                    Evening
                </button>
            </div>
        </div>
    );
};

export default AdminClassPicker;
