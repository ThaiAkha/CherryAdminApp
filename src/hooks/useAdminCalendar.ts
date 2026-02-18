import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// --- INTERFACES ---
export interface SessionStatus {
    status: 'OPEN' | 'FULL' | 'CLOSED';
    seats: number;
    capacity: number;
    isLocked?: boolean;
    reason?: string;
    occupiedCount: number;
}

export interface DayData {
    morning_class: SessionStatus;
    evening_class: SessionStatus;
    hasBookings: boolean;
}

export interface BookingMember {
    guest_name: string;
    pax_count: number;
}

export interface EditSessionState {
    isClosed: boolean;
    reason: string;
    seats: number;
    occupied: number;
}

export type BulkSessionType = 'morning_class' | 'evening_class' | 'all';

export const getDateKey = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export const useAdminCalendar = () => {
    const [viewDate, setViewDate] = useState(new Date());
    const [availability, setAvailability] = useState<Record<string, DayData>>({});
    const [loading, setLoading] = useState(true);
    const [dayBookings, setDayBookings] = useState<Record<string, BookingMember[]>>({
        morning_class: [],
        evening_class: []
    });

    const [selectedDate, setSelectedDate] = useState<string | null>(getDateKey(new Date()));
    const [isEditing, setIsEditing] = useState(false);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
    const [bulkSessionType, setBulkSessionType] = useState<BulkSessionType>('all');

    const [editState, setEditState] = useState<Record<string, EditSessionState>>({
        morning_class: { isClosed: false, reason: '', seats: 0, occupied: 0 },
        evening_class: { isClosed: false, reason: '', seats: 0, occupied: 0 }
    });

    const checkLock = (dateStr: string, session: 'morning_class' | 'evening_class'): boolean => {
        const todayStr = getDateKey(new Date());
        if (dateStr < todayStr) return true;
        if (dateStr > todayStr) return false;
        const nowHour = new Date().getHours();
        if (session === 'morning_class') return nowHour >= 10;
        if (session === 'evening_class') return nowHour >= 17;
        return false;
    };

    const fetchAvailability = useCallback(async () => {
        setLoading(true);
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const startDayIndex = firstDayOfMonth.getDay();
        const startGrid = new Date(year, month, 1 - startDayIndex);
        const endGrid = new Date(startGrid);
        endGrid.setDate(startGrid.getDate() + 42);

        const startDateStr = getDateKey(startGrid);
        const endDateStr = getDateKey(endGrid);

        try {
            const { data: sessionsData } = await supabase.from('class_sessions').select('id, max_capacity');
            const baseCaps: Record<string, number> = {};
            sessionsData?.forEach((s: any) => baseCaps[s.id] = s.max_capacity ?? 12);

            const { data: bookings } = await supabase
                .from('bookings')
                .select('booking_date, session_id, pax_count')
                .gte('booking_date', startDateStr)
                .lte('booking_date', endDateStr)
                .neq('status', 'cancelled');

            const { data: overrides } = await supabase
                .from('class_calendar_overrides')
                .select('*')
                .gte('date', startDateStr)
                .lte('date', endDateStr);

            const statusMap: Record<string, DayData> = {};
            const loopDate = new Date(startGrid);

            for (let i = 0; i < 42; i++) {
                const dateStr = getDateKey(loopDate);
                const getStatus = (sessionId: 'morning_class' | 'evening_class'): SessionStatus => {
                    const override = overrides?.find(o => o.date === dateStr && o.session_id === sessionId);
                    const occupied = bookings?.filter(b => b.booking_date === dateStr && b.session_id === sessionId).reduce((sum, b) => sum + (b.pax_count || 0), 0) || 0;
                    if (override?.is_closed) return { status: 'CLOSED', seats: 0, capacity: override.custom_capacity ?? baseCaps[sessionId] ?? 12, isLocked: checkLock(dateStr, sessionId), reason: override.closure_reason, occupiedCount: occupied };
                    const max = override?.custom_capacity ?? baseCaps[sessionId] ?? 12;
                    const remaining = Math.max(0, max - occupied);
                    return { status: remaining > 0 ? 'OPEN' : 'FULL', seats: remaining, capacity: max, isLocked: checkLock(dateStr, sessionId), reason: override?.closure_reason, occupiedCount: occupied };
                };
                const morning = getStatus('morning_class');
                const evening = getStatus('evening_class');
                statusMap[dateStr] = { morning_class: morning, evening_class: evening, hasBookings: morning.occupiedCount > 0 || evening.occupiedCount > 0 };
                loopDate.setDate(loopDate.getDate() + 1);
            }
            setAvailability(statusMap);
            setLoading(false);
        } catch (err) {
            setLoading(false);
        }
    }, [viewDate]);

    const fetchDayBookings = useCallback(async (dateStr: string) => {
        try {
            const { data } = await supabase.from('bookings').select('guest_name, pax_count, session_id').eq('booking_date', dateStr).neq('status', 'cancelled');
            const split: Record<string, BookingMember[]> = { morning_class: [], evening_class: [] };
            data?.forEach((b: any) => { if (split[b.session_id]) split[b.session_id].push({ guest_name: b.guest_name, pax_count: b.pax_count }); });
            setDayBookings(split);
        } catch (err) { }
    }, []);

    useEffect(() => { fetchAvailability(); }, [fetchAvailability]);
    useEffect(() => { if (selectedDate && !isBulkMode) fetchDayBookings(selectedDate); }, [selectedDate, isBulkMode, fetchDayBookings]);

    // Sync edit state
    useEffect(() => {
        if (isBulkMode) {
            setEditState({
                morning_class: { isClosed: false, reason: '', seats: 0, occupied: 0 },
                evening_class: { isClosed: false, reason: '', seats: 0, occupied: 0 }
            });
        } else if (selectedDate && availability[selectedDate]) {
            const data = availability[selectedDate];
            setEditState({
                morning_class: { isClosed: data.morning_class.status === 'CLOSED', reason: data.morning_class.reason || '', seats: data.morning_class.seats, occupied: data.morning_class.capacity - data.morning_class.seats },
                evening_class: { isClosed: data.evening_class.status === 'CLOSED', reason: data.evening_class.reason || '', seats: data.evening_class.seats, occupied: data.evening_class.capacity - data.evening_class.seats }
            });
        }
    }, [selectedDate, availability, isBulkMode]);

    useEffect(() => { setIsEditing(false); setSelectedDates(new Set()); }, [isBulkMode]);

    const handleDateClick = (date: Date) => {
        const dateStr = getDateKey(date);
        if (isBulkMode) {
            if (availability[dateStr]?.hasBookings) return;
            setSelectedDates(prev => {
                const next = new Set(prev);
                if (next.has(dateStr)) next.delete(dateStr);
                else next.add(dateStr);
                return next;
            });
        } else {
            setSelectedDate(dateStr);
        }
    };

    const handleSaveBatch = async () => {
        const datesToUpdate = isBulkMode ? Array.from(selectedDates) : (selectedDate ? [selectedDate] : []);
        if (datesToUpdate.length === 0) return;

        const payloads: any[] = [];
        const sessionsToApply = isBulkMode ? (bulkSessionType === 'all' ? ['morning_class', 'evening_class'] : [bulkSessionType]) : ['morning_class', 'evening_class'];

        datesToUpdate.forEach(d => {
            sessionsToApply.forEach(s => {
                const edit = editState[bulkSessionType === 'all' && isBulkMode ? 'morning_class' : s];
                let finalCapacity: number | null = null;

                if (!edit.isClosed) {
                    if (isBulkMode) {
                        const currentCap = availability[d]?.[s as keyof DayData] as SessionStatus;
                        finalCapacity = (currentCap?.capacity ?? 12) + edit.seats;
                    } else {
                        finalCapacity = edit.seats + edit.occupied;
                    }
                }

                payloads.push({
                    date: d,
                    session_id: s,
                    is_closed: edit.isClosed,
                    closure_reason: edit.isClosed ? edit.reason : null,
                    custom_capacity: edit.isClosed ? null : finalCapacity,
                });
            });
        });

        const { error } = await supabase.from("class_calendar_overrides").upsert(payloads, { onConflict: "date,session_id" });
        if (!error) {
            await fetchAvailability();
            setIsEditing(false);
            if (isBulkMode) { setIsBulkMode(false); setSelectedDates(new Set()); }
        }
    };

    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const startDayIndex = firstDayOfMonth.getDay();
        const currentLoop = new Date(year, month, 1 - startDayIndex);
        const days = [];
        for (let i = 0; i < 42; i++) { days.push(new Date(currentLoop)); currentLoop.setDate(currentLoop.getDate() + 1); }
        return days;
    }, [viewDate]);

    const handlePrev = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const handleNext = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    const updateEditState = (sessionId: string, field: keyof EditSessionState, value: any) => {
        setEditState(prev => ({ ...prev, [sessionId]: { ...prev[sessionId], [field]: value } }));
    };

    return {
        viewDate, setViewDate,
        availability,
        loading,
        dayBookings,
        selectedDate, setSelectedDate,
        isEditing, setIsEditing,
        isBulkMode, setIsBulkMode,
        selectedDates,
        bulkSessionType, setBulkSessionType,
        editState,
        handleDateClick,
        handleSaveBatch,
        calendarDays,
        handlePrev,
        handleNext,
        updateEditState
    };
};
