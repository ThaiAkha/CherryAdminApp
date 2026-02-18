import React from 'react';
import PageMeta from '../../components/common/PageMeta';
import {
    DataExplorerLayout,
    DataExplorerToolbar,
    DataExplorerInspector,
} from '../../components/data-explorer';
import { Plus, Edit, Save } from 'lucide-react';
import Tooltip from '../../components/ui/Tooltip';
import Button from '../../components/ui/button/Button';
import { PRIMARY_BTN } from '../../components/data-explorer/DataExplorerToolbar';

// Modular Components
import HotelsSidebar from '../../components/admin/hotels/HotelsSidebar';
import HotelsContent from '../../components/admin/hotels/HotelsContent';
import HotelsInspector from '../../components/admin/hotels/HotelsInspector';

// Logic Hook
import { useAdminHotels } from '../../hooks/useAdminHotels';

const AdminHotels: React.FC = () => {
    const {
        hotels,
        zones,
        meetingPoints,
        filteredHotels,
        filteredMeetingPoints,
        loading,
        saving,
        activeTab,
        selectedZone,
        searchQuery,
        setSearchQuery,
        viewMode,
        setViewMode,
        selectedHotel,
        selectedMeetingPoint,
        isEditing,
        setIsEditing,
        isCreating,
        form,
        fetchData,
        handleMapLinkChange,
        handleManualGPSChange,
        handleSidebarSelect,
        selectHotel,
        selectMeetingPoint,
        startCreate,
        startCreateMeetingPoint,
        handleSave,
        handleSaveMeetingPoint,
        closeInspector,
        setForm,
        setSelectedMeetingPoint,
    } = useAdminHotels();

    // ── Inspector Header Actions ─────────────────────────────────────────
    const renderInspectorActions = () => {
        if (!selectedHotel && !isCreating && !selectedMeetingPoint) return null;

        if (!isEditing) {
            return (
                <Tooltip content={selectedMeetingPoint ? "Edit this meeting point" : "Edit this hotel"} position="left">
                    <Button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        variant="olive"
                        size="md"
                        className="h-9 px-4 text-[11px] font-black uppercase tracking-widest shadow-md shadow-blue-500/20 transition-all active:scale-90"
                        startIcon={<Edit className="w-5 h-5 text-white" />}
                    >
                        EDIT
                    </Button>
                </Tooltip>
            );
        }

        return (
            <Tooltip content="Save modifications" position="left">
                <Button
                    type="button"
                    onClick={selectedMeetingPoint ? handleSaveMeetingPoint : handleSave}
                    disabled={saving}
                    variant="primary" // Standardized to orange primary
                    size="md"
                    className="h-9 px-4 text-[11px] font-black uppercase tracking-widest border-none transition-all active:scale-90"
                    startIcon={<Save className="w-5 h-5 text-white" />}
                >
                    {saving ? 'SAVING...' : 'SAVE'}
                </Button>
            </Tooltip>
        );
    };

    return (
        <>
            <PageMeta title="Admin Hotels" description="Manage hotel locations and pickup zones" />

            <DataExplorerLayout
                viewMode={viewMode}
                inspectorOpen={!!selectedHotel || isCreating || !!selectedMeetingPoint}
                onInspectorClose={closeInspector}
                sidebar={
                    <HotelsSidebar
                        hotels={hotels}
                        zones={zones}
                        meetingPoints={meetingPoints}
                        selectedZone={selectedZone}
                        activeTab={activeTab}
                        onSelect={handleSidebarSelect}
                    />
                }
                toolbar={
                    <DataExplorerToolbar
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        searchValue={searchQuery}
                        onSearchChange={setSearchQuery}
                        searchPlaceholder={activeTab === 'meeting_points' ? "Search meeting points..." : "Search hotels..."}
                        onRefresh={fetchData}
                        isRefreshing={loading}
                        primaryAction={
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={activeTab === 'meeting_points' ? startCreateMeetingPoint : startCreate}
                                    className={PRIMARY_BTN}
                                >
                                    <Plus className="w-4 h-4" />
                                    {activeTab === 'meeting_points' ? 'NEW POINT' : 'NEW HOTEL'}
                                </button>
                            </div>
                        }
                    />
                }
                inspector={
                    <DataExplorerInspector
                        isEditing={isEditing}
                        onClose={closeInspector}
                        headerActions={renderInspectorActions()}
                    >
                        <HotelsInspector
                            selectedHotel={selectedHotel}
                            selectedMeetingPoint={selectedMeetingPoint}
                            isEditing={isEditing}
                            isCreating={isCreating}
                            saving={saving}
                            form={form}
                            zones={zones}
                            onFormChange={(data) => setForm(prev => ({ ...prev, ...data }))}
                            onMapLinkChange={handleMapLinkChange}
                            onManualGPSChange={handleManualGPSChange}
                            onSelectedMeetingPointChange={setSelectedMeetingPoint}
                            onSaveMeetingPoint={handleSaveMeetingPoint}
                        />
                    </DataExplorerInspector>
                }
            >
                <HotelsContent
                    loading={loading}
                    viewMode={viewMode}
                    activeTab={activeTab}
                    searchQuery={searchQuery}
                    filteredHotels={filteredHotels}
                    filteredMeetingPoints={filteredMeetingPoints}
                    selectedHotel={selectedHotel}
                    selectedMeetingPoint={selectedMeetingPoint}
                    zones={zones}
                    onSelectHotel={selectHotel}
                    onSelectMeetingPoint={selectMeetingPoint}
                />
            </DataExplorerLayout>
        </>
    );
};

export default AdminHotels;
