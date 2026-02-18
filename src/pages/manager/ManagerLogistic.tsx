import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import Avatar from '../../components/ui/avatar/Avatar';
import Badge from '../../components/ui/badge/Badge';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import TextArea from '../../components/form/input/TextArea';
import { cn } from '../../lib/utils';
import {
    Sun, Moon, CarTaxiFront, MapPin, Phone, Printer, Wand2,
    Search, X, Save, UserRound
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import PageGrid from '../../components/layout/PageGrid';
import { usePageHeader } from '../../context/PageHeaderContext';
import ClassPicker, { SessionType } from '../../components/common/ClassPicker';
import PageMeta from '../../components/common/PageMeta';
import { contentService } from '../../services/content.service';

// --- TYPES ---
interface LogisticsItem {
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

interface DriverProfile {
    id: string;
    full_name: string;
    avatar_url?: string;
}

interface SessionSummary {
    date: string;
    session_id: string;
    unassigned_count: number;
}

const ManagerLogistic: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate: _onNavigate }) => {
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

    // --- 1. DATA FETCHING ---
    const fetchData = async () => {
        setLoading(true);
        try {
            // A. Fetch Next 10 Sessions for Left Column
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
          booking_date, transport_status,
          profiles:user_id(full_name, avatar_url)
        `)
                .eq('booking_date', selectedDate)
                .eq('session_id', selectedSessionId)
                .neq('status', 'cancelled')
                .order('route_order', { ascending: true });

            if (bookingData) {
                setItems(bookingData.map((b: any) => ({
                    id: b.internal_id,
                    guest_name: b.profiles?.full_name || 'Guest',
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
    };

    useEffect(() => { fetchData(); }, [selectedDate, selectedSessionId]);

    // --- 2. ACTIONS ---
    const handleAssign = async (bookingId: string, driverId: string | null) => {
        const { error } = await supabase
            .from('bookings')
            .update({ pickup_driver_uid: driverId, route_order: 99 })
            .eq('internal_id', bookingId);

        if (!error) fetchData();
    };

    const handleUpdateBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBookingId) return;
        setIsSaving(true);

        const item = items.find(i => i.id === selectedBookingId);
        if (!item) return;

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
    };

    const updateLocalItem = (id: string, updates: Partial<LogisticsItem>) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    };

    // --- 3. RENDER ---
    const unassignedItems = useMemo(() => items.filter(i => !i.pickup_driver_uid), [items]);
    const selectedBooking = useMemo(() => items.find(i => i.id === selectedBookingId), [items, selectedBookingId]);

    return (
        <PageContainer variant="full" className="h-[calc(100vh-64px)] flex flex-col">
            <PageMeta
                title="Admin Dashboard | Thai Akha Kitchen"
                description="To be set up later."
            />
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    <ClassPicker
                        date={selectedDate}
                        onDateChange={setSelectedDate}
                        session={selectedSessionId}
                        onSessionChange={(s) => setSelectedSessionId(s as SessionType)}
                    />
                </div>
            </div>

            <PageGrid columns={12} className="flex-1 min-h-0">

                {/* --- LEFT PANE (Sessions & Unassigned) --- */}
                <div className="lg:col-span-2 flex flex-col h-full gap-6 overflow-hidden">

                    {/* Sessions List */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden max-h-[50%]">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                            <h6 className="uppercase tracking-widest text-xs font-bold text-gray-500">Upcoming Sessions</h6>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
                            {upcomingSessions.map((s) => (
                                <button
                                    key={`${s.date}_${s.session_id}`}
                                    onClick={() => { setSelectedDate(s.date); setSelectedSessionId(s.session_id as SessionType); }}
                                    className={cn(
                                        "w-full p-3 rounded-xl border text-left transition-all group",
                                        selectedDate === s.date && selectedSessionId === s.session_id
                                            ? "bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-400 font-medium shadow-sm"
                                            : "bg-white dark:bg-gray-800 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-mono text-xs font-bold">{s.date}</span>
                                        {s.session_id.includes('morning') ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                            {s.session_id.replace('_class', '')}
                                        </span>
                                        {s.unassigned_count > 0 && (
                                            <Badge variant="solid" color="error" size="sm">
                                                {s.unassigned_count} NEW
                                            </Badge>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Unassigned Staging */}
                    <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
                            <h6 className="uppercase tracking-widest text-xs font-bold text-gray-500">Staging Area</h6>
                            <Badge variant="light" color="light">{unassignedItems.length}</Badge>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
                            {unassignedItems.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedBookingId(item.id)}
                                    className={cn(
                                        "p-3 rounded-xl border cursor-pointer transition-all",
                                        selectedBookingId === item.id
                                            ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-500/20"
                                            : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-500/50"
                                    )}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <UserRound className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs font-bold uppercase truncate">{item.guest_name}</span>
                                        </div>
                                        <Badge variant="light" color="light" size="sm" className="shrink-0">{item.pax}p</Badge>
                                    </div>
                                </div>
                            ))}
                            {unassignedItems.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-gray-600 gap-2">
                                    <CarTaxiFront className="w-8 h-8" />
                                    <span className="text-xs font-medium">All assigned</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- CENTER PANE (Live Board) --- */}
                <div className="lg:col-span-7 flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden relative">
                    {loading && <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm"><div className="loader font-black uppercase text-xs tracking-widest animate-pulse">Syncing...</div></div>}

                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-20">
                        <div className="flex items-center gap-3">
                            <Badge variant="solid" color="primary">LIVE BOARD</Badge>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" startIcon={<Wand2 className="w-4 h-4" />}>Auto</Button>
                            <Button size="sm" variant="outline" startIcon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>Print</Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 no-scrollbar">
                        <div className="flex h-full gap-4 min-w-max">
                            {drivers.map(driver => {
                                const driverItems = items.filter(i => i.pickup_driver_uid === driver.id);
                                return (
                                    <div key={driver.id} className="w-[300px] flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                                        <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex items-center gap-3">
                                            <Avatar src={driver.avatar_url || ''} alt={driver.full_name} size="small" />
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">{driver.full_name}</div>
                                                <div className="text-[10px] text-gray-500 font-mono">{driverItems.length} Stops</div>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50/50 dark:bg-gray-900/50 no-scrollbar">
                                            {driverItems.map(item => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => setSelectedBookingId(item.id)}
                                                    className={cn(
                                                        "p-3 rounded-xl border transition-all cursor-pointer bg-white dark:bg-gray-800 shadow-sm",
                                                        selectedBookingId === item.id
                                                            ? "border-brand-500 ring-1 ring-brand-500"
                                                            : "border-gray-100 dark:border-gray-700 hover:border-brand-300"
                                                    )}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-1 text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                                                            <span className="bg-brand-50 dark:bg-brand-900/30 px-1.5 py-0.5 rounded text-xs">{item.pickup_time}</span>
                                                        </div>
                                                        <Badge variant="light" color="light" size="sm">{item.pax} PAX</Badge>
                                                    </div>
                                                    <div className="font-bold text-sm text-gray-900 dark:text-white uppercase truncate">{item.guest_name}</div>
                                                    <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500 truncate">
                                                        <MapPin className="w-3 h-3" />
                                                        {item.hotel_name}
                                                    </div>
                                                </div>
                                            ))}
                                            {driverItems.length === 0 && (
                                                <div className="h-full flex flex-col items-center justify-center opacity-30 gap-2">
                                                    <CarTaxiFront className="w-8 h-8" />
                                                    <span className="text-[10px] font-bold uppercase">No Route</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT PANE (Details) --- */}
                <div className="lg:col-span-3 h-full flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    {!selectedBooking ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                            <Search className="w-12 h-12 mb-4 opacity-50" />
                            <h5 className="uppercase font-bold text-sm text-gray-900 dark:text-white">Select a Passenger</h5>
                            <p className="text-xs mt-2 text-gray-500">Click any card to inspect and manage details.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdateBooking} className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 space-y-4 bg-gray-50/30 dark:bg-gray-800/20">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <Badge variant="light" color="primary">{selectedBooking.pax} PAX</Badge>
                                        <h3 className="text-xl font-black uppercase tracking-tight leading-none text-gray-900 dark:text-white mt-2">
                                            {selectedBooking.guest_name}
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedBookingId(null)}
                                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                                {/* Driver Assignment */}
                                <div className="space-y-3">
                                    <h6 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Route Assignment</h6>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Driver</label>
                                        <div className="relative">
                                            <select
                                                value={selectedBooking.pickup_driver_uid || ''}
                                                onChange={(e) => handleAssign(selectedBooking.id, e.target.value || null)}
                                                className="w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:bg-gray-900"
                                            >
                                                <option value="">-- UNASSIGNED --</option>
                                                {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-100 dark:border-gray-800" />

                                {/* Pickup Details */}
                                <div className="space-y-4">
                                    <h6 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pickup Details</h6>

                                    <Input
                                        label="Hotel / Meeting Point"
                                        type="text"
                                        placeholder="Enter hotel name"
                                        value={selectedBooking.hotel_name}
                                        onChange={e => updateLocalItem(selectedBooking.id, { hotel_name: e.target.value })}
                                        leftIcon={<MapPin className="w-5 h-5" />}
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            label="Time"
                                            type="time"
                                            value={selectedBooking.pickup_time}
                                            onChange={e => updateLocalItem(selectedBooking.id, { pickup_time: e.target.value })}
                                        />
                                        <Input
                                            label="Phone"
                                            type="tel"
                                            placeholder="+66..."
                                            value={selectedBooking.phone_number || ''}
                                            onChange={e => updateLocalItem(selectedBooking.id, { phone_number: e.target.value })}
                                            leftIcon={<Phone className="w-5 h-5" />}
                                        />
                                    </div>
                                </div>

                                <hr className="border-gray-100 dark:border-gray-800" />

                                {/* Notes */}
                                <div className="space-y-4">
                                    <h6 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Notes</h6>
                                    <TextArea
                                        placeholder="Customer requests..."
                                        rows={2}
                                        value={selectedBooking.customer_note || ''}
                                        onChange={val => updateLocalItem(selectedBooking.id, { customer_note: val })}
                                        hint="Visible to driver"
                                    />
                                    <TextArea
                                        placeholder="Internal/Agency notes..."
                                        rows={2}
                                        value={selectedBooking.agency_note || ''}
                                        onChange={val => updateLocalItem(selectedBooking.id, { agency_note: val })}
                                        hint="Internal only"
                                    />
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full justify-center shadow-lg"
                                    startIcon={<Save className="w-4 h-4" />}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Saving...' : 'Update Booking'}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </PageGrid>
        </PageContainer>
    );
};

export default ManagerLogistic;
