import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight, Sun, Moon, Loader2 } from 'lucide-react';

interface BookingCalendarViewProps {
    currentDate: Date;
    onSelectDate: (date: Date) => void;
    onClose: () => void;
    allowSelectionOnFullDays?: boolean;
}

interface SessionStatus {
    status: 'OPEN' | 'FULL' | 'CLOSED';
    seats: number;
}

interface DayData {
    morning: SessionStatus;
    evening: SessionStatus;
}

const DAYS_HEADER = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const MONTHS = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

const getDateKey = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export const BookingCalendarView: React.FC<BookingCalendarViewProps> = ({
    currentDate,
    onSelectDate,
    onClose,
    allowSelectionOnFullDays = false
}) => {
    const [viewDate, setViewDate] = useState(new Date(currentDate));
    const [availability, setAvailability] = useState<Record<string, DayData>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchAvailability = async () => {
            setLoading(true);

            const year = viewDate.getFullYear();
            const month = viewDate.getMonth();

            const firstDayOfMonth = new Date(year, month, 1);
            const startDayIndex = firstDayOfMonth.getDay();

            const startGrid = new Date(year, month, 1 - startDayIndex);
            const endGrid = new Date(startGrid);
            endGrid.setDate(startGrid.getDate() + 41); // 6 weeks

            const startDateStr = getDateKey(startGrid);
            const endDateStr = getDateKey(endGrid);

            try {
                // A. Base Capacity
                const { data: sessionsData } = await supabase.from('class_sessions').select('id, max_capacity');
                const baseCaps: Record<string, number> = {};
                sessionsData?.forEach((s: any) => baseCaps[s.id] = s.max_capacity ?? 12);

                // B. Bookings
                const { data: bookings } = await supabase
                    .from('bookings')
                    .select('booking_date, session_id, pax_count')
                    .gte('booking_date', startDateStr)
                    .lte('booking_date', endDateStr)
                    .neq('status', 'cancelled');

                // C. Overrides
                const { data: overrides } = await supabase
                    .from('class_calendar_overrides')
                    .select('*')
                    .gte('date', startDateStr)
                    .lte('date', endDateStr);

                // D. Build Map
                const statusMap: Record<string, DayData> = {};
                const loopDate = new Date(startGrid);

                for (let i = 0; i < 42; i++) {
                    const dateStr = getDateKey(loopDate);

                    const getStatus = (sessionId: string): SessionStatus => {
                        const override = overrides?.find(o => o.date === dateStr && o.session_id === sessionId);

                        if (override?.is_closed) return { status: 'CLOSED', seats: 0 };

                        const max = override?.custom_capacity ?? baseCaps[sessionId] ?? 12;
                        const occupied = bookings
                            ?.filter(b => b.booking_date === dateStr && b.session_id === sessionId)
                            .reduce((sum, b) => sum + (b.pax_count || 0), 0) || 0;

                        const remaining = Math.max(0, max - occupied);

                        return { status: remaining > 0 ? 'OPEN' : 'FULL', seats: remaining };
                    };

                    statusMap[dateStr] = {
                        morning: getStatus('morning_class'),
                        evening: getStatus('evening_class')
                    };

                    loopDate.setDate(loopDate.getDate() + 1);
                }

                if (isMounted) {
                    setAvailability(statusMap);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Calendar Sync Error:", err);
                if (isMounted) setLoading(false);
            }
        };

        fetchAvailability();
        return () => { isMounted = false; };
    }, [viewDate]);

    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const startDayIndex = firstDayOfMonth.getDay();

        const currentLoop = new Date(year, month, 1 - startDayIndex);
        const days = [];

        for (let i = 0; i < 42; i++) {
            days.push(new Date(currentLoop));
            currentLoop.setDate(currentLoop.getDate() + 1);
        }
        return days;
    }, [viewDate]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isCurrentMonth = viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();

    const handlePrev = () => {
        // Allow going back even if it's current month? Usually blocked in user view, assuming blocked here too based on existing logic
        // But for admin maybe we want to allow going back to view history? 
        // Keeping original logic: disable prev if current month (assuming we don't book in past)
        if (isCurrentMonth) return;
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNext = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    return (
        <div className="w-full flex flex-col h-full bg-white dark:bg-gray-950 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-gray-100">
                        {MONTHS[viewDate.getMonth()]} <span className="text-brand-500">{viewDate.getFullYear()}</span>
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Seleziona una data per il booking</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrev}
                        disabled={isCurrentMonth}
                        className={cn(
                            "p-3 rounded-2xl border transition-all active:scale-95",
                            isCurrentMonth
                                ? "opacity-20 border-gray-100 dark:border-gray-800 cursor-not-allowed"
                                : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-500/30"
                        )}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-500/30 transition-all active:scale-95"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-800 mx-2" />

                    <button
                        onClick={onClose}
                        className="p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-500/30 transition-all active:scale-95 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                        <span className="sr-only">Close</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-gray-50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-white/[0.02] shrink-0">
                {DAYS_HEADER.map(d => (
                    <div key={d} className="py-3 text-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{d}</span>
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 grid-rows-6 flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900/50 gap-px">
                {calendarDays.map((date, idx) => {
                    const dateStr = getDateKey(date);
                    const data = availability[dateStr];
                    const isCurrentM = date.getMonth() === viewDate.getMonth();

                    const checkDate = new Date(date);
                    checkDate.setHours(0, 0, 0, 0);
                    const isPast = checkDate.getTime() < today.getTime();
                    const isSelected = getDateKey(date) === getDateKey(currentDate);

                    const isMorningOpen = data?.morning.status === 'OPEN';
                    const isEveningOpen = data?.evening.status === 'OPEN';
                    const isMorningFull = data?.morning.status === 'FULL';
                    const isEveningFull = data?.evening.status === 'FULL';
                    const isMorningClosed = data?.morning.status === 'CLOSED';
                    const isEveningClosed = data?.evening.status === 'CLOSED';

                    const isFullDay = !loading && data && !isMorningOpen && !isEveningOpen;
                    const isFullyBooked = isMorningFull && isEveningFull;
                    const isFullyClosed = isMorningClosed && isEveningClosed;

                    if (!isCurrentM) {
                        return <div key={idx} className="bg-white/50 dark:bg-gray-950/50" />;
                    }

                    return (
                        <button
                            key={dateStr}
                            disabled={isPast || loading || (isFullDay && !allowSelectionOnFullDays)}
                            onClick={() => { onSelectDate(date); onClose(); }}
                            className={cn(
                                "relative flex flex-col p-2 h-full transition-all group text-left outline-none",
                                isPast
                                    ? "bg-gray-50 dark:bg-gray-900/50 opacity-40 grayscale cursor-not-allowed"
                                    : isFullyBooked && !allowSelectionOnFullDays
                                        ? "bg-red-50/50 dark:bg-red-900/10 cursor-not-allowed"
                                        : isFullyClosed && !allowSelectionOnFullDays
                                            ? "bg-orange-50/50 dark:bg-orange-900/10 cursor-not-allowed"
                                            : "bg-white dark:bg-gray-950 hover:bg-brand-50/50 dark:hover:bg-brand-500/5",
                                isSelected && "ring-2 ring-inset ring-brand-500 z-10 bg-brand-50/30 dark:bg-brand-500/10"
                            )}
                        >
                            <span className={cn(
                                "text-lg font-black tracking-tighter transition-transform",
                                isPast ? "text-gray-300" : "text-gray-900 dark:text-gray-100",
                                isSelected && "text-brand-600 dark:text-brand-400 scale-110"
                            )}>
                                {date.getDate()}
                            </span>

                            {!loading && data && !isPast && (
                                <div className="mt-auto space-y-1 pt-2">
                                    {/* Morning */}
                                    <div className={cn(
                                        "flex items-center justify-between px-2 py-1 rounded-lg text-[9px] font-black uppercase border",
                                        data.morning.status === 'OPEN'
                                            ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400"
                                            : data.morning.status === 'FULL'
                                                ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400"
                                                : "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400"
                                    )}>
                                        <div className="flex items-center gap-1">
                                            <Sun className="w-2.5 h-2.5" />
                                            <span>AM</span>
                                        </div>
                                        <span>{data.morning.status === 'OPEN' ? data.morning.seats : (data.morning.status === 'FULL' ? '0' : 'X')}</span>
                                    </div>

                                    {/* Evening */}
                                    <div className={cn(
                                        "flex items-center justify-between px-2 py-1 rounded-lg text-[9px] font-black uppercase border",
                                        data.evening.status === 'OPEN'
                                            ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400"
                                            : data.evening.status === 'FULL'
                                                ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400"
                                                : "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400"
                                    )}>
                                        <div className="flex items-center gap-1">
                                            <Moon className="w-2.5 h-2.5" />
                                            <span>PM</span>
                                        </div>
                                        <span>{data.evening.status === 'OPEN' ? data.evening.seats : (data.evening.status === 'FULL' ? '0' : 'X')}</span>
                                    </div>
                                </div>
                            )}

                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02] flex items-center gap-6 justify-center overflow-x-auto shrink-0">
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <div className="size-3 rounded-full bg-green-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Disponibile</span>
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <div className="size-3 rounded-full bg-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Esaurito</span>
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <div className="size-3 rounded-full bg-orange-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Chiuso</span>
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <div className="size-3 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Selezionato</span>
                </div>
            </div>
        </div>
    );
};
