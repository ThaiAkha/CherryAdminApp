import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { usePageHeader } from '../context/PageHeaderContext';
import { contentService } from '../services/content.service';
import { SessionType } from '../components/common/ClassPicker';

export function useManagerKitchen() {
    const [globalDate, setGlobalDate] = useState(new Date().toISOString().split('T')[0]);
    const [globalSession, setGlobalSession] = useState<SessionType>('all');
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [bookings, setBookings] = useState<any[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    const { setPageHeader } = usePageHeader();

    useEffect(() => {
        const loadMetadata = async () => {
            const meta = await contentService.getPageMetadata('manager-kitchen');
            if (meta) {
                setPageHeader(meta.titleMain || 'Manager Kitchen', meta.description || '');
            } else {
                setPageHeader('Manager Kitchen', 'Manage daily cooking classes and prep lists.');
            }
        };
        loadMetadata();
    }, [setPageHeader]);

    // --- FETCH DATA ---
    const fetchTableData = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('bookings')
                .select(`
                    internal_id, pax_count, status, session_id, booking_date, pickup_time, customer_note,
                    hotel_name, pickup_zone, phone_number, agency_note, user_id, guest_name, guest_email,
                    profiles:user_id(full_name, email, dietary_profile, allergies),
                    menu_selections(curry:curry_id(name), soup:soup_id(name), stirfry:stirfry_id(name))
                `)
                .eq('booking_date', globalDate)
                .neq('status', 'cancelled')
                .order('pickup_time', { ascending: true });

            if (globalSession !== 'all') {
                query = query.eq('session_id', globalSession);
            }

            const { data, error } = await query;
            if (error) throw error;

            setBookings(data || []);

            if (selectedBooking) {
                const updated = data?.find((b: any) => b.internal_id === selectedBooking.internal_id);
                if (updated) setSelectedBooking(updated);
            }
        } catch (e) {
            console.error("Fetch Error:", e);
        } finally {
            setLoading(false);
        }
    }, [globalDate, globalSession, selectedBooking]);

    useEffect(() => {
        fetchTableData();
    }, [globalDate, globalSession]);

    // --- ACTIONS ---
    const handleSelectBooking = useCallback((booking: any) => {
        if (selectedBooking?.internal_id === booking.internal_id) {
            setSelectedBooking(null);
            setIsEditing(false);
        } else {
            setSelectedBooking(booking);
            setIsEditing(false);
        }
    }, [selectedBooking]);

    const handleEditStart = useCallback(() => {
        if (!selectedBooking) return;
        setIsEditing(true);
        setEditData({
            full_name: selectedBooking.profiles?.full_name || '',
            dietary_profile: selectedBooking.profiles?.dietary_profile || 'diet_regular',
            allergies: Array.isArray(selectedBooking.profiles?.allergies)
                ? selectedBooking.profiles.allergies.join(', ')
                : (typeof selectedBooking.profiles?.allergies === 'string' ? selectedBooking.profiles.allergies : ''),
            pax_count: selectedBooking.pax_count,
            customer_note: selectedBooking.customer_note || '',
            hotel_name: selectedBooking.hotel_name || '',
            phone_number: selectedBooking.phone_number || '',
            status: selectedBooking.status
        });
    }, [selectedBooking]);

    const handleSave = useCallback(async () => {
        if (!selectedBooking || !editData) return;
        setIsSaving(true);
        try {
            if (selectedBooking.user_id) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        full_name: editData.full_name,
                        dietary_profile: editData.dietary_profile,
                        allergies: editData.allergies
                            ? editData.allergies.split(',').map((s: string) => s.trim()).filter(Boolean)
                            : []
                    })
                    .eq('id', selectedBooking.user_id);

                if (profileError) throw profileError;
            }

            const { error: bookingError } = await supabase
                .from('bookings')
                .update({
                    pax_count: parseInt(editData.pax_count),
                    customer_note: editData.customer_note,
                    phone_number: editData.phone_number,
                    hotel_name: editData.hotel_name,
                    status: editData.status
                })
                .eq('internal_id', selectedBooking.internal_id);

            if (bookingError) throw bookingError;

            setIsEditing(false);
            fetchTableData();
        } catch (err) {
            console.error("Save Error:", err);
            alert("Save Error: " + (err as any).message);
        } finally {
            setIsSaving(false);
        }
    }, [selectedBooking, editData, fetchTableData]);

    const closeInspector = useCallback(() => {
        setSelectedBooking(null);
        setIsEditing(false);
    }, []);

    // --- COMPUTED ---
    const stats = useMemo(() => {
        const totalPax = bookings.reduce((acc: number, b: any) => acc + (b.pax_count || 0), 0);
        const dietaryCounts: Record<string, number> = {};
        bookings.forEach((b: any) => {
            const diet = (b.profiles?.dietary_profile || 'diet_regular').replace('diet_', '');
            dietaryCounts[diet] = (dietaryCounts[diet] || 0) + 1;
        });
        return { totalPax, totalBookings: bookings.length, dietaryCounts };
    }, [bookings]);

    return {
        // Data
        bookings,
        selectedBooking,
        editData,
        stats,

        // State
        loading,
        isSaving,
        isEditing,
        globalDate,
        globalSession,

        // Setters
        setGlobalDate,
        setGlobalSession,
        setIsEditing,
        setEditData,

        // Actions
        fetchTableData,
        handleSelectBooking,
        handleEditStart,
        handleSave,
        closeInspector,
    };
}
