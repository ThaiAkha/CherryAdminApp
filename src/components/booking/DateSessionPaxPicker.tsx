import React from 'react';
import { Minus, Plus } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Button from '../ui/button/Button';
import AdminClassPicker from '../common/AdminClassPicker';

interface DateSessionPaxPickerProps {
    date: string;
    onDateChange: (d: string) => void;
    session: 'morning_class' | 'evening_class';
    onSessionChange: (s: 'morning_class' | 'evening_class') => void;
    pax: number;
    onPaxChange: (p: number) => void;
    maxPax: number;
}

const DateSessionPaxPicker: React.FC<DateSessionPaxPickerProps> = ({
    date,
    onDateChange,
    session,
    onSessionChange,
    pax,
    onPaxChange,
    maxPax
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <SectionHeader title="Date & Session" variant="sidebar" className="ml-0" />
            <AdminClassPicker
                date={date}
                onDateChange={onDateChange}
                session={session}
                onSessionChange={onSessionChange}
            />
            {/* Pax Counter */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <SectionHeader title="Pax Count" variant="sidebar" className="ml-0" />
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="size-10 p-0"
                        onClick={() => onPaxChange(Math.max(1, pax - 1))}
                        disabled={pax <= 1}
                    >
                        <Minus className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 text-center font-black text-2xl h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        {pax}
                    </div>
                    <Button
                        variant="outline"
                        className="size-10 p-0"
                        onClick={() => onPaxChange(Math.min(pax + 1, maxPax))}
                        disabled={pax >= maxPax || maxPax === 0}
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
                <p className="text-center text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">
                    {pax} of {maxPax} available
                </p>
            </div>
        </div>
    );
};

export default DateSessionPaxPicker;
