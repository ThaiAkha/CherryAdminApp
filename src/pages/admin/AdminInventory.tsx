import React from 'react';
import {
    Plus,
    FileSpreadsheet,
    FileJson,
    Copy,
    Edit,
    Save,
} from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import Button from '../../components/ui/button/Button';
import { PRIMARY_BTN } from '../../components/data-explorer/DataExplorerToolbar';
import Tooltip from '../../components/ui/Tooltip';
import { Dropdown } from '../../components/ui/dropdown/Dropdown';
import { DropdownItem } from '../../components/ui/dropdown/DropdownItem';
import {
    DataExplorerLayout,
    DataExplorerToolbar,
    DataExplorerInspector,
} from '../../components/data-explorer';

// Modular Components
import InventorySidebar from '../../components/admin/inventory/InventorySidebar';
import InventoryContent from '../../components/admin/inventory/InventoryContent';
import InventoryInspector from '../../components/admin/inventory/InventoryInspector';

// Logic Hook
import { useAdminInventory } from '../../hooks/useAdminInventory';

const AdminInventory: React.FC = () => {
    const {
        loading,
        isSaving,
        categories,
        selectedCategoryId,
        setSelectedCategoryId,
        searchTerm,
        setSearchTerm,
        viewMode,
        setViewMode,
        isInspectorOpen,
        isExportOpen,
        setIsExportOpen,
        selectedIds,
        editingProduct,
        setEditingProduct,
        isNew,
        isEditing,
        setIsEditing,
        fetchData,
        handleProductSelect,
        handleCreateNew,
        handleSave,
        handleDelete,
        toggleSelectAll,
        toggleSelectRow,
        exportToCSV,
        exportToJSON,
        copyToClipboard,
        filteredProducts,
        closeInspector
    } = useAdminInventory();

    return (
        <>
            <PageMeta
                title="Inventory | Admin"
                description="Manage product catalog, stock levels, and pricing."
            />

            <DataExplorerLayout
                viewMode={viewMode}
                inspectorOpen={isInspectorOpen}
                onInspectorClose={closeInspector}
                sidebar={
                    <InventorySidebar
                        categories={categories}
                        selectedCategoryId={selectedCategoryId}
                        onSelect={setSelectedCategoryId}
                    />
                }
                toolbar={
                    <DataExplorerToolbar
                        primaryAction={
                            <button type="button" onClick={handleCreateNew} className={PRIMARY_BTN}>
                                <Plus className="w-4 h-4" />
                                NEW ITEM
                            </button>
                        }
                        searchPlaceholder="Search products or SKU..."
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        onRefresh={fetchData}
                        isRefreshing={loading}
                        onExportClick={() => setIsExportOpen(!isExportOpen)}
                        exportDropdown={
                            <Dropdown isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} className="w-56 mt-2 left-0 shadow-2xl border-brand-100 dark:border-brand-500/20">
                                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Export formats</p>
                                </div>
                                <DropdownItem onClick={exportToCSV} className="flex items-center gap-3 px-3 py-2.5 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors">
                                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Google Sheets / CSV</p>
                                        <p className="text-[10px] text-gray-400">Standard spreadsheet format</p>
                                    </div>
                                </DropdownItem>
                                <DropdownItem onClick={exportToJSON} className="flex items-center gap-3 px-3 py-2.5 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors">
                                    <FileJson className="w-4 h-4 text-blue-600" />
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">JSON Format</p>
                                        <p className="text-[10px] text-gray-400">Raw data structure</p>
                                    </div>
                                </DropdownItem>
                                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                                <DropdownItem onClick={copyToClipboard} className="flex items-center gap-3 px-3 py-2.5 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors">
                                    <Copy className="w-4 h-4 text-brand-600" />
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Copy to Clipboard</p>
                                        <p className="text-[10px] text-gray-400">Quick share as text</p>
                                    </div>
                                </DropdownItem>
                            </Dropdown>
                        }
                    />
                }
                inspector={
                    <DataExplorerInspector
                        isEditing={isEditing}
                        onClose={closeInspector}
                        headerActions={
                            !isNew && editingProduct.id && !isEditing ? (
                                <Tooltip content="Edit this record" position="left">
                                    <Button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        variant="olive"
                                        size="sm"
                                        className="h-9 px-4 text-[11px] font-black uppercase tracking-widest shadow-md shadow-blue-500/20 transition-all active:scale-90"
                                        startIcon={<Edit className="w-5 h-5 text-white" />}
                                    >
                                        EDIT
                                    </Button>
                                </Tooltip>
                            ) : (isEditing || isNew) ? (
                                <Tooltip content="Save changes" position="left">
                                    <Button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        variant="primary" // Standardized to orange primary
                                        size="sm"
                                        className="h-9 px-4 text-[11px] font-black uppercase tracking-widest border-none transition-all active:scale-90"
                                        startIcon={<Save className="w-5 h-5 text-white" />}
                                    >
                                        {isSaving ? 'SAVING...' : 'SAVE'}
                                    </Button>
                                </Tooltip>
                            ) : null
                        }
                    >
                        <InventoryInspector
                            editingProduct={editingProduct}
                            onEditingProductChange={setEditingProduct}
                            categories={categories}
                            isEditing={isEditing}
                            isNew={isNew}
                            onDelete={handleDelete}
                        />
                    </DataExplorerInspector>
                }
            >
                <InventoryContent
                    loading={loading && filteredProducts.length === 0}
                    viewMode={viewMode}
                    filteredProducts={filteredProducts}
                    editingProduct={editingProduct}
                    onProductSelect={handleProductSelect}
                    selectedIds={selectedIds}
                    onToggleSelectAll={toggleSelectAll}
                    onToggleSelectRow={toggleSelectRow}
                />
            </DataExplorerLayout>
        </>
    );
};

export default AdminInventory;
