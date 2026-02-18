import React from 'react';
import {
    Plus,
    Save,
    Edit,
    FileSpreadsheet,
    FileJson,
    Copy,
} from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import Button from '../../components/ui/button/Button';
import Tooltip from '../../components/ui/Tooltip';
import { Dropdown } from '../../components/ui/dropdown/Dropdown';
import { DropdownItem } from '../../components/ui/dropdown/DropdownItem';
import {
    DataExplorerLayout,
    DataExplorerToolbar,
    DataExplorerInspector,
} from '../../components/data-explorer';
import { PRIMARY_BTN } from '../../components/data-explorer/DataExplorerToolbar';

// Modular Components
import DbSidebar from '../../components/admin/database/DbSidebar';
import DbContent from '../../components/admin/database/DbContent';
import DbInspector from '../../components/admin/database/DbInspector';

// Logic Hook
import { useAdminDatabase } from '../../hooks/useAdminDatabase';

const AdminDatabase: React.FC = () => {
    const {
        selectedTable,
        setSelectedTable,
        loading,
        selectedRow,
        setSelectedRow,
        isSaving,
        isEditing,
        setIsEditing,
        searchTerm,
        setSearchTerm,
        showDeleteConfirm,
        setShowDeleteConfirm,
        isExportOpen,
        setIsExportOpen,
        selectedIds,
        viewMode,
        setViewMode,
        columns,
        allColumns,
        filteredData,
        fetchTableData,
        handleSave,
        toggleSelectAll,
        toggleSelectRow,
        exportToJSON,
        exportToCSV,
        copyToClipboard,
        closeInspector
    } = useAdminDatabase();

    return (
        <>
            <PageMeta
                title="Admin Database Explorer | Thai Akha Kitchen"
                description="Manage raw system tables with safety constraints."
            />

            <DataExplorerLayout
                viewMode={viewMode}
                inspectorOpen={!!selectedRow}
                onInspectorClose={closeInspector}
                sidebar={
                    <DbSidebar
                        selectedTable={selectedTable}
                        onSelect={setSelectedTable}
                    />
                }
                toolbar={
                    <DataExplorerToolbar
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        searchPlaceholder={`Search ${selectedTable}...`}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        onRefresh={() => fetchTableData(selectedTable)}
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
                        primaryAction={
                            <Tooltip content="Insert new record" position="bottom">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRow({})}
                                    className={PRIMARY_BTN}
                                >
                                    <Plus className="w-4 h-4" />
                                    NEW ROW
                                </button>
                            </Tooltip>
                        }
                    />
                }
                inspector={
                    <DataExplorerInspector
                        isEditing={isEditing}
                        onClose={closeInspector}
                        headerActions={
                            !isEditing ? (
                                <Tooltip content="Edit this record" position="left">
                                    <Button
                                        type="button"
                                        onClick={() => { setIsEditing(true); setShowDeleteConfirm(false); }}
                                        variant="olive"
                                        size="md"
                                        className="h-9 px-4 text-[11px] font-black uppercase tracking-widest shadow-md shadow-blue-500/20 transition-all active:scale-90"
                                        startIcon={<Edit className="w-5 h-5 text-white" />}
                                    >
                                        EDIT
                                    </Button>
                                </Tooltip>
                            ) : (
                                <Tooltip content="Save modifications" position="left">
                                    <Button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        variant="olive"
                                        size="md"
                                        className="h-9 px-4 text-[11px] font-black uppercase tracking-widest border-none shadow-md shadow-green-500/20 transition-all active:scale-90"
                                        startIcon={<Save className="w-5 h-5 text-white" />}
                                    >
                                        {isSaving ? 'SAVING...' : 'SAVE'}
                                    </Button>
                                </Tooltip>
                            )
                        }
                    >
                        <DbInspector
                            selectedRow={selectedRow}
                            onRowChange={setSelectedRow}
                            allColumns={allColumns}
                            isEditing={isEditing}
                            showDeleteConfirm={showDeleteConfirm}
                            onShowDeleteConfirm={setShowDeleteConfirm}
                            onDelete={() => {
                                alert("Delete restricted for safety kha.");
                                setShowDeleteConfirm(false);
                            }}
                        />
                    </DataExplorerInspector>
                }
            >
                <DbContent
                    loading={loading}
                    viewMode={viewMode}
                    selectedTable={selectedTable}
                    filteredData={filteredData}
                    selectedRow={selectedRow}
                    onRowSelect={setSelectedRow}
                    columns={columns}
                    selectedIds={selectedIds}
                    onToggleSelectAll={toggleSelectAll}
                    onToggleSelectRow={toggleSelectRow}
                />
            </DataExplorerLayout>
        </>
    );
};

export default AdminDatabase;
