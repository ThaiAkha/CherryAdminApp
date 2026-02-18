import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Badge from '../../components/ui/badge/Badge';
import Button from '../../components/ui/button/Button';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import { cn } from '../../lib/utils';
import { User, Calendar, Users, Phone, MapPin, FileText, Save, X, Edit, Trash2 } from 'lucide-react';
import ClassPicker, { SessionType } from '../../components/common/ClassPicker';
import PageContainer from '../../components/layout/PageContainer';
import PageGrid from '../../components/layout/PageGrid';
import InputField from '../../components/form/input/InputField';
import TextArea from '../../components/form/input/TextArea';
import { usePageHeader } from '../../context/PageHeaderContext';

import { contentService } from '../../services/content.service';
import PageMeta from '../../components/common/PageMeta';

const ManagerKitchen: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate: _onNavigate }) => {
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
    const fetchTableData = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('bookings')
                .select(`
                    internal_id, pax_count, status, session_id, booking_date, pickup_time, customer_note, 
                    hotel_name, pickup_zone, phone_number, agency_note, user_id,
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

            // Re-select if someone was selected before
            if (selectedBooking) {
                const updated = data?.find(b => b.internal_id === selectedBooking.internal_id);
                if (updated) setSelectedBooking(updated);
            }
        } catch (e) {
            console.error("Fetch Error:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTableData();
    }, [globalDate, globalSession]);

    const handleSelectBooking = (booking: any) => {
        if (selectedBooking?.internal_id === booking.internal_id) {
            setSelectedBooking(null);
            setIsEditing(false);
        } else {
            setSelectedBooking(booking);
            setIsEditing(false);
        }
    };

    const handleEditStart = () => {
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
    };

    const handleSave = async () => {
        if (!selectedBooking || !editData) return;
        setIsSaving(true);
        try {
            // 1. Update Profile (Name, Diet, Allergies)
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

            // 2. Update Booking
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
    };

    const renderDetailPanel = () => {
        if (!selectedBooking) {
            return (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                    <div className="size-16 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center mb-4 text-gray-300 shadow-sm border border-gray-100 dark:border-gray-700">
                        <User className="w-8 h-8" />
                    </div>
                    <h5 className="text-gray-500 font-bold uppercase tracking-widest text-xs">No Selection</h5>
                    <p className="text-gray-400 text-xs mt-2 max-w-[200px]">Select a booking from the list to view and manage details.</p>
                </div>
            );
        }

        const b = selectedBooking;
        const profile = b.profiles || {};

        return (
            <div className="bg-white dark:bg-[#1a1a1a]/80 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">

                {/* Panel Header */}
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                        <div className="size-14 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 text-xl font-black shadow-inner">
                            {profile.full_name?.charAt(0) || 'G'}
                        </div>
                        <div>
                            <h4 className="text-xl font-black uppercase text-gray-900 dark:text-white italic leading-none">{profile.full_name || 'Guest'}</h4>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Order #{b.internal_id ? b.internal_id.slice(0, 8).toUpperCase() : 'N/A'}</p>
                        </div>
                    </div>
                    {!isEditing && (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleEditStart} startIcon={<Edit className="w-4 h-4" />}>
                                Edit
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar pr-2">
                    {isEditing ? (
                        <div className="space-y-6">
                            <InputField label="Full Name" value={editData.full_name} onChange={e => setEditData({ ...editData, full_name: e.target.value })} />

                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Participants" type="number" value={editData.pax_count} onChange={e => setEditData({ ...editData, pax_count: e.target.value })} />
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                                    <select
                                        value={editData.status}
                                        onChange={e => setEditData({ ...editData, status: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl h-11 px-4 text-sm font-bold uppercase"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Dietary Details</label>
                                <div className="grid grid-cols-1 gap-4">
                                    <select
                                        value={editData.dietary_profile}
                                        onChange={e => setEditData({ ...editData, dietary_profile: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl h-11 px-4 text-sm outline-none focus:border-brand-500 transition-colors"
                                    >
                                        <option value="diet_regular">Regular</option>
                                        <option value="diet_vegetarian">Vegetarian</option>
                                        <option value="diet_vegan">Vegan</option>
                                        <option value="diet_pescatarian">Pescatarian</option>
                                        <option value="diet_gluten_free">Gluten Free</option>
                                    </select>
                                    <InputField placeholder="Allergies (comma separated)" value={editData.allergies} onChange={e => setEditData({ ...editData, allergies: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    label="Hotel"
                                    value={editData.hotel_name || ''}
                                    onChange={(e) => setEditData({ ...editData, hotel_name: e.target.value })}
                                />
                                <InputField
                                    label="Phone"
                                    value={editData.phone_number || ''}
                                    onChange={(e) => setEditData({ ...editData, phone_number: e.target.value })}
                                />
                            </div>

                            <TextArea
                                label="Customer Note"
                                value={editData.customer_note || ''}
                                onChange={(val) => setEditData({ ...editData, customer_note: val })}
                                rows={3}
                            />
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Dietary Status</p>
                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                        {(profile.dietary_profile || 'Normal').replace('diet_', '').toUpperCase()}
                                        {profile.allergies?.length > 0 && <span className="text-red-500 ml-2">[{Array.isArray(profile.allergies) ? profile.allergies.join(', ') : profile.allergies}]</span>}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Menu selections</p>
                                    <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tighter truncate">
                                        {b.menu_selections ? (
                                            `${b.menu_selections.curry?.name || 'N/A'} • ${b.menu_selections.soup?.name || 'N/A'} • ${b.menu_selections.stirfry?.name || 'N/A'}`
                                        ) : 'NO MENU SET'}
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] block mb-1">Participants</span>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-brand-600" />
                                        <span className="text-xl font-black text-gray-900 dark:text-white">{b.pax_count} Pax</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] block mb-1">Pickup Time</span>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-brand-600" />
                                        <span className="text-xl font-black text-gray-900 dark:text-white">{b.pickup_time || '09:15'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Rows */}
                            <div className="space-y-6">
                                <div className="flex gap-4 items-start">
                                    <div className="size-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-700 shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Location</span>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{b.hotel_name || 'To be selected'}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="size-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-700 shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Contact</span>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{b.phone_number || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="size-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-700 shrink-0">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Guest Notes</span>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800 italic">
                                            {b.customer_note || 'No special requirements noted.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="pt-8 border-t border-gray-100 dark:border-gray-800 mt-auto">
                    {isEditing ? (
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="w-full rounded-2xl" onClick={() => setIsEditing(false)} startIcon={<X className="w-4 h-4" />} disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button className="w-full rounded-2xl shadow-brand-glow" onClick={handleSave} startIcon={<Save className="w-4 h-4" />} disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center text-gray-400">
                            <div className="flex items-center gap-2">
                                <div className={cn("size-2 rounded-full", b.status === 'confirmed' ? "bg-green-500" : "bg-amber-500")} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{b.status}</span>
                                {b.agency_note && <Badge variant="light" color="primary" size="sm">Agency</Badge>}
                            </div>
                            <button className="text-[10px] font-black uppercase hover:text-red-500 transition-colors flex items-center gap-1">
                                <Trash2 className="w-3 h-3" /> Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderKitchenView = () => (
        <PageGrid columns={12} className="h-full">

            {/* COLUMN 1: MASTER LIST (2/3) */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-hidden h-full min-h-[600px]">
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a]/80 shadow-sm overflow-hidden flex-1 flex flex-col">

                    {/* List Header */}
                    <div className="p-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                        <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-brand-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                                Live Prep List • {bookings.length} Cooks
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar">
                        {loading && bookings.length === 0 ? (
                            <div className="p-24 text-center">
                                <span className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">Syncing Kitchen...</span>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-gray-50/50 dark:bg-white/5 sticky top-0 z-10">
                                    <TableRow className="border-b border-gray-100 dark:border-white/5">
                                        <TableCell isHeader className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Cook Profile</TableCell>
                                        <TableCell isHeader className="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Pax</TableCell>
                                        <TableCell isHeader className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Dietary</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {bookings.length > 0 ? bookings.map((b: any) => {
                                        const profile = b.profiles || {};
                                        const diet = (profile.dietary_profile || 'regular').replace('diet_', '');
                                        const isSpecial = diet !== 'regular';
                                        const isActive = selectedBooking?.internal_id === b.internal_id;

                                        return (
                                            <TableRow
                                                key={b.internal_id}
                                                onClick={() => handleSelectBooking(b)}
                                                className={cn(
                                                    "cursor-pointer transition-all duration-300",
                                                    isActive
                                                        ? "bg-brand-50/50 dark:bg-brand-500/5 ring-1 ring-brand-500/20 z-10"
                                                        : "hover:bg-gray-50/50 dark:hover:bg-white/5"
                                                )}
                                            >
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "size-10 rounded-xl flex items-center justify-center text-xs font-black transition-colors",
                                                            isActive ? "bg-brand-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                                        )}>
                                                            {profile.full_name?.charAt(0) || 'G'}
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-gray-900 dark:text-white block leading-tight">{profile.full_name || 'Guest'}</span>
                                                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{b.pickup_time || '--:--'}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="px-6 py-4 text-center">
                                                    <span className="font-black text-lg text-gray-900 dark:text-white">{b.pax_count}</span>
                                                </TableCell>

                                                <TableCell className="px-6 py-4">
                                                    <Badge variant={isSpecial ? "solid" : "light"} color={isSpecial ? "warning" : "light"} size="sm">
                                                        {diet.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }) : (
                                        <TableRow>
                                            <TableCell className="px-6 py-24 text-center text-gray-400 italic" isHeader={false}>
                                                No bookings found for this session.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>
            </div>

            {/* COLUMN 2: DETAIL PANEL (1/3) */}
            <div className="col-span-12 lg:col-span-4 h-full">
                {renderDetailPanel()}
            </div>

        </PageGrid>
    );

    return (

        <PageContainer className="h-[calc(100vh-64px)] flex flex-col">
            <PageMeta
                title="Manager Kitchen | Thai Akha Kitchen"
                description="Manage daily cooking classes and prep lists."
            />
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    <ClassPicker
                        date={globalDate}
                        onDateChange={setGlobalDate}
                        session={globalSession}
                        onSessionChange={setGlobalSession}
                    />
                </div>
            </div>

            <div className="flex-1 min-h-0 relative">
                {renderKitchenView()}
            </div>
        </PageContainer>
    );
};

export default ManagerKitchen;
