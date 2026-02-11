import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import Avatar from '../components/ui/avatar/Avatar';
import Badge from '../components/ui/badge/Badge';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import { cn } from '../lib/utils';
import {
    Search, ShoppingBag, Users, CreditCard, Trash2, X, Receipt
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import PageGrid from '../components/layout/PageGrid';
import PageHeader from '../components/layout/PageHeader';

// --- TYPES ---
interface Guest {
    internal_id: string;
    full_name: string;
    avatar_url?: string;
    pax_count: number;
    session_name: string;
    session_id: string;
    status: string;
}

interface Product {
    sku: string;
    name: string;
    price: number;
    category: string;
    sub_category?: string;
    stock: number;
    description?: string;
    image?: string;
}

interface OrderItem {
    id?: string;
    sku: string;
    name: string;
    price: number;
    quantity: number;
    status: 'new' | 'pending' | 'paid';
}

const CAT_ICONS: Record<string, React.ReactNode> = {
    beer: <ShoppingBag className="w-4 h-4" />,
    wine: <ShoppingBag className="w-4 h-4" />,
    soft_drink: <ShoppingBag className="w-4 h-4" />,
    merch: <ShoppingBag className="w-4 h-4" />,
    energy: <ShoppingBag className="w-4 h-4" />,
    coffee: <ShoppingBag className="w-4 h-4" />
};

const SUB_LABELS: Record<string, string> = {
    bottle_big: 'Big Bottles',
    bottle_small: 'Small Bottles',
    can: 'Cans',
    import: 'Import / Craft',
    apparel: 'Apparel',
    gear: 'Equipment',
    red: 'Red Wine',
    white: 'White Wine',
    cooler: 'Coolers',
    general: 'General',
    all: 'All'
};

const StoreFront: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate: _onNavigate }) => {
    // --- STATE ---
    const [loading, setLoading] = useState(true);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    // Filters
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSession, setSelectedSession] = useState<'morning' | 'evening'>('morning');
    const [activeCategory, setActiveCategory] = useState<string>('beer');
    const [activeSubCategory, setActiveSubCategory] = useState<string>('all');

    // Selection & Orders
    const [activeGuestId, setActiveGuestId] = useState<string | null>(null);
    const [currentTab, setCurrentTab] = useState<OrderItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- 1. DATA LOADING ---
    const initData = async () => {
        setLoading(true);
        try {
            const { data: bookings } = await supabase
                .from('bookings')
                .select(`
          internal_id, pax_count, status, session_id,
          profiles:user_id (full_name, avatar_url),
          class_sessions (display_name)
        `)
                .eq('booking_date', selectedDate)
                .neq('status', 'cancelled')
                .order('pickup_time', { ascending: true });

            const { data: shopItems } = await supabase
                .from('shop_akha')
                .select('*')
                .eq('is_active', true);

            setGuests(bookings?.map((b: any) => ({
                internal_id: b.internal_id,
                full_name: b.profiles?.full_name || 'Walk-in Guest',
                avatar_url: b.profiles?.avatar_url,
                pax_count: b.pax_count,
                session_name: b.class_sessions?.display_name || 'Class',
                session_id: b.session_id,
                status: b.status
            })) || []);

            setProducts(shopItems?.map((p: any) => ({
                sku: p.sku,
                name: p.item_name,
                price: p.price_thb,
                stock: p.stock_quantity,
                category: p.category_id,
                sub_category: p.sub_category || 'general',
                description: p.description_internal,
                image: p.catalog_image_url
            })) || []);
        } catch (err) { console.error("POS Error:", err); }
        finally { setLoading(false); }
    };

    useEffect(() => { initData(); }, [selectedDate]);

    useEffect(() => {
        if (!activeGuestId) { setCurrentTab([]); return; }
        const fetchOrders = async () => {
            const { data } = await supabase
                .from('shop_orders')
                .select(`id, sku, quantity, unit_price_snapshot, status, shop_akha(item_name)`)
                .eq('booking_id', activeGuestId);

            setCurrentTab(data?.map((o: any) => ({
                id: o.id,
                sku: o.sku,
                name: o.shop_akha?.item_name || 'Item',
                price: o.unit_price_snapshot,
                quantity: o.quantity,
                status: o.status
            })) || []);
        };
        fetchOrders();
    }, [activeGuestId]);

    // --- 2. ACTIONS ---
    const addToTab = (product: Product) => {
        if (!activeGuestId) return alert("Select a guest first kha!");
        if (product.stock <= 0) return alert("Out of stock!");

        setCurrentTab(prev => {
            const existingIdx = prev.findIndex(item => item.sku === product.sku && item.status === 'new');
            if (existingIdx >= 0) {
                const updated = [...prev];
                updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + 1 };
                return updated;
            }
            return [...prev, { sku: product.sku, name: product.name, price: product.price, quantity: 1, status: 'new' }];
        });
    };

    const handleRemoveItem = async (item: OrderItem) => {
        if (item.status === 'paid') return;
        if (item.status === 'new') {
            setCurrentTab(prev => {
                if (item.quantity > 1) return prev.map(i => i.sku === item.sku && i.status === 'new' ? { ...i, quantity: i.quantity - 1 } : i);
                return prev.filter(i => !(i.sku === item.sku && i.status === 'new'));
            });
            return;
        }
        if (item.status === 'pending') {
            try {
                if (item.quantity > 1) {
                    await supabase.from('shop_orders').update({ quantity: item.quantity - 1 }).eq('id', item.id);
                    setCurrentTab(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i));
                } else {
                    await supabase.from('shop_orders').delete().eq('id', item.id);
                    setCurrentTab(prev => prev.filter(i => i.id !== item.id));
                }
            } catch (e) { console.error(e); }
        }
    };

    const handleSaveConfirmed = async () => {
        if (!activeGuestId) return;
        setIsProcessing(true);
        try {
            const newItems = currentTab.filter(i => i.status === 'new');
            if (newItems.length > 0) {
                const payload = newItems.map(i => ({ booking_id: activeGuestId, sku: i.sku, quantity: i.quantity, unit_price_snapshot: i.price, status: 'pending' }));
                await supabase.from('shop_orders').insert(payload);
                initData(); // Refresh list/state
            }
        } finally { setIsProcessing(false); }
    };

    const handlePayCash = async () => {
        const totalDue = currentTab.reduce((acc, i) => i.status !== 'paid' ? acc + (i.price * i.quantity) : acc, 0);
        if (!activeGuestId || totalDue === 0) return;
        if (!window.confirm(`Charge ${totalDue} THB to cash?`)) return;
        setIsProcessing(true);
        try {
            const unpaid = currentTab.filter(i => i.status !== 'paid');
            for (const item of unpaid) {
                const prod = products.find(p => p.sku === item.sku);
                if (prod) await supabase.from('shop_akha').update({ stock_quantity: Math.max(0, prod.stock - item.quantity) }).eq('sku', item.sku);
                if (item.id) await supabase.from('shop_orders').update({ status: 'paid' }).eq('id', item.id);
                else await supabase.from('shop_orders').update({ status: 'paid' }).match({ booking_id: activeGuestId, sku: item.sku, status: 'pending' });
            }
            initData();
        } finally { setIsProcessing(false); }
    };

    // --- 3. HELPERS ---
    const filteredGuests = useMemo(() => guests.filter(g => g.session_id.includes(selectedSession)), [guests, selectedSession]);
    const activeGuest = guests.find(g => g.internal_id === activeGuestId);
    const totalDue = currentTab.reduce((acc, i) => i.status !== 'paid' ? acc + (i.price * i.quantity) : acc, 0);

    const mainCategories = useMemo(() => {
        const uniqueCats = Array.from(new Set(products.map(p => p.category)));
        return uniqueCats.map(cat => ({ value: cat, label: cat.replace(/_/g, ' '), icon: CAT_ICONS[cat] }));
    }, [products]);

    const subCategoryTabs = useMemo(() => {
        const tabs = [{ value: 'all', label: 'All' }];
        const subs = Array.from(new Set(products.filter(p => p.category === activeCategory).map(p => p.sub_category || 'general')));
        subs.filter(s => s !== 'general').forEach(sub => tabs.push({ value: sub, label: SUB_LABELS[sub] || sub }));
        return tabs;
    }, [products, activeCategory]);

    const displayedProducts = useMemo(() => {
        return products.filter(p => p.category === activeCategory && (activeSubCategory === 'all' || p.sub_category === activeSubCategory));
    }, [products, activeCategory, activeSubCategory]);

    // --- 4. RENDER ---
    return (
        <PageContainer className="h-[calc(100vh-64px)] flex flex-col">
            <PageHeader
                title="Store Front"
                subtitle="Manage on-site sales, merchandise, and guest tabs during classes."
            >
                <div className="flex items-center gap-3">
                    <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="!h-10 !py-0 !px-4 text-sm font-bold w-auto rounded-xl"
                    />
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl h-10 items-center">
                        {(['morning', 'evening'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setSelectedSession(s)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all h-full flex items-center",
                                    selectedSession === s
                                        ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm"
                                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                )}
                            >
                                {s === 'morning' ? 'AM' : 'PM'}
                            </button>
                        ))}
                    </div>
                </div>
            </PageHeader>

            <PageGrid columns={12} className="flex-1 min-h-0 relative">
                {loading && <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm"><div className="loader">Loading...</div></div>}

                {/* --- LEFT PANE (Guests) --- */}
                <div className="lg:col-span-3 flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <h6 className="uppercase tracking-widest text-xs font-bold text-gray-500">Guest List</h6>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {filteredGuests.map(g => (
                            <button
                                key={g.internal_id}
                                onClick={() => setActiveGuestId(g.internal_id)}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all group",
                                    activeGuestId === g.internal_id
                                        ? "bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-400"
                                        : "bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                                )}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Avatar src={g.avatar_url || ''} alt={g.full_name} size="xsmall" />
                                    <div className="truncate">
                                        <span className="block text-xs font-bold truncate">{g.full_name}</span>
                                        <span className="block text-[9px] text-gray-400 uppercase">{g.status}</span>
                                    </div>
                                </div>
                                <Badge variant="light" color="light" size="sm" className="shrink-0">{g.pax_count}P</Badge>
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- CENTER PANE (Catalog) --- */}
                <div className="lg:col-span-6 flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden relative">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-black uppercase text-gray-900 dark:text-white flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" />
                                Catalog
                            </h3>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[50%]">
                                {mainCategories.map(cat => (
                                    <button
                                        key={cat.value}
                                        onClick={() => { setActiveCategory(cat.value); setActiveSubCategory('all'); }}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap transition-all border",
                                            activeCategory === cat.value
                                                ? "bg-brand-600 text-white border-brand-600"
                                                : "bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                        )}
                                    >
                                        {cat.icon}
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {subCategoryTabs.map(sub => (
                                <button
                                    key={sub.value}
                                    onClick={() => setActiveSubCategory(sub.value)}
                                    className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap transition-all border",
                                        activeSubCategory === sub.value
                                            ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900 dark:border-white"
                                            : "bg-transparent text-gray-500 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                                    )}
                                >
                                    {sub.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 content-start">
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
                            {displayedProducts.map(p => (
                                <button
                                    key={p.sku}
                                    onClick={() => addToTab(p)}
                                    className="group relative flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-brand-500 dark:hover:border-brand-500 transition-all text-left shadow-sm hover:shadow-md"
                                >
                                    <div className="aspect-square bg-gray-100 dark:bg-gray-900 overflow-hidden relative">
                                        {p.image ? (
                                            <img src={p.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={p.name} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <ShoppingBag className="w-8 h-8" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-mono text-white backdrop-blur-sm">
                                            x{p.stock}
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h6 className="text-xs font-bold text-gray-900 dark:text-white uppercase truncate mb-1">{p.name}</h6>
                                        <span className="text-sm font-mono font-black text-brand-600 dark:text-brand-400">{p.price} <span className="text-[9px] text-gray-400">THB</span></span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT PANE (Tab) --- */}
                <div className="lg:col-span-3 flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
                        <div className="flex flex-col">
                            <h6 className="uppercase tracking-widest text-xs font-bold text-gray-500">Current Tab</h6>
                            <span className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{activeGuest?.full_name || "Select Guest"}</span>
                        </div>
                        {activeGuestId && (
                            <button onClick={() => setActiveGuestId(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {!activeGuestId ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50 space-y-2">
                                <Search className="w-8 h-8" />
                                <span className="text-xs font-medium">Select a guest first</span>
                            </div>
                        ) : currentTab.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50 space-y-2">
                                <Receipt className="w-8 h-8" />
                                <span className="text-xs font-medium">Empty Tab</span>
                            </div>
                        ) : (
                            currentTab.map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-center group animate-in slide-in-from-right-2 fade-in duration-300">
                                    <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 flex justify-between items-center border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={cn(
                                                "size-6 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0",
                                                item.status === 'new' ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-700"
                                            )}>
                                                {item.quantity}
                                            </div>
                                            <span className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.name}</span>
                                        </div>
                                        <span className="text-xs font-mono text-gray-500 ml-2">{item.price * item.quantity}</span>
                                    </div>
                                    {item.status !== 'paid' && (
                                        <button
                                            onClick={() => handleRemoveItem(item)}
                                            className="size-8 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount</span>
                            <span className="text-xl font-mono font-black text-gray-900 dark:text-white">{totalDue.toLocaleString()} <span className="text-xs text-gray-400 font-normal">THB</span></span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                onClick={handleSaveConfirmed}
                                disabled={isProcessing || !activeGuestId || currentTab.filter(i => i.status === 'new').length === 0}
                                className="w-full justify-center"
                            >
                                Save Tab
                            </Button>
                            <Button
                                variant="primary"
                                startIcon={<CreditCard className="w-4 h-4" />}
                                onClick={handlePayCash}
                                disabled={isProcessing || totalDue === 0}
                                className="w-full justify-center bg-green-600 hover:bg-green-700 text-white ring-0"
                            >
                                Pay Cash
                            </Button>
                        </div>
                    </div>
                </div>

            </PageGrid>
        </PageContainer>
    );
};

export default StoreFront;
