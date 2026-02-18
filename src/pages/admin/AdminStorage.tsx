import React from 'react';
import {
    Plus,
    Loader2,
    Save,
    Edit3,
} from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import Button from '../../components/ui/button/Button';
import Tooltip from '../../components/ui/Tooltip';
import {
    DataExplorerLayout,
    DataExplorerToolbar,
    DataExplorerInspector,
} from '../../components/data-explorer';

// Modular Components
import StorageSidebar from '../../components/admin/storage/StorageSidebar';
import StorageContent from '../../components/admin/storage/StorageContent';
import StorageInspector from '../../components/admin/storage/StorageInspector';

// Logic Hook
import { useAdminStorage } from '../../hooks/useAdminStorage';

const AdminStorage: React.FC = () => {
    const {
        buckets,
        selectedBucket,
        setSelectedBucket,
        filteredFiles,
        loading,
        selectedFile,
        isInspectorOpen,
        searchTerm,
        setSearchTerm,
        isUploading,
        copied,
        pendingFile,
        pendingFileName,
        setPendingFileName,
        viewMode,
        setViewMode,
        isEditing,
        setIsEditing,
        editingNameValue,
        setEditingNameValue,
        fetchFiles,
        handleFileSelect,
        handleCopyUrl,
        handleDelete,
        handleStageFile,
        handleConfirmUpload,
        handleRename,
        getFilePreview,
        closeInspector
    } = useAdminStorage();

    return (
        <>
            <PageMeta
                title="Admin Storage Explorer | Thai Akha Kitchen"
                description="Manage bucket files and media assets."
            />

            <DataExplorerLayout
                viewMode={viewMode}
                inspectorOpen={isInspectorOpen}
                onInspectorClose={closeInspector}
                sidebar={
                    <StorageSidebar
                        buckets={buckets}
                        selectedBucket={selectedBucket}
                        onSelect={setSelectedBucket}
                    />
                }
                toolbar={
                    <DataExplorerToolbar
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        searchPlaceholder="Search files..."
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        onRefresh={() => fetchFiles(selectedBucket)}
                        isRefreshing={loading}
                        primaryAction={
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleStageFile}
                                    disabled={isUploading}
                                />
                                <span className="h-9 px-4 inline-flex items-center gap-2 rounded-lg border border-orange-500 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-orange-600 hover:border-orange-600 transition-all active:scale-95 cursor-pointer">
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    {isUploading ? 'Uploading...' : 'Upload'}
                                </span>
                            </label>
                        }
                    />
                }
                inspector={
                    <DataExplorerInspector
                        isEditing={isEditing || !!pendingFile}
                        onClose={closeInspector}
                        headerActions={
                            !pendingFile && selectedFile ? (
                                !isEditing ? (
                                    <Tooltip content="Edit file metadata" position="left">
                                        <Button
                                            type="button"
                                            onClick={() => { setIsEditing(true); setEditingNameValue(selectedFile.name); }}
                                            variant="olive"
                                            size="sm"
                                            className="h-9 px-4 text-[11px] font-black uppercase tracking-widest shadow-md shadow-blue-500/20 transition-all active:scale-90"
                                            startIcon={<Edit3 className="w-5 h-5 text-white" />}
                                        >
                                            EDIT
                                        </Button>
                                    </Tooltip>
                                ) : (
                                    <Tooltip content="Save changes" position="left">
                                        <Button
                                            type="button"
                                            onClick={handleRename}
                                            disabled={isUploading}
                                            variant="primary" // Changed to primary (orange) to match other admin pages
                                            size="sm"
                                            className="h-9 px-4 text-[11px] font-black uppercase tracking-widest border-none shadow-md shadow-orange-500/20 transition-all active:scale-90"
                                            startIcon={<Save className="w-5 h-5 text-white" />}
                                        >
                                            {isUploading ? 'SAVING...' : 'SAVE'}
                                        </Button>
                                    </Tooltip>
                                )
                            ) : null
                        }
                    >
                        <StorageInspector
                            selectedFile={selectedFile}
                            pendingFile={pendingFile}
                            pendingFileName={pendingFileName}
                            onPendingFileNameChange={setPendingFileName}
                            isEditing={isEditing}
                            isUploading={isUploading}
                            editingNameValue={editingNameValue}
                            onEditingNameValueChange={setEditingNameValue}
                            getFilePreview={getFilePreview}
                            onConfirmUpload={handleConfirmUpload}
                            onRename={handleRename}
                            onDelete={handleDelete}
                            onCopyUrl={handleCopyUrl}
                            copied={copied}
                            onClose={closeInspector}
                        />
                    </DataExplorerInspector>
                }
            >
                <StorageContent
                    loading={loading && filteredFiles.length === 0}
                    viewMode={viewMode}
                    filteredFiles={filteredFiles}
                    selectedFile={selectedFile}
                    onFileSelect={handleFileSelect}
                    getFilePreview={getFilePreview}
                />
            </DataExplorerLayout>
        </>
    );
};

export default AdminStorage;
