import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import Label from '../components/form/Label';
import Button from '../components/ui/button/Button';
import Badge from '../components/ui/badge/Badge';
import {
    Search, Plus, MapPin, Clock, Phone,
    FileText, Printer, Save, Edit, Calendar,
    MoreHorizontal
} from 'lucide-react';

interface AgencyBooking {
    internal_id: string;
    booking_ref: string | null;
    guest_name: string;
    email: string;
    booking_date: string;
    session_type: string;
    pax: number;
    total_price: number;
    commission: number;
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    hotel_name: string;
    pickup_time: string;
    pickup_zone: string;
    customer_note: string;
    agency_note: string;
    phone_number: string;
}

const getDisplayId = (b: AgencyBooking) => b.booking_ref || b.internal_id.slice(0, 8).toUpperCase();

export default function AgencyDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<AgencyBooking[]>([]);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<AgencyBooking>>({});
    const [isSaving, setIsSaving] = useState(false);

    const fetchBookings = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let query = supabase
                .from('bookings')
                .select(`
          internal_id, booking_ref, booking_date, session_id, pax_count, total_price, status,
          customer_note, agency_note, hotel_name, pickup_time, pickup_zone, phone_number,
          profiles:user_id(full_name, email)
        `)
                .order('booking_date', { ascending: false });

            if (user.role === 'agency') query = query.eq('user_id', user.id);

            const { data } = await query;
            const mapped: AgencyBooking[] = (data || []).map((b: any) => ({
                internal_id: b.internal_id,
                booking_ref: b.booking_ref,
                guest_name: b.profiles?.full_name || 'Guest',
                email: b.profiles?.email || '',
                booking_date: b.booking_date,
                session_type: b.session_id?.includes('morning') ? 'Morning Class' : 'Evening Class',
                pax: b.pax_count,
                total_price: b.total_price,
                commission: Math.round(b.total_price * ((user.agency_commission_rate || 0) / 100)),
                status: b.status,
                hotel_name: b.hotel_name || '',
                pickup_time: b.pickup_time ? b.pickup_time.slice(0, 5) : '--:--',
                pickup_zone: b.pickup_zone || 'pending',
                customer_note: b.customer_note || '',
                agency_note: b.agency_note || '',
                phone_number: b.phone_number || ''
            }));
            setBookings(mapped);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBookings(); }, [user]);

    const activeBooking = useMemo(() => bookings.find(b => b.internal_id === selectedBookingId), [bookings, selectedBookingId]);

    useEffect(() => {
        if (activeBooking) {
            setEditForm({
                hotel_name: activeBooking.hotel_name,
                pickup_time: activeBooking.pickup_time,
                agency_note: activeBooking.agency_note,
                status: activeBooking.status
            });
            setIsEditing(false);
        }
    }, [activeBooking]);

    const handleSave = async () => {
        if (!activeBooking) return;
        setIsSaving(true);
        try {
            await supabase.from('bookings').update(editForm).eq('internal_id', activeBooking.internal_id);
            fetchBookings();
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating booking:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredList = useMemo(() => {
        return bookings.filter(b => (statusFilter === 'all' || b.status === statusFilter) &&
            (b.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) || getDisplayId(b).toLowerCase().includes(searchQuery.toLowerCase())));
    }, [bookings, statusFilter, searchQuery]);

    return (
        <div className="h-[calc(100vh-64px)] grid grid-cols-12 gap-0 bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* LEFT PANE - LIST */}
            <div className="col-span-12 md:col-span-4 lg:col-span-3 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full bg-white dark:bg-gray-800">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Bookings</h2>
                        <Button size="sm" startIcon={<Plus className="w-4 h-4" />}>New</Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Ref or Guest..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-none rounded-lg text-sm focus:ring-1 focus:ring-brand-500"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex gap-2 overflow-x-auto no-scrollbar">
                    {['all', 'confirmed', 'pending', 'cancelled'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors",
                                statusFilter === s
                                    ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">
                            <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                            <p className="text-xs">Loading bookings...</p>
                        </div>
                    ) : (
                        <>
                            {filteredList.map(b => (
                                <div
                                    key={b.internal_id}
                                    onClick={() => setSelectedBookingId(b.internal_id)}
                                    className={cn(
                                        "p-3 rounded-xl cursor-pointer transition-all border",
                                        selectedBookingId === b.internal_id
                                            ? "bg-brand-50 border-brand-200 shadow-sm dark:bg-brand-500/10 dark:border-brand-500/20"
                                            : "bg-white border-transparent hover:bg-gray-50 dark:bg-transparent dark:hover:bg-gray-700/50"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-semibold text-gray-900 dark:text-white truncate">{b.guest_name}</span>
                                        <Badge color={b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'error'}>
                                            {b.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Calendar className="w-3 h-3" />
                                        <span>{new Date(b.booking_date).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span className="font-mono">{getDisplayId(b)}</span>
                                    </div>
                                </div>
                            ))}
                            {filteredList.length === 0 && (
                                <div className="p-8 text-center text-gray-400">
                                    <p className="text-sm">No bookings found</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* CENTER PANE - PREVIEW */}
            <div className="col-span-12 md:col-span-8 lg:col-span-6 flex flex-col h-full overflow-hidden relative">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Invoice Preview</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50 dark:bg-gray-900/50 flex justify-center">
                    {activeBooking ? (
                        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                            <div className="p-8 md:p-10 space-y-8">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div className="w-16 h-16 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/20">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <div className="text-right">
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">INVOICE</h1>
                                        <p className="text-gray-500 font-mono mt-1">REF: #{getDisplayId(activeBooking)}</p>
                                    </div>
                                </div>

                                {/* Addresses */}
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
                                        <p className="font-semibold text-gray-900 dark:text-white">{user?.agency_company_name || user?.full_name}</p>
                                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                            {user?.agency_address || 'Partner Address'}<br />
                                            {user?.agency_city}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Guest Info</h3>
                                        <p className="font-semibold text-gray-900 dark:text-white">{activeBooking.guest_name}</p>
                                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                            {activeBooking.session_type}<br />
                                            {activeBooking.pax} Participants
                                        </p>
                                    </div>
                                </div>

                                {/* Line Items */}
                                <div className="border-t border-b border-gray-100 dark:border-gray-700 py-6">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-gray-400 text-xs uppercase tracking-wider text-left">
                                                <th className="pb-4 font-semibold">Description</th>
                                                <th className="pb-4 font-semibold text-center">Date</th>
                                                <th className="pb-4 font-semibold text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-gray-700 dark:text-gray-300">
                                            <tr>
                                                <td className="py-2 font-medium">{activeBooking.session_type} for {activeBooking.pax} pax</td>
                                                <td className="py-2 text-center">{new Date(activeBooking.booking_date).toLocaleDateString()}</td>
                                                <td className="py-2 text-right font-mono">{activeBooking.total_price.toLocaleString()} THB</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Totals */}
                                <div className="flex justify-end">
                                    <div className="w-full max-w-xs space-y-3">
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Gross Subtotal</span>
                                            <span className="font-mono">{activeBooking.total_price.toLocaleString()} THB</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                            <span>Agency Discount ({user?.agency_commission_rate}%)</span>
                                            <span className="font-mono">-{activeBooking.commission.toLocaleString()} THB</span>
                                        </div>
                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-baseline">
                                            <span className="font-bold text-gray-900 dark:text-white">Net Payable</span>
                                            <span className="text-2xl font-bold text-brand-600 dark:text-brand-400 font-mono">
                                                {(activeBooking.total_price - activeBooking.commission).toLocaleString()}
                                                <span className="text-sm text-gray-500 ml-1 font-sans font-normal">THB</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <FileText className="w-16 h-16 mb-4 opacity-20" />
                            <p className="font-medium">Select a booking to view invoice</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT PANE - INSPECTOR */}
            <div className="hidden lg:col-span-3 lg:flex flex-col h-full border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Inspector</h2>
                        <p className="text-xs text-gray-500 font-mono">{activeBooking ? getDisplayId(activeBooking) : 'Idle'}</p>
                    </div>
                    {activeBooking && (
                        <Button variant="outline" size="sm" onClick={() => setSelectedBookingId(null)}>
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {activeBooking ? (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" startIcon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
                                    Print
                                </Button>
                                <Button
                                    variant={isEditing ? "primary" : "outline"}
                                    startIcon={isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                    disabled={isSaving}
                                >
                                    {isEditing ? (isSaving ? 'Saving...' : 'Save') : 'Edit'}
                                </Button>
                            </div>

                            {/* Guest Logistics */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Guest Logistics</h3>

                                <div>
                                    <Label>Hotel / Pickup</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            value={isEditing ? (editForm.hotel_name || '') : activeBooking.hotel_name}
                                            onChange={e => setEditForm({ ...editForm, hotel_name: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>Time</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="time"
                                                disabled={!isEditing}
                                                value={isEditing ? (editForm.pickup_time || '') : activeBooking.pickup_time}
                                                onChange={e => setEditForm({ ...editForm, pickup_time: e.target.value })}
                                                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Pax</Label>
                                        <input
                                            type="text"
                                            disabled={true}
                                            value={activeBooking.pax}
                                            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-lg text-sm text-center font-semibold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-gray-700" />

                            {/* Internal Details */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Internal Details</h3>

                                <div>
                                    <Label>Agency Note</Label>
                                    <textarea
                                        rows={4}
                                        disabled={!isEditing}
                                        value={isEditing ? (editForm.agency_note || '') : activeBooking.agency_note}
                                        onChange={e => setEditForm({ ...editForm, agency_note: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Phone className="w-3 h-3 text-gray-400" />
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Guest Contact</span>
                                    </div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white pl-5">
                                        {activeBooking.phone_number || 'No Phone Recorded'}
                                    </div>
                                </div>
                            </div>

                            {/* Status Actions (Only when editing) */}
                            {isEditing && (
                                <div className="space-y-3 pt-4 animate-in fade-in">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lifecycle Status</h3>
                                    <div className="flex gap-2">
                                        {['confirmed', 'pending', 'cancelled'].map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setEditForm({ ...editForm, status: s as any })}
                                                className={cn(
                                                    "flex-1 py-2 rounded-lg text-xs font-bold uppercase border transition-all",
                                                    editForm.status === s
                                                        ? "bg-brand-500 text-white border-brand-500 shadow-md"
                                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50"
                                                )}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                            <Edit className="w-12 h-12 mb-3" />
                            <p className="text-xs font-bold uppercase tracking-widest">Inspector Idle</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
