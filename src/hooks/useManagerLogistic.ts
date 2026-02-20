import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { usePageHeader } from '../context/PageHeaderContext';
import { contentService } from '../services/content.service';
import { SessionType } from '../components/common/ClassPicker';

// --- TYPES ---
export interface LogisticsItem {
    id: string;
    guest_name: string;
    pax: number;
    hotel_name: string;
    pickup_time: string;
    pickup_zone: string;
    route_order: number;
    avatar_url?: string;
    pickup_driver_uid: string | null;
    has_missing_info: boolean;
    customer_note?: string;
    agency_note?: string;
    phone_number?: string;
    session_id: string;
    booking_date: string;
    transport_status: string;
}

export interface DriverProfile {
    id: string;
    full_name: string;
    avatar_url?: string;
}

export interface SessionSummary {
    date: string;
    session_id: string;
    unassigned_count: number;
}

export function useManagerLogistic() {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [items, setItems] = useState<LogisticsItem[]>([]);
    const [drivers, setDrivers] = useState<DriverProfile[]>([]);
    const [upcomingSessions, setUpcomingSessions] = useState<SessionSummary[]>([]);

    // Selection State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSessionId, setSelectedSessionId] = useState<SessionType>('morning_class');
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

    const { setPageHeader } = usePageHeader();

    useEffect(() => {
        const loadMetadata = async () => {
            const meta = await contentService.getPageMetadata('manager-logistics');
            if (meta) {
                setPageHeader(meta.titleMain || 'Manager Logistics', meta.description || '');
            } else {
                setPageHeader('Manager Logistics', 'Coordinate drivers, pickups, and route assignments.');
            }
        };
        loadMetadata();
    }, [setPageHeader]);

    // --- DATA FETCHING ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // A. Fetch Next 10 Sessions
            const today = new Date().toISOString().split('T')[0];
            const { data: upcomingData } = await supabase
                .from('bookings')
                .select('booking_date, session_id, pickup_driver_uid')
                .gte('booking_date', today)
                .neq('status', 'cancelled')
                .order('booking_date', { ascending: true });

            if (upcomingData) {
                const summaries: Record<string, SessionSummary> = {};
                upcomingData.forEach(b => {
                    const key = `${b.booking_date}_${b.session_id}`;
                    if (!summaries[key]) {
                        summaries[key] = { date: b.booking_date, session_id: b.session_id, unassigned_count: 0 };
                    }
                    if (!b.pickup_driver_uid) summaries[key].unassigned_count++;
                });
                setUpcomingSessions(Object.values(summaries).slice(0, 10));
            }

            // B. Fetch Drivers
            const { data: driverData } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .eq('role', 'driver')
                .order('full_name');
            setDrivers(driverData || []);

            // C. Fetch Selected Session Items
            const { data: bookingData } = await supabase
                .from('bookings')
                .select(`
                    internal_id, pax_count, hotel_name, pickup_zone, pickup_time, route_order,
                    customer_note, agency_note, pickup_driver_uid, phone_number, session_id,
                    booking_date, transport_status, guest_name, guest_email,
                    profiles:user_id(full_name, avatar_url)
                `)
                .eq('booking_date', selectedDate)
                .eq('session_id', selectedSessionId)
                .neq('status', 'cancelled')
                .order('route_order', { ascending: true });

            if (bookingData) {
                setItems(bookingData.map((b: any) => ({
                    id: b.internal_id,
                    guest_name: b.guest_name || b.profiles?.full_name || 'Guest',
                    pax: b.pax_count,
                    hotel_name: b.hotel_name || 'To be selected',
                    pickup_time: b.pickup_time || '--:--',
                    pickup_zone: b.pickup_zone || 'pending',
                    route_order: b.route_order || 0,
                    avatar_url: b.profiles?.avatar_url,
                    pickup_driver_uid: b.pickup_driver_uid,
                    has_missing_info: !b.hotel_name || b.hotel_name === 'To be selected',
                    customer_note: b.customer_note,
                    agency_note: b.agency_note,
                    phone_number: b.phone_number,
                    session_id: b.session_id,
                    booking_date: b.booking_date,
                    transport_status: b.transport_status
                })));
            }
        } finally {
            setLoading(false);
        }
    }, [selectedDate, selectedSessionId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- ACTIONS ---
    const handleAssign = useCallback(async (bookingId: string, driverId: string | null) => {
        const { error } = await supabase
            .from('bookings')
            .update({ pickup_driver_uid: driverId, route_order: 99 })
            .eq('internal_id', bookingId);

        if (!error) fetchData();
    }, [fetchData]);

    const handleUpdateBooking = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBookingId) return;
        setIsSaving(true);

        const item = items.find(i => i.id === selectedBookingId);
        if (!item) { setIsSaving(false); return; }

        const { error } = await supabase
            .from('bookings')
            .update({
                hotel_name: item.hotel_name,
                pickup_time: item.pickup_time,
                customer_note: item.customer_note,
                agency_note: item.agency_note,
                phone_number: item.phone_number
            })
            .eq('internal_id', selectedBookingId);

        if (!error) {
            alert("Changes saved kha!");
            fetchData();
        }
        setIsSaving(false);
    }, [selectedBookingId, items, fetchData]);

    const updateLocalItem = useCallback((id: string, updates: Partial<LogisticsItem>) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    }, []);

    const closeInspector = useCallback(() => {
        setSelectedBookingId(null);
    }, []);

    // --- COMPUTED ---
    const unassignedItems = useMemo(() => items.filter(i => !i.pickup_driver_uid), [items]);
    const selectedBooking = useMemo(() => items.find(i => i.id === selectedBookingId) || null, [items, selectedBookingId]);

    return {
        // Data
        items,
        drivers,
        upcomingSessions,
        unassignedItems,
        selectedBooking,

        // State
        loading,
        isSaving,
        selectedDate,
        selectedSessionId,
        selectedBookingId,

        // Setters
        setSelectedDate,
        setSelectedSessionId,
        setSelectedBookingId,

        // Actions
        fetchData,
        handleAssign,
        handleUpdateBooking,
        updateLocalItem,
        closeInspector,
    };
}
