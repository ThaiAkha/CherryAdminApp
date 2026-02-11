import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/button/Button';
import Badge from '../components/ui/badge/Badge';
import Avatar from '../components/ui/avatar/Avatar';
import { cn } from '../lib/utils';
import { authService } from '../services/auth.service';
import {
    Map, MessageSquare, CheckCircle2, ArrowRight, Flag,
    Sun, Moon, Bus
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';

// --- CONFIGURAZIONE STATI ---
type TransportStatus = 'waiting' | 'driver_en_route' | 'driver_arrived' | 'on_board' | 'dropped_off';

const STATUS_CONFIG: Record<TransportStatus, { label: string; actionLabel: string; color: string; next: TransportStatus | null }> = {
    waiting: {
        label: 'WAITING',
        actionLabel: 'START PICKUP',
        color: 'bg-white text-black hover:bg-white/90',
        next: 'driver_en_route'
    },
    driver_en_route: {
        label: 'EN ROUTE',
        actionLabel: 'I AM HERE',
        color: 'bg-blue-600 text-white hover:bg-blue-700',
        next: 'driver_arrived'
    },
    driver_arrived: {
        label: 'AT LOBBY',
        actionLabel: 'PICK UP PAX',
        color: 'bg-yellow-500 text-black hover:bg-yellow-400',
        next: 'on_board'
    },
    on_board: {
        label: 'ON BOARD',
        actionLabel: 'DROPPED OFF',
        color: 'bg-green-600 text-white hover:bg-green-700',
        next: 'dropped_off'
    },
    dropped_off: {
        label: 'COMPLETED',
        actionLabel: 'DONE',
        color: 'bg-gray-700 text-gray-400 cursor-not-allowed',
        next: null
    }
};

const getLocalDate = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
};

const DriverDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate: _onNavigate }) => {
    const [userProfile, setUserProfile] = useState<any>(null);
    const [stops, setStops] = useState<any[]>([]);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [activeDate] = useState(getLocalDate());
    const [sessionFilter, setSessionFilter] = useState<'morning_class' | 'evening_class'>('morning_class');

    useEffect(() => {
        const initAuth = async () => {
            const profile = await authService.getCurrentUserProfile();
            setUserProfile(profile);
        };
        initAuth();
    }, []);

    const fetchRoute = async () => {
        if (!userProfile) return;
        try {
            let query = supabase
                .from('bookings')
                .select(`
                    internal_id, status, pax_count, hotel_name, pickup_zone, pickup_time, phone_number, customer_note, session_id, route_order,
                    pickup_driver_uid, transport_status,
                    profiles: user_id(full_name, avatar_url)
                `)
                .eq('booking_date', activeDate)
                .neq('status', 'cancelled');

            if (userProfile.role !== 'admin') {
                query = query.or(`pickup_driver_uid.eq.${userProfile.id}, pickup_driver_uid.is.null`);
            }

            const { data } = await query
                .order('route_order', { ascending: true })
                .order('pickup_time', { ascending: true });

            if (data) {
                setStops(data.map((b: any) => ({
                    ...b,
                    guest_name: b.profiles?.full_name || 'Guest',
                    avatar_url: b.profiles?.avatar_url
                })));
            }
        } catch (error) {
            console.error("Error fetching route:", error);
        }
    };

    useEffect(() => {
        if (userProfile) fetchRoute();
        const interval = setInterval(fetchRoute, 25000);
        return () => clearInterval(interval);
    }, [activeDate, userProfile]);

    const handleClickAction = (stop: any) => {
        if (confirmId === stop.internal_id) {
            handleStatusChange(stop);
            setConfirmId(null);
        } else {
            setConfirmId(stop.internal_id);
            setTimeout(() => setConfirmId(null), 3000);
        }
    };

    const handleStatusChange = async (stop: any, nextStatusOverride?: TransportStatus) => {
        const config = STATUS_CONFIG[stop.transport_status as TransportStatus];
        const nextStatus = nextStatusOverride || config.next;

        if (!nextStatus) return;

        await supabase.from('bookings').update({
            transport_status: nextStatus as string,
            actual_pickup_time: nextStatus === 'on_board' ? new Date().toISOString() : null,
            pickup_driver_uid: userProfile.id
        }).eq('internal_id', stop.internal_id);

        if (nextStatus === 'on_board') {
            const currentOrder = stop.route_order || 0;
            const nextStop = stops.find(s =>
                s.session_id === stop.session_id &&
                s.transport_status === 'waiting' &&
                s.route_order > currentOrder
            );

            if (nextStop) {
                await supabase.from('bookings').update({
                    transport_status: 'driver_en_route'
                }).eq('internal_id', nextStop.internal_id);
            }
        }

        fetchRoute();
    };

    const handleStartRoute = async () => {
        const firstStop = visibleStops.find(s => s.transport_status === 'waiting');
        if (firstStop) {
            await handleStatusChange(firstStop, 'driver_en_route');
        } else {
            alert("No waiting stops to start.");
        }
    };

    const handleArriveDestination = async () => {
        if (!confirm("Finish all active rides?")) return;
        const onboardIds = visibleStops.filter(s => s.transport_status === 'on_board').map(s => s.internal_id);
        if (onboardIds.length > 0) {
            await supabase.from('bookings').update({
                transport_status: 'dropped_off',
                actual_dropoff_time: new Date().toISOString()
            }).in('internal_id', onboardIds);
            fetchRoute();
        }
    };

    const openMap = (hotel: string) => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel + " Chiang Mai")}`, '_blank');
    const handleWhatsApp = (phone: string) => window.open(`https://wa.me/${phone?.replace(/[^0-9]/g, '')}?text=Sawasdee%20kha%20Driver%20is%20at%20lobby`, '_blank');

    const visibleStops = useMemo(() => stops.filter(s => s.session_id === sessionFilter), [stops, sessionFilter]);
    const completedPax = visibleStops.filter(s => s.transport_status === 'on_board' || s.transport_status === 'dropped_off').reduce((sum, s) => sum + s.pax_count, 0);
    const totalPax = visibleStops.reduce((sum, s) => sum + s.pax_count, 0);

    const isRouteStarted = visibleStops.some(s => s.transport_status !== 'waiting');
    const showFinalButton = visibleStops.some(s => s.transport_status === 'on_board');

    return (
        <div className="min-h-screen bg-black pb-48 font-sans text-white">
            <PageHeader
                title="Driver Console"
                subtitle={`Operational Route: ${activeDate}`}
                className="px-6 pt-8 mb-6 border-b border-white/5 pb-6 sticky top-0 z-50 bg-black/90 backdrop-blur-xl"
            >
                <div className="flex flex-col items-end gap-3">
                    <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                        <span className="text-2xl font-mono font-black text-brand-500 leading-none">{completedPax}</span>
                        <span className="text-sm font-bold text-white/40">/ {totalPax} Pax</span>
                    </div>
                </div>
            </PageHeader>

            <div className="px-4 mb-6">
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setSessionFilter('morning_class')}
                        className={cn(
                            "flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                            sessionFilter === 'morning_class' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white/60"
                        )}
                    >
                        <Sun className="w-4 h-4" /> AM
                    </button>
                    <button
                        onClick={() => setSessionFilter('evening_class')}
                        className={cn(
                            "flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                            sessionFilter === 'evening_class' ? "bg-[#121212] text-white shadow-lg border border-white/10" : "text-white/40 hover:text-white/60"
                        )}
                    >
                        <Moon className="w-4 h-4" /> PM
                    </button>
                </div>
            </div>

            <PageContainer className="p-4 space-y-6">
                {!isRouteStarted && visibleStops.length > 0 && (
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleStartRoute}
                        className="w-full h-16 text-lg font-black shadow-[0_0_40px_rgba(227,31,51,0.4)] animate-pulse bg-brand-600 hover:bg-brand-700 text-white"
                    >
                        <Bus className="w-5 h-5 mr-2" />
                        Start Pickup Route
                    </Button>
                )}

                {visibleStops.map((stop, index) => {
                    const statusCfg = STATUS_CONFIG[stop.transport_status as TransportStatus];
                    const isDone = stop.transport_status === 'dropped_off';
                    const isOnBoard = stop.transport_status === 'on_board';
                    const isActiveStep = stop.transport_status !== 'waiting' || (stop.transport_status === 'waiting' && index === 0 && !isRouteStarted) || (stop.transport_status === 'waiting' && stops[index - 1]?.transport_status === 'on_board');
                    const isConfirming = confirmId === stop.internal_id;

                    if (isDone) {
                        return (
                            <div key={stop.internal_id} className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-white/5 rounded-2xl opacity-50 grayscale">
                                <div className="flex items-center gap-4">
                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    <div>
                                        <div className="text-white font-bold line-through decoration-white/30">{stop.guest_name}</div>
                                        <div className="text-[10px] text-white/40 uppercase">{stop.hotel_name}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={stop.internal_id} className={cn(
                            "relative rounded-[2rem] border overflow-hidden transition-all duration-500",
                            isOnBoard ? "bg-green-900/10 border-green-500/30 shadow-lg" :
                                isActiveStep ? "bg-[#1a1a1a] border-white/10 shadow-2xl" :
                                    "bg-black/40 border-white/5 opacity-60"
                        )}>
                            <div className={cn("flex justify-between items-stretch border-b", isOnBoard ? "bg-green-500/10 border-green-500/20" : "bg-white/5 border-white/5")}>
                                <div className="px-5 py-4 flex items-center gap-3">
                                    <span className="font-mono text-2xl font-black tracking-tighter text-white">{stop.pickup_time?.slice(0, 5)}</span>
                                    <Badge variant="light" color="light" className="text-[9px] px-2 h-5 bg-white/5 text-white/60">{stop.pickup_zone?.toUpperCase()}</Badge>
                                </div>
                                <div className="px-5 flex items-center justify-center bg-black/20 border-l border-white/5 min-w-[4rem]">
                                    <span className={cn("text-xl font-black", isOnBoard ? "text-green-400" : "text-white")}>{stop.pax_count}p</span>
                                </div>
                            </div>

                            <div className="p-5 space-y-5">
                                <div className="flex items-center gap-4">
                                    <Avatar src={stop.avatar_url} alt={stop.guest_name} size="medium" />
                                    <div className="min-w-0">
                                        <h5 className="truncate leading-none mb-1 text-lg font-bold text-white">{stop.guest_name}</h5>
                                        {stop.customer_note ? <p className="text-[10px] text-yellow-500 italic truncate font-bold">⚠️ "{stop.customer_note}"</p> : <p className="text-[10px] text-white/30 font-bold uppercase">No Notes</p>}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={() => openMap(stop.hotel_name)} className="flex-1 flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-black/40 hover:bg-white/5 transition-all text-left group">
                                        <Map className="w-5 h-5 text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-bold truncate text-white/90">{stop.hotel_name}</span>
                                    </button>
                                    <button onClick={() => handleWhatsApp(stop.phone_number)} className="size-14 rounded-xl bg-green-900/20 border border-green-500/30 flex items-center justify-center text-green-500 hover:bg-green-900/40 transition-all">
                                        <MessageSquare className="w-6 h-6" />
                                    </button>
                                </div>

                                {(isActiveStep || isOnBoard) && (
                                    <button
                                        onClick={() => handleClickAction(stop)}
                                        className={cn(
                                            "w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm transition-all shadow-lg active:scale-95",
                                            isConfirming
                                                ? "bg-red-500 text-white border-red-400 animate-pulse"
                                                : statusCfg.color
                                        )}
                                    >
                                        {isConfirming ? (
                                            <>CONFIRM ACTION?</>
                                        ) : (
                                            <>{statusCfg.actionLabel} {isOnBoard ? <CheckCircle2 className="w-5 h-5 animate-bounce" /> : <ArrowRight className="w-5 h-5 animate-bounce" />}</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {showFinalButton && (
                    <div className="pt-8">
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleArriveDestination}
                            className="w-full shadow-xl h-16 rounded-2xl text-lg font-black"
                        >
                            <Flag className="w-6 h-6 mr-2" />
                            Arrive at Destination
                        </Button>
                    </div>
                )}
            </PageContainer>
        </div>
    );
};

export default DriverDashboard;
