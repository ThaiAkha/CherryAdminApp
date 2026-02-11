import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import TextArea from '../components/form/input/TextArea';
import Badge from '../components/ui/badge/Badge';
import { cn } from '../lib/utils';
import {
    Plus, Save, Trash2, Filter,
    ShoppingBag, Package, Image as ImageIcon,
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import PageGrid from '../components/layout/PageGrid';

// --- TYPES ---
interface Product {
    id?: string;
    sku: string;
    item_name: string;
    description_internal: string;
    price_thb: number;
    cost_thb: number;
    stock_quantity: number;
    category_id: string;
    sub_category: string;
    catalog_image_url: string;
    is_active: boolean;
    is_visible_online: boolean;
}

interface Category {
    id: string;
    title: string;
    icon_name: string;
}

const EMPTY_PRODUCT: Product = {
    sku: '',
    item_name: '',
    description_internal: '',
    price_thb: 0,
    cost_thb: 0,
    stock_quantity: 0,
    category_id: 'beer',
    sub_category: 'general',
    catalog_image_url: '',
    is_active: true,
    is_visible_online: false
};

const StoreManager: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

    // Editor State
    const [editingProduct, setEditingProduct] = useState<Product>(EMPTY_PRODUCT);
    const [isNew, setIsNew] = useState(true);

    // --- 1. INITIAL LOAD ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, catRes] = await Promise.all([
                supabase.from('shop_akha').select('*').order('item_name'),
                supabase.from('shop_categories').select('*').order('title')
            ]);

            if (prodRes.data) setProducts(prodRes.data);
            if (catRes.data) setCategories(catRes.data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- 2. FILTERING LOGIC ---
    const filteredProducts = useMemo(() => {
        if (selectedCategoryId === 'all') return products;
        return products.filter(p => p.category_id === selectedCategoryId);
    }, [products, selectedCategoryId]);

    // --- 3. ACTIONS ---
    const handleEdit = (product: Product) => {
        setEditingProduct({ ...product });
        setIsNew(false);
    };

    const handleReset = () => {
        setEditingProduct(EMPTY_PRODUCT);
        setIsNew(true);
    };

    const handleSave = async () => {
        if (!editingProduct.item_name || !editingProduct.sku) {
            alert("Please enter at least Name and SKU kha.");
            return;
        }

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('shop_akha')
                .upsert(editingProduct);

            if (error) throw error;

            await fetchData(); // Refresh list
            handleReset(); // Clear form
            alert("Product saved successfully kha!");
        } catch (err: any) {
            console.error("Save error:", err);
            alert("Failed to save: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!editingProduct.id) return;
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('shop_akha')
                .delete()
                .eq('id', editingProduct.id);

            if (error) throw error;
            await fetchData();
            handleReset();
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <PageContainer className="h-[calc(100vh-64px)]">
            <PageGrid columns={12} className="h-full relative">
                {loading && <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm"><div className="loader">Loading...</div></div>}

                {/* --- LEFT COL: Categories (2 cols) --- */}
                <div className="lg:col-span-2 flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                        <h6 className="uppercase tracking-widest text-xs font-bold text-gray-500 flex items-center gap-2">
                            <Filter className="w-4 h-4" /> Categories
                        </h6>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        <button
                            onClick={() => setSelectedCategoryId('all')}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-xs font-medium",
                                selectedCategoryId === 'all'
                                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 font-bold"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                        >
                            <div className={cn("size-6 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800", selectedCategoryId === 'all' && "bg-brand-100 dark:bg-brand-500/20")}>
                                <ShoppingBag className="w-3.5 h-3.5" />
                            </div>
                            All Items
                        </button>

                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategoryId(cat.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-xs font-medium",
                                    selectedCategoryId === cat.id
                                        ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 font-bold"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                )}
                            >
                                <div className={cn("size-6 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800", selectedCategoryId === cat.id && "bg-brand-100 dark:bg-brand-500/20")}>
                                    <Package className="w-3.5 h-3.5" />
                                </div>
                                <span className="truncate capitalize">{cat.title}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- CENTER COL: Product Grid (7 cols) --- */}
                <div className="lg:col-span-7 flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-black uppercase text-gray-900 dark:text-white flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" />
                                Inventory
                            </h3>
                            <span className="text-xs text-gray-400 font-medium">
                                {filteredProducts.length} items in {selectedCategoryId === 'all' ? 'All Categories' : selectedCategoryId}
                            </span>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleReset} startIcon={<Plus className="w-4 h-4" />}>
                            New Item
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 content-start">
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProducts.map(product => {
                                const isActive = editingProduct.id === product.id;
                                const isLowStock = product.stock_quantity < 5;

                                return (
                                    <div
                                        key={product.id}
                                        onClick={() => handleEdit(product)}
                                        className={cn(
                                            "group relative flex flex-col bg-white dark:bg-gray-800 rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-md",
                                            isActive
                                                ? "border-brand-500 ring-1 ring-brand-500"
                                                : "border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700"
                                        )}
                                    >
                                        <div className="aspect-square bg-gray-100 dark:bg-gray-900 overflow-hidden relative">
                                            {product.catalog_image_url ? (
                                                <img src={product.catalog_image_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={product.item_name} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <ImageIcon className="w-8 h-8" />
                                                </div>
                                            )}

                                            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                                {!product.is_active && <Badge variant="solid" color="error" size="sm" className="shadow-sm">Inactive</Badge>}
                                                {product.is_visible_online && <Badge variant="solid" color="info" size="sm" className="shadow-sm">Web</Badge>}
                                            </div>

                                            <div className={cn(
                                                "absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold backdrop-blur-md shadow-sm",
                                                isLowStock ? "bg-red-500/90 text-white" : "bg-black/60 text-white"
                                            )}>
                                                Qty: {product.stock_quantity}
                                            </div>
                                        </div>

                                        <div className="p-3">
                                            <h6 className="text-xs font-bold text-gray-900 dark:text-white uppercase truncate mb-1">{product.item_name}</h6>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-400 font-mono truncate">{product.sku}</span>
                                                <span className="text-xs font-black text-brand-600 dark:text-brand-400">{product.price_thb} ฿</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COL: Editor (3 cols) --- */}
                <div className="lg:col-span-3 flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
                        <h6 className="uppercase tracking-widest text-xs font-bold text-gray-500">
                            {isNew ? 'Create New' : 'Edit Item'}
                        </h6>
                        {!isNew && (
                            <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Image Preview / Input */}
                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative group border border-gray-200 dark:border-gray-700">
                            {editingProduct.catalog_image_url ? (
                                <img src={editingProduct.catalog_image_url} className="w-full h-full object-contain" alt="Preview" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                    <ImageIcon className="w-8 h-8 opacity-50" />
                                    <span className="text-[10px] uppercase font-bold">No Image</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 backdrop-blur-sm">
                                <Input
                                    placeholder="Image URL..."
                                    value={editingProduct.catalog_image_url}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, catalog_image_url: e.target.value })}
                                    className="!h-8 text-xs w-full bg-white/90"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Input
                                label="Product Name"
                                placeholder="Product Name"
                                value={editingProduct.item_name}
                                onChange={(e) => setEditingProduct({ ...editingProduct, item_name: e.target.value })}
                            />
                            <Input
                                label="SKU"
                                placeholder="SKU-CODE-01"
                                value={editingProduct.sku}
                                onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Price (THB)"
                                    type="number"
                                    value={editingProduct.price_thb}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, price_thb: Number(e.target.value) })}
                                />
                                <Input
                                    label="Cost (THB)"
                                    type="number"
                                    value={editingProduct.cost_thb}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, cost_thb: Number(e.target.value) })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Category</label>
                                    <select
                                        className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                        value={editingProduct.category_id}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <Input
                                    label="Stock Qty"
                                    type="number"
                                    value={editingProduct.stock_quantity}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: Number(e.target.value) })}
                                />
                            </div>

                            <TextArea
                                label="Internal Notes"
                                rows={3}
                                placeholder="Details..."
                                value={editingProduct.description_internal}
                                onChange={(e: any) => setEditingProduct({ ...editingProduct, description_internal: e.target.value })}
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase text-gray-500">Active</span>
                                    <input
                                        type="checkbox"
                                        checked={editingProduct.is_active}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
                                        className="accent-brand-600 size-4"
                                    />
                                </div>
                                <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase text-gray-500">Online</span>
                                    <input
                                        type="checkbox"
                                        checked={editingProduct.is_visible_online}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, is_visible_online: e.target.checked })}
                                        className="accent-blue-600 size-4"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
                        <Button
                            variant="primary"
                            className="w-full justify-center"
                            startIcon={<Save className="w-4 h-4" />}
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isNew ? 'Create Item' : 'Save Changes'}
                        </Button>
                        {!isNew && (
                            <Button
                                variant="outline"
                                className="w-full justify-center mt-2 text-gray-400 hover:text-gray-600"
                                onClick={handleReset}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            </PageGrid>
        </PageContainer>
    );
};

export default StoreManager;
