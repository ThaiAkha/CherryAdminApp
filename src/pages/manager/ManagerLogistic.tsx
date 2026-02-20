import React from 'react';
import PageMeta from '../../components/common/PageMeta';
import {
    DataExplorerLayout,
    DataExplorerToolbar,
} from '../../components/data-explorer';
import ClassPicker from '../../components/common/ClassPicker';

// Modular Components
import LogisticSidebar from '../../components/manager/logistic/LogisticSidebar';
import LogisticContent from '../../components/manager/logistic/LogisticContent';
import LogisticInspector from '../../components/manager/logistic/LogisticInspector';

// Logic Hook
import { useManagerLogistic } from '../../hooks/useManagerLogistic';

const ManagerLogistic: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate: _onNavigate }) => {
    const {
        items,
        drivers,
        upcomingSessions,
        unassignedItems,
        selectedBooking,
        loading,
        isSaving,
        selectedDate,
        selectedSessionId,
        selectedBookingId,
        setSelectedDate,
        setSelectedSessionId,
        setSelectedBookingId,
        fetchData,
        handleAssign,
        handleUpdateBooking,
        updateLocalItem,
        closeInspector,
    } = useManagerLogistic();

    return (
        <>
            <PageMeta
                title="Admin Dashboard | Thai Akha Kitchen"
                description="Coordinate drivers, pickups, and route assignments."
            />

            <DataExplorerLayout
                viewMode="table"
                inspectorOpen={!!selectedBooking}
                onInspectorClose={closeInspector}
                sidebar={
                    <LogisticSidebar
                        upcomingSessions={upcomingSessions}
                        unassignedItems={unassignedItems}
                        selectedDate={selectedDate}
                        selectedSessionId={selectedSessionId}
                        selectedBookingId={selectedBookingId}
                        onSelectSession={(date, sessionId) => {
                            setSelectedDate(date);
                            setSelectedSessionId(sessionId);
                        }}
                        onSelectBooking={setSelectedBookingId}
                    />
                }
                toolbar={
                    <DataExplorerToolbar
                        viewMode="table"
                        onViewModeChange={() => { }}
                        searchValue=""
                        onSearchChange={() => { }}
                        onRefresh={fetchData}
                        isRefreshing={loading}
                        primaryAction={
                            <ClassPicker
                                date={selectedDate}
                                onDateChange={setSelectedDate}
                                session={selectedSessionId}
                                onSessionChange={(s) => setSelectedSessionId(s as any)}
                            />
                        }
                    />
                }
                inspector={
                    <LogisticInspector
                        selectedBooking={selectedBooking}
                        drivers={drivers}
                        isSaving={isSaving}
                        onAssign={handleAssign}
                        onUpdateLocal={updateLocalItem}
                        onSubmit={handleUpdateBooking}
                        onClose={closeInspector}
                    />
                }
            >
                <LogisticContent
                    loading={loading}
                    items={items}
                    drivers={drivers}
                    selectedBookingId={selectedBookingId}
                    onSelectBooking={setSelectedBookingId}
                />
            </DataExplorerLayout>
        </>
    );
};

export default ManagerLogistic;
