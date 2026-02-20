import React from 'react';
import PageMeta from '../../components/common/PageMeta';
import {
    DataExplorerLayout,
    DataExplorerToolbar,
} from '../../components/data-explorer';
import ClassPicker from '../../components/common/ClassPicker';

// Modular Components
import KitchenSidebar from '../../components/manager/kitchen/KitchenSidebar';
import KitchenContent from '../../components/manager/kitchen/KitchenContent';
import KitchenInspector from '../../components/manager/kitchen/KitchenInspector';

// Logic Hook
import { useManagerKitchen } from '../../hooks/useManagerKitchen';

const ManagerKitchen: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate: _onNavigate }) => {
    const {
        bookings,
        selectedBooking,
        editData,
        stats,
        loading,
        isSaving,
        isEditing,
        globalDate,
        globalSession,
        setGlobalDate,
        setGlobalSession,
        setIsEditing,
        setEditData,
        fetchTableData,
        handleSelectBooking,
        handleEditStart,
        handleSave,
        closeInspector,
    } = useManagerKitchen();

    return (
        <>
            <PageMeta
                title="Manager Kitchen | Thai Akha Kitchen"
                description="Manage daily cooking classes and prep lists."
            />

            <DataExplorerLayout
                viewMode="table"
                inspectorOpen={!!selectedBooking}
                onInspectorClose={closeInspector}
                sidebar={
                    <KitchenSidebar stats={stats} />
                }
                toolbar={
                    <DataExplorerToolbar
                        viewMode="table"
                        onViewModeChange={() => { }}
                        searchValue=""
                        onSearchChange={() => { }}
                        onRefresh={fetchTableData}
                        isRefreshing={loading}
                        primaryAction={
                            <ClassPicker
                                date={globalDate}
                                onDateChange={setGlobalDate}
                                session={globalSession}
                                onSessionChange={setGlobalSession}
                            />
                        }
                    />
                }
                inspector={
                    <KitchenInspector
                        selectedBooking={selectedBooking}
                        isEditing={isEditing}
                        editData={editData}
                        isSaving={isSaving}
                        onEditStart={handleEditStart}
                        onEditCancel={() => setIsEditing(false)}
                        onEditChange={setEditData}
                        onSave={handleSave}
                        onClose={closeInspector}
                    />
                }
            >
                <KitchenContent
                    loading={loading}
                    bookings={bookings}
                    selectedBookingId={selectedBooking?.internal_id || null}
                    onSelectBooking={handleSelectBooking}
                />
            </DataExplorerLayout>
        </>
    );
};

export default ManagerKitchen;
