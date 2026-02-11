import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Modal } from '../components/ui/modal';
import Button from '../components/ui/button/Button';
import { cn } from '../lib/utils';
import {
    ChevronLeft, ChevronRight, Sun, Moon, Lock, AlertTriangle
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';

// --- INTERFACES ---
interface SessionStatus {
    status: 'OPEN' | 'FULL' | 'CLOSED';
    seats: number;
    capacity?: number;
    isLocked?: boolean;
}

interface DayData {
    morning: SessionStatus;
    evening: SessionStatus;
}

const DAYS_HEADER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ✅ HELPER SICURO PER LE DATE (YYYY-MM-DD)
const getDateKey = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const Calendar: React.FC = () => {
    const [viewDate, setViewDate] = useState(new Date());
    const [availability, setAvailability] = useState<Record<string, DayData>>({});
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editSession, setEditSession] = useState<'morning_class' | 'evening_class'>('morning_class');
    const [isClosed, setIsClosed] = useState(false);
    const [reason, setReason] = useState('');
    const [capacity, setCapacity] = useState<number>(12);

    // --- LOGICA TIME-LOCKING 🔒 ---
    const checkLock = (dateStr: string, session: 'morning_class' | 'evening_class'): boolean => {
        const todayStr = getDateKey(new Date());
        if (dateStr < todayStr) return true; // Past dates locked
        if (dateStr > todayStr) return false; // Future dates open

        const nowHour = new Date().getHours();
        if (session === 'morning_class') return nowHour >= 10;
        if (session === 'evening_class') return nowHour >= 17;
        return false;
    };

    // --- DATA FETCHING ---
    const fetchAvailability = async () => {
        setLoading(true);

        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        // Fetch 6 weeks to cover grid
        const firstDayOfMonth = new Date(year, month, 1);
        const startDayIndex = firstDayOfMonth.getDay();
        const startGrid = new Date(year, month, 1 - startDayIndex);
        const endGrid = new Date(startGrid);
        endGrid.setDate(startGrid.getDate() + 42);

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

                const getStatus = (sessionId: 'morning_class' | 'evening_class'): SessionStatus => {
                    const override = overrides?.find(o => o.date === dateStr && o.session_id === sessionId);

                    if (override?.is_closed) return { status: 'CLOSED', seats: 0, capacity: 0, isLocked: checkLock(dateStr, sessionId) };

                    const max = override?.custom_capacity ?? baseCaps[sessionId] ?? 12;
                    const occupied = bookings
                        ?.filter(b => b.booking_date === dateStr && b.session_id === sessionId)
                        .reduce((sum, b) => sum + (b.pax_count || 0), 0) || 0;

                    const remaining = Math.max(0, max - occupied);

                    return {
                        status: remaining > 0 ? 'OPEN' : 'FULL',
                        seats: remaining,
                        capacity: max,
                        isLocked: checkLock(dateStr, sessionId)
                    };
                };

                statusMap[dateStr] = {
                    morning: getStatus('morning_class'),
                    evening: getStatus('evening_class')
                };

                loopDate.setDate(loopDate.getDate() + 1);
            }

            setAvailability(statusMap);
            setLoading(false);
        } catch (err) {
            console.error("Calendar Sync Error:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailability();
    }, [viewDate]);

    // --- SYNC MODAL WITH SELECTION ---
    useEffect(() => {
        if (selectedDate && availability[selectedDate]) {
            const stats = editSession === 'morning_class' ? availability[selectedDate].morning : availability[selectedDate].evening;

            // Find override specifically for this session to get closure reason if any
            // Note: We don't have direct access to 'overrides' array here easily without refetching or modifying state structure.
            // For now, we infer 'CLOSED' status. Ideally we should store overrides in availability or separate state.
            // Let's rely on status 'CLOSED'.

            setIsClosed(stats.status === 'CLOSED');
            // We reset reason because we haven't stored it in the simplified DayData map. 
            // If critical, we should persist overrides map in state. 
            // For now, reason is empty when opening (user sees they are closed).
            setReason('');
            setCapacity(stats.capacity || 12);
        }
    }, [selectedDate, editSession, availability]);

    // --- ACTIONS ---
    const handleDateClick = (date: Date) => {
        const dateStr = getDateKey(date);
        setSelectedDate(dateStr);
        setIsModalOpen(true);
    };

    const handleSaveOverride = async () => {
        if (!selectedDate) return;
        const payload = {
            date: selectedDate,
            session_id: editSession,
            is_closed: isClosed,
            closure_reason: isClosed ? reason : null,
            custom_capacity: isClosed ? null : capacity,
        };
        await supabase.from("class_calendar_overrides").upsert(payload, { onConflict: "date,session_id" });
        await fetchAvailability();
        closeModal();
    };

    const handleQuickClose = async () => {
        if (!selectedDate) return;
        if (!window.confirm(`Are you sure you want to CLOSE ALL sessions for ${selectedDate}?`)) return;

        const payloads = [
            { date: selectedDate, session_id: "morning_class", is_closed: true, closure_reason: "Quick Close" },
            { date: selectedDate, session_id: "evening_class", is_closed: true, closure_reason: "Quick Close" },
        ];
        await supabase.from("class_calendar_overrides").upsert(payloads, { onConflict: "date,session_id" });
        await fetchAvailability();
        closeModal();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDate(null);
    };

    // --- GRID ---
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

    // --- NAVIGATION ---
    const handlePrev = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const handleNext = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    return (
        <PageContainer className="h-[calc(100vh-64px)] overflow-hidden">
            <div className="w-full h-full flex flex-col font-sans select-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">

                {/* HEADER */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
                    <div>
                        <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Admin Console</span>
                        <h3 className="text-3xl font-black italic uppercase leading-none mt-2">
                            {MONTHS[viewDate.getMonth()]} <span className="text-brand-600 dark:text-brand-400">{viewDate.getFullYear()}</span>
                        </h3>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={handlePrev} className="size-10 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center transition-all active:scale-95 text-gray-500">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={handleNext} className="size-10 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center transition-all active:scale-95 text-gray-500">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* DAYS HEADER */}
                <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 shrink-0">
                    {DAYS_HEADER.map(d => (
                        <div key={d} className="py-3 text-center">
                            <span className="font-black text-gray-400 uppercase tracking-widest text-[9px]">{d}</span>
                        </div>
                    ))}
                </div>

                {/* GRID */}
                <div className="grid grid-cols-7 grid-rows-6 flex-1 gap-px bg-gray-200 dark:bg-gray-800 overflow-y-auto">
                    {calendarDays.map((date, idx) => {
                        const dateStr = getDateKey(date);
                        const data = availability[dateStr];

                        const isCurrentMonth = date.getMonth() === viewDate.getMonth();
                        const now = new Date(); now.setHours(0, 0, 0, 0);
                        const checkDate = new Date(date); checkDate.setHours(0, 0, 0, 0);
                        const isPast = checkDate.getTime() < now.getTime();
                        const isToday = checkDate.getTime() === now.getTime();

                        // Render empty for non-current month if desired, or lighter. 
                        if (!isCurrentMonth) return <div key={idx} className="bg-gray-50/20 dark:bg-gray-900/20 pointer-events-none" />;

                        return (
                            <div
                                key={dateStr}
                                onClick={() => handleDateClick(date)}
                                className={cn(
                                    "relative flex flex-col justify-between p-2 min-h-[80px] group transition-all text-left bg-white dark:bg-gray-900 cursor-pointer hover:bg-brand-50/50 dark:hover:bg-brand-900/10",
                                    isToday && "ring-2 ring-brand-500 z-10",
                                    isPast && "bg-gray-50 dark:bg-gray-900/80 grayscale"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "text-lg font-black leading-none transition-transform",
                                        isToday ? "text-brand-600 dark:text-brand-400 scale-110" : "text-gray-300 group-hover:text-gray-500 dark:text-gray-600 dark:group-hover:text-gray-400"
                                    )}>
                                        {date.getDate()}
                                    </span>
                                </div>

                                {/* STATS PILLS */}
                                {!loading && data && (
                                    <div className="space-y-1 w-full mt-auto">
                                        {/* Morning */}
                                        <div className={cn("flex items-center justify-between px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border transition-colors",
                                            data.morning.status === 'OPEN' ? "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30" :
                                                data.morning.status === 'FULL' ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30" :
                                                    "bg-gray-50 text-gray-400 border-gray-100 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700",
                                            data.morning.isLocked && "opacity-50"
                                        )}>
                                            <span className="flex gap-1 items-center"><Sun className="w-3 h-3" /> AM {data.morning.isLocked && <Lock className="w-2 h-2" />}</span>
                                            <span>{data.morning.status === 'OPEN' ? data.morning.seats : (data.morning.status === 'CLOSED' ? 'X' : '0')}</span>
                                        </div>

                                        {/* Evening */}
                                        <div className={cn("flex items-center justify-between px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border transition-colors",
                                            data.evening.status === 'OPEN' ? "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/30" :
                                                data.evening.status === 'FULL' ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30" :
                                                    "bg-gray-50 text-gray-400 border-gray-100 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700",
                                            data.evening.isLocked && "opacity-50"
                                        )}>
                                            <span className="flex gap-1 items-center"><Moon className="w-3 h-3" /> PM {data.evening.isLocked && <Lock className="w-2 h-2" />}</span>
                                            <span>{data.evening.status === 'OPEN' ? data.evening.seats : (data.evening.status === 'CLOSED' ? 'X' : '0')}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* MODAL MANAGER */}
                <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-md p-6">
                    <div className="text-center mb-6">
                        <h5 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Manage {selectedDate}</h5>
                        <p className="text-sm text-gray-500">Edit session availability and capacity</p>
                    </div>

                    {/* Session Selector */}
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6">
                        {['morning_class', 'evening_class'].map(s => {
                            const isSessLocked = selectedDate && availability[selectedDate]
                                ? (s === 'morning_class' ? availability[selectedDate].morning.isLocked : availability[selectedDate].evening.isLocked)
                                : false;

                            return (
                                <button
                                    key={s}
                                    onClick={() => setEditSession(s as any)}
                                    className={cn(
                                        "flex-1 py-2 rounded-md text-sm font-medium transition-all",
                                        editSession === s ? "bg-white dark:bg-gray-700 shadow-sm text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700",
                                    )}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {s === 'morning_class' ? 'Morning' : 'Evening'}
                                        {isSessLocked && <Lock className="w-3 h-3" />}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Edit Form */}
                    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Force Close Session?</span>
                            <input type="checkbox" checked={isClosed} onChange={(e) => setIsClosed(e.target.checked)} className="size-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                        </div>

                        {isClosed ? (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reason</label>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-brand-500 focus:border-brand-500 p-2 text-sm"
                                    placeholder="e.g. Maintenance"
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <span className="block text-xs font-bold text-gray-500 uppercase">Total Capacity</span>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setCapacity(Math.max(0, capacity - 1))} className="size-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 transition-colors">-</button>
                                    <span className="text-xl font-bold w-12 text-center text-gray-900 dark:text-white">{capacity}</span>
                                    <button onClick={() => setCapacity(capacity + 1)} className="size-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 transition-colors">+</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Button variant="primary" size="md" className="w-full" onClick={handleSaveOverride}>Save Changes</Button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold">Danger Zone</span>
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            <button
                                onClick={handleQuickClose}
                                className="w-full py-3 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Close Entire Day
                            </button>
                        </div>
                    </div>
                </Modal>

            </div>
        </PageContainer>
    );
};

export default Calendar;
