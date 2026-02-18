import React, { useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageGrid from '../../components/layout/PageGrid';
import { usePageHeader } from '../../context/PageHeaderContext';
import PageMeta from '../../components/common/PageMeta';
import { contentService } from '../../services/content.service';
import { useAdminCalendar, getDateKey } from '../../hooks/useAdminCalendar';

// Components
import CalendarSidebar from '../../components/admin/calendar/CalendarSidebar';
import CalendarContent from '../../components/admin/calendar/CalendarContent';
import CalendarInspector from '../../components/admin/calendar/CalendarInspector';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const AdminCalendar: React.FC = () => {
    const { setPageHeader } = usePageHeader();
    const {
        viewDate, setViewDate,
        availability,
        loading,
        dayBookings,
        selectedDate, setSelectedDate,
        isEditing, setIsEditing,
        isBulkMode, setIsBulkMode,
        selectedDates,
        bulkSessionType, setBulkSessionType,
        editState,
        handleDateClick,
        handleSaveBatch,
        calendarDays,
        handlePrev,
        handleNext,
        updateEditState
    } = useAdminCalendar();

    // Set Page Header
    useEffect(() => {
        const loadMeta = async () => {
            const meta = await contentService.getPageMetadata('admin-calendar');
            if (meta) {
                setPageHeader(meta.titleMain || 'Master Calendar', meta.description || 'Gestione calendari.');
            } else {
                setPageHeader(
                    `${MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}`,
                    'Gestione disponibilità sessioni, capacità e chiusure festive.'
                );
            }
        };
        loadMeta();
    }, [viewDate, setPageHeader]);

    return (
        <PageContainer variant="full" className="h-[calc(100vh-64px)] overflow-hidden bg-gray-50 dark:bg-gray-950/50">
            <PageMeta title="Admin Dashboard | Thai Akha Kitchen" description="Gestione calendari." />
            <PageGrid columns={12} className="h-full gap-6">

                {/* LEFT COLUMN (2/12) */}
                <CalendarSidebar
                    selectedDate={selectedDate}
                    onDateChange={(d) => {
                        if (!isBulkMode) setSelectedDate(getDateKey(d));
                        setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
                    }}
                    availability={availability}
                    dayBookings={dayBookings}
                    isBulkMode={isBulkMode}
                    selectedDates={selectedDates}
                />

                {/* CENTER COLUMN (7/12) */}
                <CalendarContent
                    viewDate={viewDate}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    isBulkMode={isBulkMode}
                    onBulkModeChange={setIsBulkMode}
                    bulkSessionType={bulkSessionType}
                    onBulkSessionTypeChange={setBulkSessionType}
                    calendarDays={calendarDays}
                    availability={availability}
                    loading={loading}
                    selectedDate={selectedDate}
                    selectedDates={selectedDates}
                    handleDateClick={handleDateClick}
                />

                {/* RIGHT COLUMN (3/12) */}
                <CalendarInspector
                    isBulkMode={isBulkMode}
                    selectedDate={selectedDate}
                    selectedDates={selectedDates}
                    availability={availability}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    bulkSessionType={bulkSessionType}
                    editState={editState}
                    updateEditState={updateEditState}
                    onSave={handleSaveBatch}
                    onCancel={() => {
                        setIsEditing(false);
                        if (isBulkMode) setIsBulkMode(false);
                    }}
                />

            </PageGrid>
        </PageContainer>
    );
};

export default AdminCalendar;
