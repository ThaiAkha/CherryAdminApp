import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type UserMode = 'new' | 'existing' | 'agency' | 'internal';
export type PaymentStatus = 'paid' | 'unpaid';

export interface NewUser {
    fullName: string;
    email: string;
    phone: string;
    diet: string;
}

export const useAdminBooking = () => {
    // --- STATE ---
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [session, setSession] = useState<'morning_class' | 'evening_class'>('morning_class');
    const [userMode, setUserMode] = useState<UserMode>('new');
    const [pax, setPax] = useState<number>(1);
    const [loading, setLoading] = useState(false);
    const [availability, setAvailability] = useState<{
        morning: { status: string; booked: number; total: number; bookings: any[] };
        evening: { status: string; booked: number; total: number; bookings: any[] };
    }>({
        morning: { status: 'OPEN', booked: 0, total: 16, bookings: [] },
        evening: { status: 'OPEN', booked: 0, total: 16, bookings: [] }
    });

    const [newUser, setNewUser] = useState<NewUser>({ fullName: '', email: '', phone: '', diet: 'diet_regular' });
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [hotel, setHotel] = useState('');
    const [pickupTime, setPickupTime] = useState('');
    const [notes, setNotes] = useState('');
    const [amount, setAmount] = useState<number>(1200);
    const [status, setStatus] = useState<'confirmed' | 'pending'>('confirmed');
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');

    // --- LOGIC ---

    // Fetch Availability
    const fetchAvailability = useCallback(async () => {
        try {
            const { data: sData } = await supabase.from('class_sessions').select('id, max_capacity');
            const caps: any = {};
            sData?.forEach((s: any) => caps[s.id] = s.max_capacity || 16);

            const { data: bData } = await supabase
                .from('bookings')
                .select('session_id, pax_count, guest_name')
                .eq('booking_date', date)
                .neq('status', 'cancelled');

            const { data: oData } = await supabase
                .from('class_calendar_overrides')
                .select('*')
                .eq('date', date);

            const getInfo = (sid: string) => {
                const override = oData?.find((o: any) => o.session_id === sid);
                const sessionBookings = bData?.filter((b: any) => b.session_id === sid) || [];
                const booked = sessionBookings.reduce((sum: number, b: any) => sum + (b.pax_count || 0), 0) || 0;
                const total = override?.custom_capacity ?? caps[sid] ?? 16;
                const closed = override?.is_closed;

                let status = 'OPEN';
                if (closed) status = 'CLOSED';
                else if (booked >= total) status = 'FULL';

                return { booked, total, status, bookings: sessionBookings };
            };

            setAvailability({
                morning: getInfo('morning_class'),
                evening: getInfo('evening_class')
            });
        } catch (e) {
            console.error("Availability error:", e);
        }
    }, [date]);

    useEffect(() => {
        fetchAvailability();
    }, [fetchAvailability]);

    // Search Users
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchTerm.length > 2 && userMode === 'existing') {
                const { data } = await supabase.from('profiles')
                    .select('id, full_name, email')
                    .ilike('full_name', `%${searchTerm}%`)
                    .limit(5);
                setSearchResults(data || []);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, userMode]);

    // Auto-calc amount
    useEffect(() => {
        setAmount(pax * 1200);
    }, [pax]);

    // Default pickup time
    useEffect(() => {
        if (!pickupTime || (pickupTime === '08:30' || pickupTime === '16:30')) {
            setPickupTime(session === 'morning_class' ? '08:30' : '16:30');
        }
    }, [session]);

    const handleCreate = async () => {
        if (!date || !session) return alert("Missing Date/Session");
        if (userMode === 'new' && !newUser.fullName) return alert("Guest Name Required");
        if (userMode === 'existing' && !selectedUser) return alert("Select a User");

        setLoading(true);
        try {
            let userId = selectedUser?.id;

            if (userMode === 'new') {
                const { data: uData, error: uError } = await supabase.functions.invoke('create-guest-user', {
                    body: {
                        email: newUser.email || `guest-${Date.now()}@temp.tak`,
                        full_name: newUser.fullName,
                        password: `Temp${Date.now()}!`
                    }
                });
                if (uError || uData?.error) throw new Error(uError?.message || uData?.error);
                userId = uData.user.id;
                if (userId) {
                    await supabase.from('profiles').update({
                        dietary_profile: newUser.diet,
                        phone_number: newUser.phone
                    }).eq('id', userId);
                }
            }

            const { error: bError } = await supabase.from('bookings').insert({
                user_id: userMode === 'internal' ? null : userId,
                guest_name: userMode === 'new' ? newUser.fullName : (userMode === 'internal' ? 'Internal Booking' : selectedUser?.full_name),
                booking_date: date,
                session_id: session,
                pax_count: pax,
                total_price: amount,
                status: status,
                payment_status: paymentStatus,
                payment_method: userMode === 'agency' ? 'agency_invoice' : (paymentStatus === 'paid' ? 'cash' : 'pay_on_arrival'),
                hotel_name: hotel || 'Internal/Walk-in',
                pickup_zone: '',
                pickup_time: pickupTime,
                customer_note: notes,
                booking_source: userMode === 'internal' ? 'staff_internal' : 'admin_console'
            });

            if (bError) throw bError;

            alert("Booking Created Successfully!");
            // Reset
            setPax(1); setNotes(''); setHotel(''); setSelectedUser(null);
            setNewUser({ fullName: '', email: '', phone: '', diet: 'diet_regular' });
            setSearchTerm('');
            fetchAvailability();
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return {
        date, setDate,
        session, setSession,
        userMode, setUserMode,
        pax, setPax,
        loading,
        availability,
        newUser, setNewUser,
        selectedUser, setSelectedUser,
        searchTerm, setSearchTerm,
        searchResults,
        hotel, setHotel,
        pickupTime, setPickupTime,
        notes, setNotes,
        amount, setAmount,
        status, setStatus,
        paymentStatus, setPaymentStatus,
        handleCreate,
        currentSessionData: session === 'morning_class' ? availability.morning : availability.evening
    };
};
