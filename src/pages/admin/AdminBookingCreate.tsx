import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import PageMeta from '../../components/common/PageMeta';
import { usePageHeader } from '../../context/PageHeaderContext';
import { contentService } from '../../services/content.service';
import Button from '../../components/ui/button/Button';
import InputField from '../../components/form/input/InputField';
import TextArea from '../../components/form/input/TextArea';
import { User, Mail, Phone, MapPin, CheckCircle, Clock, Search, History, Rocket, Info } from 'lucide-react';
import AdminClassPicker from './components/AdminClassPicker';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router';

// --- CONSTANTS ---
const PRICES: Record<string, number> = {
    morning_class: 1500,
    evening_class: 1300
};

const ZONES = ['green', 'pink', 'yellow', 'outside', 'walk-in'];

const AdminBookingCreate: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // --- 1. SESSION DATA ---
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [session, setSession] = useState<'morning_class' | 'evening_class'>('morning_class');

    // --- 2. USER DATA ---
    const [userMode, setUserMode] = useState<'new' | 'existing' | 'agency'>('new');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [agencyList, setAgencyList] = useState<any[]>([]); // New state for agencies
    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    const [newUser, setNewUser] = useState({
        fullName: '',
        email: '',
        phone: '',
        diet: 'diet_regular',
        allergies: [] as string[]
    });

    // --- 3. BOOKING DETAILS ---
    const [pax, setPax] = useState(1);
    const [amount, setAmount] = useState(1500);
    const [status, setStatus] = useState('confirmed');
    const [paymentStatus, setPaymentStatus] = useState('pending');

    // --- 4. LOGISTICS ---
    const [hotel, setHotel] = useState('');
    const [zone, setZone] = useState('green');
    const [pickupTime, setPickupTime] = useState('08:30');
    const [notes, setNotes] = useState('');

    const { setPageHeader } = usePageHeader();
    // --- EFFECTS ---

    // Load Metadata
    useEffect(() => {
        const loadMetadata = async () => {
            const meta = await contentService.getPageMetadata('admin-booking-create');
            if (meta) {
                setPageHeader(meta.titleMain || 'New Fast Booking', meta.description || '');
            } else {
                setPageHeader('New Fast Booking', 'Create a manual booking for walk-ins or manual entries.');
            }
        };
        loadMetadata();
    }, [setPageHeader]);

    // Fetch Agencies on Mount
    useEffect(() => {
        const fetchAgencies = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name, email, phone_number')
                .eq('role', 'agency')
                .order('full_name');
            setAgencyList(data || []);
        };
        fetchAgencies();
    }, []);

    // Auto-calc Price
    useEffect(() => {
        const basePrice = PRICES[session] || 1500;
        setAmount(basePrice * pax);
    }, [pax, session]);

    // Auto-set Pickup Time
    useEffect(() => {
        if (session === 'morning_class') setPickupTime('08:30');
        if (session === 'evening_class') setPickupTime('16:30');
    }, [session]);

    // User Search (Debounce)
    useEffect(() => {
        if (userMode === 'existing' && searchQuery.length > 2) {
            const search = async () => {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, phone_number')
                    .ilike('full_name', `%${searchQuery}%`)
                    .limit(5);
                setSearchResults(data || []);
            };
            const timer = setTimeout(search, 300);
            return () => clearTimeout(timer);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, userMode]);

    // --- SUBMIT HANDLER ---
    const handleCreate = async () => {
        if (userMode === 'new' && !newUser.fullName) return alert("Guest Name is required");
        if ((userMode === 'existing' || userMode === 'agency') && !selectedUser) return alert("Select a user/agency");

        setLoading(true);

        try {
            let userId = selectedUser?.id;

            // 1. CREATE USER (If New)
            if (userMode === 'new') {
                // Call Edge Function to create guest user without login
                const { data: uData, error: uError } = await supabase.functions.invoke('create-guest-user', {
                    body: {
                        email: newUser.email || `guest-${Date.now()}@temp.tak`, // Fallback for walk-in without email
                        full_name: newUser.fullName,
                        password: `Temp${Date.now()}!` // Temporary password
                    }
                });

                // Edge function returns 200 even on error sometimes, check body
                if (uError) throw uError;
                if (uData?.error) throw new Error(uData.error);

                userId = uData.user.id;

                // Update profile with extra details
                if (userId) {
                    const { error: profileError } = await supabase.from('profiles').update({
                        dietary_profile: newUser.diet,
                        phone_number: newUser.phone
                    }).eq('id', userId);

                    if (profileError) console.error("Profile update warning:", profileError);
                }
            }

            // 2. CREATE BOOKING
            const { error: bError } = await supabase.from('bookings').insert({
                user_id: userId,
                guest_name: userMode === 'new' ? newUser.fullName : selectedUser?.full_name,
                booking_date: date,
                session_id: session,
                pax_count: pax,
                total_price: amount,
                status: status,
                payment_status: paymentStatus,
                payment_method: userMode === 'agency' ? 'agency_invoice' : (paymentStatus === 'paid' ? 'cash' : 'pay_on_arrival'),
                hotel_name: hotel || 'Walk-in / No Hotel',
                pickup_zone: zone,
                pickup_time: pickupTime,
                customer_note: notes,
                booking_source: 'admin_console'
            });

            if (bError) throw bError;

            alert("Booking Created Successfully! kha");
            // Reset logic
            setPax(1);
            setNotes('');
            setHotel('');
            setNewUser({ fullName: '', email: '', phone: '', diet: 'diet_regular', allergies: [] });
            setSearchQuery('');
            setSelectedUser(null);

        } catch (e: any) {
            console.error(e);
            alert(`Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageMeta
                title="New Fast Booking | Thai Akha Kitchen"
                description="Create a manual booking for walk-ins or manual entries."
            />
            <PageContainer variant="narrow">
                <PageHeader
                    title="New Fast Booking"
                    subtitle="Create a manual booking for walk-ins or manual entries."
                >
                    <Button variant="outline" onClick={() => navigate('/booking-overview')} startIcon={<History className="w-4 h-4" />}>
                        Recent
                    </Button>
                </PageHeader>

                <div className="max-w-[95rem] mx-auto space-y-6 pb-20">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                        {/* ---------------- COLUMN 1: WHO & WHEN (4 span) ---------------- */}
                        <div className="lg:col-span-4 space-y-6">

                            {/* 1. DATE SELECTION */}
                            <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
                                <h6 className="text-[10px] uppercase font-black text-gray-400 tracking-widest">1. Date & Session</h6>
                                <AdminClassPicker
                                    date={date}
                                    session={session}
                                    onDateChange={setDate}
                                    onSessionChange={setSession}
                                />
                            </div>

                            {/* 2. GUEST DETAILS */}
                            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex gap-2">
                                    <button
                                        onClick={() => setUserMode('new')}
                                        className={cn("flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all", userMode === 'new' ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm" : "text-gray-400 hover:text-gray-600")}
                                    >
                                        New Guest
                                    </button>
                                    <button
                                        onClick={() => setUserMode('existing')}
                                        className={cn("flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all", userMode === 'existing' ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm" : "text-gray-400 hover:text-gray-600")}
                                    >
                                        Existing
                                    </button>
                                    <button
                                        onClick={() => setUserMode('agency')}
                                        className={cn("flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all", userMode === 'agency' ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm" : "text-gray-400 hover:text-gray-600")}
                                    >
                                        Agency
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    {userMode === 'new' ? (
                                        <>
                                            <InputField label="Full Name" value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} leftIcon={<User className="w-4 h-4" />} />
                                            <InputField label="Email (Optional)" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} leftIcon={<Mail className="w-4 h-4" />} />
                                            <InputField label="Phone / WhatsApp" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} leftIcon={<Phone className="w-4 h-4" />} />

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] uppercase font-black text-gray-500 mb-1 block">Diet</label>
                                                    <select
                                                        value={newUser.diet}
                                                        onChange={e => setNewUser({ ...newUser, diet: e.target.value })}
                                                        className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm outline-none focus:border-brand-500"
                                                    >
                                                        <option value="diet_regular">Regular</option>
                                                        <option value="diet_vegetarian">Vegetarian</option>
                                                        <option value="diet_vegan">Vegan</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    ) : userMode === 'existing' ? (
                                        <div className="space-y-4">
                                            <InputField
                                                placeholder="Search name, email..."
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                leftIcon={<Search className="w-4 h-4" />}
                                            />
                                            <div className="max-h-60 overflow-y-auto space-y-2">
                                                {searchResults.map(u => (
                                                    <div key={u.id} onClick={() => setSelectedUser(u)} className={cn("p-3 rounded-xl border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800", selectedUser?.id === u.id ? "border-brand-500 bg-brand-50 dark:bg-brand-900/10" : "border-transparent")}>
                                                        <div className="font-bold text-gray-900 dark:text-white">{u.full_name}</div>
                                                        <div className="text-xs text-gray-500">{u.email}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <label className="text-[10px] uppercase font-black text-gray-500 mb-1 block">Select Agency</label>
                                            <div className="max-h-60 overflow-y-auto space-y-2">
                                                {agencyList.map(a => (
                                                    <div key={a.id} onClick={() => setSelectedUser(a)} className={cn("p-3 rounded-xl border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3", selectedUser?.id === a.id ? "border-brand-500 bg-brand-50 dark:bg-brand-900/10" : "border-transparent")}>
                                                        <div className="size-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">AG</div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 dark:text-white">{a.full_name}</div>
                                                            <div className="text-xs text-gray-500">{a.email}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>


                        {/* ---------------- COLUMN 2: LOGISTICS (4 span) ---------------- */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-6 h-full">
                                <h6 className="text-[10px] uppercase font-black text-gray-400 tracking-widest">3. Logistics</h6>

                                <InputField
                                    label="Hotel / Meeting Point"
                                    value={hotel}
                                    onChange={e => setHotel(e.target.value)}
                                    leftIcon={<MapPin className="w-4 h-4" />}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <InputField
                                        label="Pickup Time"
                                        type="time"
                                        value={pickupTime}
                                        onChange={e => setPickupTime(e.target.value)}
                                    />

                                    <div>
                                        <label className="text-[10px] uppercase font-black text-gray-500 mb-1 block">Zone</label>
                                        <select
                                            value={zone}
                                            onChange={e => setZone(e.target.value)}
                                            className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm font-bold uppercase outline-none focus:border-brand-500"
                                        >
                                            {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/20 text-orange-600 text-xs flex gap-2">
                                    <Info className="w-4 h-4 shrink-0" />
                                    <span>Check zone color on map if unsure. Incorrect zone may delay pickup.</span>
                                </div>

                                <TextArea
                                    label="Internal / Kitchen Notes"
                                    value={notes}
                                    onChange={val => setNotes(val)}
                                    rows={4}
                                />
                            </div>
                        </div>


                        {/* ---------------- COLUMN 3: STATUS & PAY (4 span) ---------------- */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-8 shadow-xl dark:shadow-none">
                                <h6 className="text-[10px] uppercase font-black text-gray-400 tracking-widest">4. Summary</h6>

                                {/* PAX CONTROL */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <span className="text-sm font-black uppercase text-gray-400">PAX</span>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setPax(Math.max(1, pax - 1))} className="size-10 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 text-xl font-bold">-</button>
                                        <span className="text-3xl font-display font-black text-brand-600 w-12 text-center">{pax}</span>
                                        <button onClick={() => setPax(pax + 1)} className="size-10 rounded-full bg-brand-600 text-white shadow-lg hover:scale-110 transition-transform text-xl font-bold">+</button>
                                    </div>
                                </div>

                                {/* PRICE CONTROL */}
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-400 block">Total Price (THB)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(Number(e.target.value))}
                                        className="w-full bg-transparent text-5xl font-display font-black text-brand-600 outline-none border-b-2 border-gray-100 dark:border-gray-800 focus:border-brand-500 transition-all p-2"
                                    />
                                </div>

                                {/* STATUS TOGGLES */}
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setPaymentStatus(paymentStatus === 'paid' ? 'pending' : 'paid')}
                                        className={cn("h-14 rounded-xl border-2 flex items-center justify-center gap-2 font-bold uppercase text-xs transition-all", paymentStatus === 'paid' ? "border-green-500 bg-green-50 dark:bg-green-900/10 text-green-600" : "border-gray-200 dark:border-gray-700 text-gray-400")}
                                    >
                                        {paymentStatus === 'paid' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                        {paymentStatus === 'paid' ? "PAID" : "UNPAID"}
                                    </button>

                                    <button
                                        onClick={() => setStatus(status === 'confirmed' ? 'pending' : 'confirmed')}
                                        className={cn("h-14 rounded-xl border-2 flex items-center justify-center gap-2 font-bold uppercase text-xs transition-all", status === 'confirmed' ? "border-brand-500 bg-brand-50 dark:bg-brand-900/10 text-brand-600" : "border-gray-200 dark:border-gray-700 text-gray-400")}
                                    >
                                        {status === 'confirmed' ? "CONFIRMED" : "PENDING"}
                                    </button>
                                </div>

                                <hr className="border-gray-100 dark:border-gray-800" />

                                <Button
                                    size="md"
                                    variant="primary"
                                    onClick={handleCreate}
                                    disabled={loading}
                                    className="h-16 w-full text-lg shadow-brand-glow"
                                    startIcon={!loading && <Rocket className="w-5 h-5" />}
                                >
                                    {loading ? "Creating..." : "CREATE BOOKING"}
                                </Button>

                            </div>
                        </div>

                    </div>
                </div>
            </PageContainer>
        </>
    );
};

export default AdminBookingCreate;
