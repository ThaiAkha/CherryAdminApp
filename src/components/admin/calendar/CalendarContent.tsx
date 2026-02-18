import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Lock, Check } from 'lucide-react';
import { cn } from '../../../lib/utils';
import Button from '../../../components/ui/button/Button';
import { DayData, BulkSessionType, getDateKey } from '../../../hooks/useAdminCalendar';

interface CalendarContentProps {
    viewDate: Date;
    onPrev: () => void;
    onNext: () => void;
    isBulkMode: boolean;
    onBulkModeChange: (v: boolean) => void;
    bulkSessionType: BulkSessionType;
    onBulkSessionTypeChange: (t: BulkSessionType) => void;
    calendarDays: Date[];
    availability: Record<string, DayData>;
    loading: boolean;
    selectedDate: string | null;
    selectedDates: Set<string>;
    handleDateClick: (date: Date) => void;
}

const DAYS_HEADER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CalendarContent: React.FC<CalendarContentProps> = ({
    viewDate,
    onPrev,
    onNext,
    isBulkMode,
    onBulkModeChange,
    bulkSessionType,
    onBulkSessionTypeChange,
    calendarDays,
    availability,
    loading,
    selectedDate,
    selectedDates,
    handleDateClick
}) => {
    return (
        <div className="col-span-12 lg:col-span-7 h-full flex flex-col bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white dark:bg-gray-900 shrink-0 mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{MONTHS[viewDate.getMonth()]} <span className="text-gray-400">{viewDate.getFullYear()}</span></h2>
                    <Button
                        variant={isBulkMode ? "primary" : "outline"}
                        className={cn("px-4 text-[10px] font-black uppercase h-9", isBulkMode && "animate-pulse")}
                        onClick={() => onBulkModeChange(!isBulkMode)}
                        startIcon={<Calendar className="w-4 h-4" />}
                    >
                        {isBulkMode ? "CHIUDI BULK" : "BULK EDIT"}
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    {isBulkMode && (
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mr-2">
                            {(['morning_class', 'evening_class', 'all'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => onBulkSessionTypeChange(type)}
                                    className={cn("px-3 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all", bulkSessionType === type ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm" : "text-gray-500")}
                                >
                                    {type === 'morning_class' ? 'Morning' : type === 'evening_class' ? 'Evening' : 'All Day'}
                                </button>
                            ))}
                        </div>
                    )}
                    <button onClick={onPrev} className="size-10 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={onNext} className="size-10 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500"><ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 shrink-0">
                {DAYS_HEADER.map(d => (
                    <div key={d} className="py-3 text-center">
                        <span className="font-black text-gray-900 uppercase tracking-widest text-sm">{d}</span>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 flex-1 gap-px bg-gray-200 overflow-y-auto">
                {calendarDays.map((date, idx) => {
                    const dateStr = getDateKey(date);
                    const data = availability[dateStr];
                    const isCurrentMonth = date.getMonth() === viewDate.getMonth();
                    const isSelected = isBulkMode ? selectedDates.has(dateStr) : dateStr === selectedDate;

                    if (!isCurrentMonth) return <div key={idx} className="bg-gray-50/20 pointer-events-none" />;

                    return (
                        <div
                            key={dateStr}
                            onClick={() => handleDateClick(date)}
                            className={cn(
                                "relative flex flex-col justify-between p-2 min-h-[80px] group transition-all bg-white cursor-pointer hover:bg-brand-50/50",
                                isSelected && "ring-2 ring-brand-500 z-20 shadow-md bg-brand-50/30",
                                isBulkMode && data?.hasBookings && "opacity-40 cursor-not-allowed bg-gray-100"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <span className={cn("text-lg font-black leading-none", (new Date().toDateString() === date.toDateString()) ? "text-brand-600 scale-110" : "text-gray-300 group-hover:text-gray-500")}>
                                    {date.getDate()}
                                </span>
                                {isSelected && isBulkMode && (
                                    <div className="size-4 rounded-full bg-brand-500 flex items-center justify-center shadow-sm">
                                        <Check className="w-2.5 h-2.5 text-white stroke-[4px]" />
                                    </div>
                                )}
                            </div>
                            {!loading && data && (
                                <div className="space-y-1 w-full mt-auto">
                                    {['morning_class', 'evening_class'].map(s => {
                                        const sess = data[s as 'morning_class' | 'evening_class'];
                                        return (
                                            <div
                                                key={s}
                                                className={cn(
                                                    "flex items-center justify-between px-2 py-2 rounded text-[10px] font-bold border",
                                                    sess.status === 'OPEN' ? "bg-green-50 text-gray-600 border-green-100" :
                                                        sess.status === 'FULL' ? "bg-error-50 text-error-700 border-error-100" :
                                                            "bg-gray-50 text-gray-400 border-gray-100"
                                                )}
                                            >
                                                <span className="flex gap-1 items-center">{s === 'morning_class' ? 'M.' : 'E.'} {sess.isLocked && <Lock className="w-2 h-2" />}</span>
                                                <span>{sess.status === 'OPEN' ? sess.seats : (sess.status === 'CLOSED' ? 'X' : '0')}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarContent;
