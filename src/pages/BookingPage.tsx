import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import { authService, UserProfile } from '../services/auth.service';
import { cn } from '../lib/utils';
import {
    Calendar, Users, CalendarDays, ArrowRight, User, CheckCircle2, Building2, Send,
    Plus, Minus, Sun, Moon
} from 'lucide-react';

import PageContainer from '../components/layout/PageContainer';
import Badge from '../components/ui/badge/Badge';
import Button from '../components/ui/button/Button';
import InputField from '../components/form/input/InputField';
import TextArea from '../components/form/input/TextArea';
import { Modal } from '../components/ui/modal';
import { CalendarView } from '../components/booking/CalendarView';
import Switch from '../components/form/switch/Switch';

interface HotelLocation {
    id: string;
    name: string;
    zone_id: string;
}

// --- CONFIGURATION ---
const COUNTRY_PREFIXES = [
    { code: '+66', label: '🇹🇭 TH (+66)' },
    { code: '+1', label: '🇺🇸 US (+1)' },
    { code: '+44', label: '🇬🇧 UK (+44)' },
    { code: '+33', label: '🇫🇷 FR (+33)' },
    { code: '+39', label: '🇮🇹 IT (+39)' },
    { code: '+49', label: '🇩🇪 DE (+49)' },
    { code: '+86', label: '🇨🇳 CN (+86)' },
    { code: '+61', label: '🇦🇺 AU (+61)' },
    { code: '+65', label: '🇸🇬 SG (+65)' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SESSION_INFO = {
    morning_class: { label: "Morning Market Tour", basePrice: 1400, icon: <Sun className="w-5 h-5" />, color: "text-orange-500", time: "09:00 - 14:30" },
    evening_class: { label: "Evening Sunset Feast", basePrice: 1300, icon: <Moon className="w-5 h-5" />, color: "text-indigo-500", time: "17:00 - 21:00" }
};

interface SessionStatus {
    status: 'OPEN' | 'FULL' | 'CLOSED';
    remaining: number;
    reason?: string;
}

interface DailyAvailability {
    morning_class: SessionStatus;
    evening_class: SessionStatus;
}

const BookingPage: React.FC = () => {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // --- 1. SESSION DETECTION ---
    useEffect(() => {
        const fetchUser = async () => {
            const profile = await authService.getCurrentUserProfile();
            setUserProfile(profile);
            setLoading(false);
        };
        fetchUser();
    }, []);

    const isAgency = userProfile?.role === 'agency';
    const isElevated = userProfile?.role === 'admin' || userProfile?.role === 'manager';
    const showB2BOptions = isAgency || isElevated;

    const commissionRate = isAgency ? (userProfile?.agency_commission_rate || 0) : 0;

    // --- STATE: FLOW ---
    const [viewStep, setViewStep] = useState<'selection' | 'auth' | 'form'>('selection');
    const [authMode, setAuthMode] = useState<'guest' | 'login'>('guest');
    const [showCalendarModal, setShowCalendarModal] = useState(false);

    // --- STATE: DATA ---
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [session, setSession] = useState<'morning_class' | 'evening_class' | null>(null);
    const [pax, setPax] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Availability State
    const [dailyStats, setDailyStats] = useState<DailyAvailability>({
        morning_class: { status: 'OPEN', remaining: 0 },
        evening_class: { status: 'OPEN', remaining: 0 }
    });

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState<'arrival' | 'card' | 'agency'>('arrival');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        guestName: '',
        guestEmail: '',
        password: '',
        phonePrefix: '+66',
        phoneNumber: '',
        customerNote: '',
        agencyNote: '',
        hotelName: '',
        pickupZone: 'outside'
    });

    const [createAccountToggle, setCreateAccountToggle] = useState(false);
    const [hotelLocations, setHotelLocations] = useState<HotelLocation[]>([]);

    // --- UPDATE FORM WHEN USER PROFILE IS LOADED ---
    useEffect(() => {
        if (userProfile && !showB2BOptions) {
            setFormData(prev => ({
                ...prev,
                fullName: userProfile.full_name,
                email: userProfile.email
            }));
            if (viewStep === 'auth') setViewStep('form');
        }
        if (isAgency) setPaymentMethod('agency');
    }, [userProfile, isAgency, showB2BOptions, viewStep]);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const { data, error } = await supabase
                    .from('hotel_locations')
                    .select('id, name, zone_id')
                    .eq('is_active', true)
                    .order('name');
                if (error) throw error;
                setHotelLocations(data || []);
            } catch (err) {
                console.error("Error fetching hotels:", err);
            }
        };
        if (showB2BOptions) fetchHotels();
    }, [showB2BOptions]);

    // CALCOLO PREZZI DINAMICO
    const currentBasePrice = session ? SESSION_INFO[session].basePrice : 0;
    const totalGross = currentBasePrice * pax;
    const discountAmount = Math.round((totalGross * commissionRate) / 100);
    const finalPrice = totalGross - discountAmount;

    // 2. DATE SCROLLER OPTIONS
    const dateOptions = useMemo(() => {
        const dates = [];
        const baseDate = new Date(selectedDate);
        baseDate.setHours(12, 0, 0, 0);
        for (let i = -2; i <= 2; i++) {
            const d = new Date(baseDate);
            d.setDate(baseDate.getDate() + i);
            dates.push(d);
        }
        return dates;
    }, [selectedDate]);

    // 3. AVAILABILITY ENGINE
    useEffect(() => {
        const fetchDailyStats = async () => {
            const offset = selectedDate.getTimezoneOffset() * 60000;
            const localDate = new Date(selectedDate.getTime() - offset);
            const dateStr = localDate.toISOString().split('T')[0];

            try {
                const { data: sessionsData } = await supabase.from('class_sessions').select('id, max_capacity');
                const baseCaps: Record<string, number> = {};
                sessionsData?.forEach((s: any) => baseCaps[s.id] = s.max_capacity);

                const { data: overrides } = await supabase.from('class_calendar_overrides').select('*').eq('date', dateStr);
                const { data: bookings } = await supabase.from('bookings').select('session_id, pax_count').eq('booking_date', dateStr).neq('status', 'cancelled');

                const calculateStatus = (sessionId: string): SessionStatus => {
                    const override = overrides?.find((o: any) => o.session_id === sessionId);
                    if (override?.is_closed) return { status: 'CLOSED', remaining: 0, reason: override.closure_reason || 'Closed' };

                    const max = override?.custom_capacity ?? baseCaps[sessionId] ?? 0;
                    const occupied = bookings?.filter((b: any) => b.session_id === sessionId).reduce((sum: number, b: any) => sum + b.pax_count, 0) || 0;
                    const remaining = Math.max(0, max - occupied);

                    return {
                        status: remaining > 0 ? 'OPEN' : 'FULL',
                        remaining,
                        reason: remaining === 0 ? 'Fully Booked' : undefined
                    };
                };

                setDailyStats({
                    morning_class: calculateStatus('morning_class'),
                    evening_class: calculateStatus('evening_class')
                });
            } catch (err) {
                console.error("Availability Fetch Error:", err);
            }
        };
        fetchDailyStats();
    }, [selectedDate]);

    const handleSessionSelect = (s: 'morning_class' | 'evening_class') => {
        if (pax === 0) { alert("Please add participants first kha!"); return; }
        const stats = dailyStats[s];
        if (stats.status !== 'OPEN' || stats.remaining < pax) return;
        setSession(s);
    };

    const handleConfirmSelection = () => {
        if (!session || pax === 0) return;
        if (userProfile) setViewStep('form');
        else setViewStep('auth');
    };

    const handleSubmit = async () => {
        if (!session) return;
        setIsSubmitting(true);

        try {
            let userId = userProfile?.id;
            let guestUserId = null;

            // --- ⚡ B2B FLOW (Agency or Admin) ---
            if (showB2BOptions && createAccountToggle) {
                const { data, error: functionError } = await supabase.functions.invoke('create-guest-user', {
                    body: {
                        email: formData.guestEmail || formData.email,
                        password: formData.password,
                        name: formData.guestName || formData.fullName,
                        phone: formData.phonePrefix + formData.phoneNumber
                    }
                });

                if (functionError || data.error) {
                    throw new Error(functionError?.message || data.error || "Client account creation failed.");
                }
                guestUserId = data.userId;
            }

            // --- AUTH FOR STANDARD USERS (If not logged in) ---
            if (!userId && !showB2BOptions) {
                let authResponse;
                if (authMode === 'login') {
                    authResponse = await authService.signIn(formData.email, formData.password);
                    if (!authResponse?.user) throw new Error("Authentication failed.");
                    userId = authResponse.user.id;
                } else {
                    authResponse = await authService.signUp(formData.email, formData.password, formData.fullName);
                    if (!authResponse?.user) throw new Error("Authentication failed.");
                    userId = authResponse.user.id;
                }
            }

            const finalCustomerNote = isAgency
                ? `AGENCY REF: ${formData.customerNote}`
                : formData.customerNote;

            const offset = selectedDate.getTimezoneOffset() * 60000;
            const localDate = new Date(selectedDate.getTime() - offset);
            const dateStr = localDate.toISOString().split('T')[0];

            const payload = {
                user_id: userId, // Booker ID (Agency/Admin/Standard)
                guest_user_id: guestUserId, // If created via B2B option
                guest_name: showB2BOptions ? (formData.guestName || formData.fullName) : formData.fullName,
                guest_email: showB2BOptions ? (formData.guestEmail || formData.email) : formData.email,
                session_id: session,
                booking_date: dateStr,
                pax_count: pax,
                total_price: finalPrice,
                commission_amount: isAgency ? discountAmount : 0,
                applied_commission_rate: commissionRate,
                payment_method: isAgency ? 'agency_invoice' : (paymentMethod === 'card' ? 'credit_card' : 'pay_on_arrival'),
                payment_status: isAgency ? 'pending_invoice' : 'pending',
                status: 'confirmed',
                phone_prefix: formData.phonePrefix,
                phone_number: formData.phoneNumber,
                customer_note: finalCustomerNote,
                agency_note: isAgency ? formData.agencyNote : '',
                hotel_name: showB2BOptions ? (formData.hotelName || 'Pickup Requested') : 'To be selected',
                pickup_zone: showB2BOptions ? formData.pickupZone : 'walk-in'
            };

            const { error: bookingError } = await supabase.from('bookings').insert(payload);
            if (bookingError) throw bookingError;

            // REDIRECT BASED ON ROLE
            if (userProfile?.role === 'admin' || userProfile?.role === 'manager') {
                navigate('/booking-overview');
            } else if (isAgency) {
                navigate('/agency-dashboard');
            } else {
                navigate('/');
            }

        } catch (err: any) {
            alert("Booking Error: " + (err.message || "Unknown error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    const formattedDateStr = `${DAYS[selectedDate.getDay()]}, ${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]}`;

    return (
        <PageContainer className="pb-32">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* HEADER */}
                <div className="flex flex-col gap-1 items-center text-center">
                    <h5 className="text-gray-400 uppercase tracking-widest text-[10px] font-black">Experience Thai Akha</h5>
                    <h2 className="text-3xl font-black uppercase text-gray-900 dark:text-white italic">
                        {viewStep === 'selection' ? 'Booking Selection' : 'Finalize Reservation'}
                    </h2>
                </div>

                {/* STEP 1: SELECTION */}
                {viewStep === 'selection' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* CALENDAR BAR */}
                        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <button
                                onClick={() => setShowCalendarModal(true)}
                                className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors text-left"
                            >
                                <CalendarDays className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{formattedDateStr}</span>
                                    <span className="text-[10px] text-gray-400 uppercase font-black">Change Date</span>
                                </div>
                            </button>
                            <Button variant="outline" size="sm" onClick={() => setShowCalendarModal(true)} className="h-12 px-6 rounded-xl shrink-0">Month View</Button>
                        </div>

                        {/* DATE SCROLLER */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                            {dateOptions.map((d, i) => {
                                const isSelected = d.toDateString() === selectedDate.toDateString();
                                const isToday = d.toDateString() === new Date().toDateString();
                                return (
                                    <button
                                        key={i}
                                        onClick={() => { setSelectedDate(d); setSession(null); }}
                                        className={cn(
                                            "flex-1 min-w-[80px] flex flex-col items-center justify-center py-4 rounded-2xl border transition-all duration-300",
                                            isSelected
                                                ? "bg-brand-600 border-brand-600 text-white shadow-brand-glow scale-105 z-10"
                                                : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 hover:border-gray-300"
                                        )}
                                    >
                                        <span className={cn("text-[9px] font-black uppercase tracking-wider mb-1", isSelected ? "text-white/80" : "text-gray-400")}>{DAYS[d.getDay()]}</span>
                                        <span className="text-xl font-black">{d.getDate()}</span>
                                        {isToday && <span className="text-[8px] font-bold uppercase mt-1 opacity-60">Today</span>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* PAX COUNTER */}
                        <div className="flex justify-center py-4">
                            <div className={cn(
                                "flex items-center gap-8 bg-white dark:bg-gray-800 border px-10 py-4 rounded-3xl transition-all shadow-sm",
                                pax > 0 ? "border-brand-500/30 ring-4 ring-brand-500/5" : "border-gray-100 dark:border-gray-700"
                            )}>
                                <div className="flex items-center gap-3 border-r border-gray-100 dark:border-gray-700 pr-8">
                                    <Users className={cn("w-5 h-5", pax > 0 ? "text-brand-600" : "text-gray-300")} />
                                    <span className={cn("text-xs font-black uppercase tracking-widest", pax > 0 ? "text-gray-900 dark:text-white" : "text-gray-300")}>People</span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => { setPax(Math.max(0, pax - 1)); setSession(null); }}
                                        disabled={pax === 0}
                                        className="size-10 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 disabled:opacity-30 transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="text-3xl font-black text-gray-900 dark:text-white min-w-[2rem] text-center">{pax}</span>
                                    <button
                                        onClick={() => { setPax(Math.min(99, pax + 1)); setSession(null); }}
                                        className="size-10 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* SESSION CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(['morning_class', 'evening_class'] as const).map((s) => {
                                const info = SESSION_INFO[s];
                                const stats = dailyStats[s];
                                const active = session === s;
                                const disabled = pax === 0 || stats.status !== 'OPEN' || stats.remaining < pax;
                                const displayPrice = isAgency ? Math.round(info.basePrice * (1 - commissionRate / 100)) : info.basePrice;

                                return (
                                    <div
                                        key={s}
                                        onClick={() => handleSessionSelect(s)}
                                        className={cn(
                                            "relative p-6 rounded-[2.5rem] cursor-pointer transition-all border-2 flex flex-col justify-between min-h-[240px]",
                                            disabled
                                                ? "opacity-40 grayscale cursor-not-allowed border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50"
                                                : active
                                                    ? "bg-brand-50/50 dark:bg-brand-500/5 border-brand-500 shadow-brand-glow scale-[1.02] z-10"
                                                    : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300 hover:-translate-y-1 shadow-sm"
                                        )}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <h4 className="text-xl font-black uppercase text-gray-900 dark:text-white italic leading-tight">{info.label}</h4>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{info.time}</p>
                                            </div>
                                            <div className={cn("p-3 rounded-2xl bg-gray-50 dark:bg-gray-900", active ? "text-brand-600" : info.color)}>
                                                {info.icon}
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-end">
                                            <div>
                                                <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Price Per Pax</div>
                                                <div className="text-2xl font-black text-gray-900 dark:text-white">
                                                    {displayPrice.toLocaleString()} <span className="text-xs font-normal text-gray-400">THB</span>
                                                </div>
                                                {isAgency && <Badge variant="light" color="success" size="sm" className="mt-1">Partner Net (-{commissionRate}%)</Badge>}
                                            </div>
                                            <div className="text-right">
                                                <Badge
                                                    variant="solid"
                                                    color={stats.status === 'OPEN' ? 'success' : 'error'}
                                                    size="sm"
                                                >
                                                    {stats.status === 'OPEN' ? `${stats.remaining} Left` : 'Full'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* CONTINUE BAR (Fixed Mobile, Relative Desktop) */}
                        {session && pax > 0 && (
                            <div className="fixed bottom-6 left-6 right-6 md:relative md:bottom-0 md:left-0 md:right-0 z-40 animate-in slide-in-from-bottom-8 duration-500">
                                <div className="bg-white dark:bg-gray-800 border border-brand-500/20 rounded-3xl p-6 shadow-2xl flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Bill</p>
                                        <h3 className="text-3xl font-black text-brand-600 dark:text-brand-400 italic">
                                            {finalPrice.toLocaleString()} <span className="text-sm font-normal text-gray-400 not-italic">THB</span>
                                        </h3>
                                    </div>
                                    <Button
                                        onClick={handleConfirmSelection}
                                        className="h-14 px-10 rounded-2xl shadow-brand-glow text-lg uppercase font-black italic"
                                        endIcon={<ArrowRight className="w-5 h-5" />}
                                    >
                                        Continue
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: FINALIZE */}
                {viewStep !== 'selection' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Header */}
                        <div className="bg-white dark:bg-gray-800 border-l-8 border-brand-500 rounded-3xl p-6 flex items-center justify-between shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600">
                                    {session ? SESSION_INFO[session].icon : <Calendar />}
                                </div>
                                <div>
                                    <h4 className="text-lg font-black uppercase text-gray-900 dark:text-white italic leading-none">{session && SESSION_INFO[session].label}</h4>
                                    <p className="text-sm text-gray-500 mt-1 font-medium">{formattedDateStr} • {pax} People</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setViewStep('selection')} className="rounded-xl">Change</Button>
                        </div>

                        {/* AUTH STEP (Login/Guest) */}
                        {viewStep === 'auth' && !userProfile && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div
                                    onClick={() => { setAuthMode('login'); setViewStep('form'); }}
                                    className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 border-dashed p-8 rounded-3xl hover:border-brand-500 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <User className="w-5 h-5 text-brand-600" />
                                        <span className="font-black uppercase tracking-wider text-gray-900 dark:text-white italic">Existing Account</span>
                                    </div>
                                    <p className="text-xs text-gray-400">Login to use your saved profile and get loyalty benefits.</p>
                                </div>
                                <div
                                    onClick={() => { setAuthMode('guest'); setViewStep('form'); }}
                                    className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-8 rounded-3xl hover:border-brand-500 transition-all cursor-pointer shadow-sm group"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <Plus className="w-5 h-5 text-gray-900 dark:text-white" />
                                        <span className="font-black uppercase tracking-wider text-gray-900 dark:text-white italic">Book as Guest</span>
                                    </div>
                                    <p className="text-xs text-gray-400">Quick booking without creating an account first.</p>
                                </div>
                            </div>
                        )}

                        {/* FORM STEP */}
                        {viewStep === 'form' && (
                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-8">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-black uppercase text-gray-900 dark:text-white italic">Information</h3>
                                    {showB2BOptions && <Badge variant="solid" color="info" size="sm">{isAgency ? 'AGENCY PORTAL' : 'ADMIN BOOKING'}</Badge>}
                                </div>

                                <div className="space-y-6">
                                    {isAgency && (
                                        <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 p-4 rounded-2xl flex items-center gap-4">
                                            <Building2 className="w-8 h-8 text-blue-500" />
                                            <p className="text-xs text-blue-700 dark:text-blue-400 leading-normal">
                                                Booking for: <strong>{userProfile?.agency_company_name}</strong><br />
                                                Invoiced monthly at {commissionRate}% commission.
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField
                                            label={showB2BOptions ? "Booker Full Name" : "Guest Full Name"}
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                            disabled={!!userProfile && !showB2BOptions}
                                        />
                                        <InputField
                                            label={showB2BOptions ? "Booker Email" : "Guest Email Address"}
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            disabled={!!userProfile && !showB2BOptions}
                                        />
                                    </div>

                                    {showB2BOptions && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-brand-50/20 dark:bg-brand-500/5 rounded-3xl border border-brand-100/50 dark:border-brand-500/10">
                                            <div className="md:col-span-2 flex items-center gap-2 mb-2">
                                                <User className="size-4 text-brand-600" />
                                                <h4 className="text-sm font-black uppercase tracking-wider text-brand-600 italic">Effective Guest Details</h4>
                                            </div>
                                            <InputField
                                                label="Passenger Full Name"
                                                placeholder="Enter guest name"
                                                value={formData.guestName}
                                                onChange={e => setFormData({ ...formData, guestName: e.target.value })}
                                            />
                                            <InputField
                                                label="Passenger Email (Opt)"
                                                placeholder="guest@example.com"
                                                value={formData.guestEmail}
                                                onChange={e => setFormData({ ...formData, guestEmail: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    {showB2BOptions && (
                                        <div className="space-y-6">
                                            <div className="bg-brand-50/30 dark:bg-brand-500/5 border border-brand-100 dark:border-brand-500/20 p-6 rounded-2xl">
                                                <Switch
                                                    label="Create App Account for Client"
                                                    onChange={setCreateAccountToggle}
                                                    defaultChecked={createAccountToggle}
                                                />
                                                {createAccountToggle && (
                                                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <InputField
                                                            label="Temporary Password"
                                                            type="password"
                                                            value={formData.password}
                                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                            placeholder="e.g. ThaiAkha2026"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Pickup Hotel / Meeting Point</label>
                                                <select
                                                    value={formData.hotelName}
                                                    onChange={e => {
                                                        const hotel = hotelLocations.find(h => h.name === e.target.value);
                                                        setFormData({
                                                            ...formData,
                                                            hotelName: e.target.value,
                                                            pickupZone: hotel?.zone_id || 'outside'
                                                        });
                                                    }}
                                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl h-12 px-4 text-sm font-bold outline-none ring-0 focus:border-brand-500 transition-colors"
                                                >
                                                    <option value="">Select a location...</option>
                                                    {hotelLocations.map(h => (
                                                        <option key={h.id} value={h.name}>{h.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="w-full md:w-48">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Prefix</label>
                                            <select
                                                value={formData.phonePrefix}
                                                onChange={e => setFormData({ ...formData, phonePrefix: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl h-11 px-3 text-sm font-bold outline-none ring-0 focus:border-brand-500 transition-colors"
                                            >
                                                {COUNTRY_PREFIXES.map(p => (<option key={p.code} value={p.code}>{p.label}</option>))}
                                            </select>
                                        </div>
                                        <InputField
                                            label="Phone Number"
                                            placeholder="812345678"
                                            value={formData.phoneNumber}
                                            onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            className="grow"
                                        />
                                    </div>

                                    {!userProfile && !isAgency && <InputField label="Create Password" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Account security" />}

                                    <TextArea
                                        label={isAgency ? "Customer Reference" : "Dietary Notes"}
                                        placeholder={isAgency ? "e.g. Mr. Mario (Hotel Plaza)" : "Allergies, vegetarian, etc."}
                                        value={formData.customerNote}
                                        onChange={val => setFormData({ ...formData, customerNote: val })}
                                        rows={3}
                                    />

                                    {/* PAYMENT OPTIONS */}
                                    <div className="pt-8 border-t border-gray-100 dark:border-gray-700 mt-8">
                                        <div className="flex justify-between items-end mb-6">
                                            <h6 className="text-gray-400 uppercase tracking-widest text-[10px] font-black">Final Amount</h6>
                                            <div className="text-right">
                                                {isAgency && <span className="block text-xs text-gray-400 line-through mb-1">{totalGross.toLocaleString()} THB</span>}
                                                <h3 className="text-4xl font-black text-gray-900 dark:text-white italic">
                                                    {finalPrice.toLocaleString()} <span className="text-base font-normal text-brand-600 opacity-60">THB</span>
                                                </h3>
                                            </div>
                                        </div>

                                        {!isAgency && (
                                            <div className="grid grid-cols-2 gap-4 mb-8">
                                                <button
                                                    onClick={() => setPaymentMethod('arrival')}
                                                    className={cn(
                                                        "p-5 rounded-2xl border-2 text-left transition-all",
                                                        paymentMethod === 'arrival' ? "border-brand-500 bg-brand-500/5" : "border-gray-100 dark:border-gray-700 opacity-50"
                                                    )}
                                                >
                                                    <span className="block font-black uppercase text-xs text-gray-900 dark:text-white">Pay at Kitchen</span>
                                                    <span className="block text-[10px] text-gray-400 mt-1 uppercase">Cash or Scan</span>
                                                </button>
                                                <button
                                                    onClick={() => setPaymentMethod('card')}
                                                    className={cn(
                                                        "p-5 rounded-2xl border-2 text-left transition-all",
                                                        paymentMethod === 'card' ? "border-brand-500 bg-brand-500/5" : "border-gray-100 dark:border-gray-700 opacity-50"
                                                    )}
                                                >
                                                    <span className="block font-black uppercase text-xs text-gray-900 dark:text-white">Credit Card</span>
                                                    <span className="block text-[10px] text-gray-400 mt-1 uppercase">Instant Payment</span>
                                                </button>
                                            </div>
                                        )}

                                        <Button
                                            className="h-16 w-full rounded-2xl text-xl font-black uppercase italic shadow-brand-glow"
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            startIcon={isAgency ? <Send className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                                        >
                                            {isSubmitting ? 'Syncing...' : (isAgency ? 'Confirm B2B Booking' : 'Finalize Reservation')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODALS */}
            <Modal
                isOpen={showCalendarModal}
                onClose={() => setShowCalendarModal(false)}
                className="max-w-4xl p-0 overflow-hidden rounded-[2.5rem]"
            >
                <div className="h-[600px]">
                    <CalendarView
                        currentDate={selectedDate}
                        onSelectDate={(d) => { setSelectedDate(d); setSession(null); }}
                        onClose={() => setShowCalendarModal(false)}
                        allowSelectionOnFullDays={userProfile?.role === 'admin' || userProfile?.role === 'manager'}
                    />
                </div>
            </Modal>
        </PageContainer>
    );
};

export default BookingPage;
