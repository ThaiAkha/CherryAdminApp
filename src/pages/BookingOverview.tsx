import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Badge from '../components/ui/badge/Badge';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';
import { cn } from '../lib/utils';
import { ChefHat, BarChart3, AlertTriangle } from 'lucide-react';
import AdminClassPicker, { SessionType } from './admin/components/AdminClassPicker';

// --- CONFIGURAZIONE NAVIGAZIONE ---
const NAV_TABS = [
    { value: 'kitchen', label: 'Kitchen Prep', icon: <ChefHat className="w-5 h-5" /> },
    { value: 'reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> }
];

type DashboardView = 'kitchen' | 'reports';

const BookingOverview: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate: _onNavigate }) => {

    // --- STATO GLOBALE ---
    const [activeView, setActiveView] = useState<DashboardView>('kitchen');
    const [globalDate, setGlobalDate] = useState(new Date().toISOString().split('T')[0]);
    const [globalSession, setGlobalSession] = useState<SessionType>('morning_class');
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState<any[]>([]);

    // --- FETCH DATI ---
    const fetchTableData = async () => {
        // Se siamo nel calendario, non serve caricare la tabella cucina
        if (activeView !== 'kitchen') return;

        setLoading(true);
        try {
            let query = supabase
                .from('bookings')
                .select(`
          internal_id, pax_count, status, session_id, pickup_time,
          profiles:user_id(full_name, dietary_profile, allergies)
        `)
                .eq('booking_date', globalDate)
                .neq('status', 'cancelled')
                .order('pickup_time', { ascending: true });

            if (globalSession !== 'all') {
                query = query.eq('session_id', globalSession);
            }

            const { data } = await query;
            setBookings(data || []);
        } catch (e) {
            console.error("Errore fetch cucina:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTableData();
    }, [globalDate, globalSession, activeView]);

    // --- RENDER CONTENT ---
    const renderContent = () => {
        switch (activeView) {
            case 'reports':
                return (
                    <div className="flex flex-col items-center justify-center p-12 h-96 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                        <div className="size-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 text-gray-400">
                            <BarChart3 className="w-8 h-8" />
                        </div>
                        <h5 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Financial Reports Coming Soon</h5>
                        <p className="text-sm text-gray-400 mt-2">Module v2.0 in development</p>
                    </div>
                );

            case 'kitchen':
            default:
                return (
                    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#1a1a1a]/80 shadow-sm overflow-hidden min-h-[500px] flex flex-col">

                        {/* Table Header Stats */}
                        <div className="p-4 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center bg-gray-50/50 dark:bg-white/5 gap-3">
                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Live Prep List
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <Badge variant="light" color="light">
                                    {bookings.length} Stations
                                </Badge>
                                <Badge variant="light" color="warning">
                                    {bookings.filter(b => b.profiles?.dietary_profile !== 'diet_regular').length} Specials
                                </Badge>
                            </div>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            {loading ? (
                                <div className="p-12 text-center text-gray-400">Loading Prep List...</div>
                            ) : (
                                <div className="inline-block min-w-full align-middle">
                                    <Table>
                                        <TableHeader className="bg-gray-50/50 dark:bg-white/5">
                                            <TableRow className="border-b border-gray-100 dark:border-white/5">
                                                <TableCell isHeader className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Chef Name</TableCell>
                                                <TableCell isHeader className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Pax</TableCell>
                                                <TableCell isHeader className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dietary Protocol</TableCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {bookings.length > 0 ? bookings.map((r: any) => {
                                                const diet = r.profiles?.dietary_profile?.replace('diet_', '') || 'Regular';
                                                const allergies = r.profiles?.allergies || [];
                                                const isSpecial = diet !== 'Regular' || allergies.length > 0;

                                                return (
                                                    <TableRow key={r.internal_id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                                        {/* Chef Name */}
                                                        <TableCell className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 shadow-inner">
                                                                    {(r.profiles?.full_name || 'G').charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <span className="font-bold text-gray-900 dark:text-white block">{r.profiles?.full_name || 'Guest'}</span>
                                                                    <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
                                                                        #{r.internal_id.slice(0, 6)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        {/* Pax */}
                                                        <TableCell className="px-6 py-4 text-center">
                                                            <span className="font-mono font-bold text-lg text-gray-800 dark:text-gray-200">{r.pax_count}</span>
                                                        </TableCell>

                                                        {/* Dietary */}
                                                        <TableCell className="px-6 py-4">
                                                            <div className="flex flex-col gap-2 items-start">
                                                                <Badge
                                                                    variant={isSpecial ? "solid" : "light"}
                                                                    color={isSpecial ? "warning" : "light"}
                                                                >
                                                                    {diet.toUpperCase()}
                                                                </Badge>

                                                                {allergies.length > 0 && (
                                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                                                                        <AlertTriangle className="w-3 h-3 text-red-500" />
                                                                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{allergies.join(', ')}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            }) : (
                                                <TableRow>
                                                    <TableCell className="px-6 py-12 text-center text-gray-400 italic" isHeader={false}> {/* Should ideally span columns, but simple is fine for now */}
                                                        No cooks found for this session.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="p-0">
            <div className="flex flex-col gap-6 w-full mx-auto">

                {/* HEADER */}
                <div className="flex flex-col gap-4 pb-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h5 className="text-gray-400 uppercase tracking-widest text-xs font-bold">Operations</h5>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white mt-1">Booking Overview</h3>
                        </div>
                    </div>

                    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                        {/* Custom Tabs */}
                        <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                            {NAV_TABS.map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setActiveView(tab.value as DashboardView)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                        activeView === tab.value
                                            ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm"
                                            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                    )}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <AdminClassPicker
                            date={globalDate}
                            onDateChange={setGlobalDate}
                            session={globalSession}
                            onSessionChange={setGlobalSession}
                            className="shadow-sm"
                        />
                    </div>
                </div>

                {/* CONTENT */}
                <div className="flex-1 min-h-0 relative">
                    {renderContent()}
                </div>

            </div>
        </div>
    );
};

export default BookingOverview;
