import React from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageMeta from '../../components/common/PageMeta';
import { useAdminBooking } from '../../hooks/useAdminBooking';

// Components
import BookingSidebar from '../../components/admin/booking/BookingSidebar';
import BookingContent from '../../components/admin/booking/BookingContent';
import BookingInspector from '../../components/admin/booking/BookingInspector';

const ManagerBooking: React.FC = () => {
    const {
        date, setDate,
        session, setSession,
        userMode, setUserMode,
        pax, setPax,
        loading,
        newUser, setNewUser,
        selectedUser, setSelectedUser,
        searchTerm, setSearchTerm,
        searchResults,
        hotel, setHotel,
        pickupTime, setPickupTime,
        notes, setNotes,
        amount,
        status, setStatus,
        paymentStatus, setPaymentStatus,
        handleCreate,
        currentSessionData
    } = useAdminBooking();

    return (
        <PageContainer variant="full">
            <PageMeta title="Manual Booking" description="Create a new booking manually." />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">

                {/* --- LEFT COLUMN: DATE, SESSION, CARD (3/12) --- */}
                <BookingSidebar
                    date={date}
                    onDateChange={setDate}
                    session={session}
                    onSessionChange={setSession}
                    pax={pax}
                    onPaxChange={setPax}
                    currentSessionData={currentSessionData}
                />

                {/* --- CENTER COLUMN: DYNAMIC FORM (6/12) --- */}
                <BookingContent
                    userMode={userMode}
                    onUserModeChange={setUserMode}
                    newUser={newUser}
                    onNewUserChange={setNewUser}
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    searchResults={searchResults}
                    selectedUser={selectedUser}
                    onSelectedUserChange={setSelectedUser}
                    hotel={hotel}
                    onHotelChange={setHotel}
                    pickupTime={pickupTime}
                    onPickupTimeChange={setPickupTime}
                    notes={notes}
                    onNotesChange={setNotes}
                />

                {/* --- RIGHT COLUMN: SUMMARY (3/12) --- */}
                <BookingInspector
                    pax={pax}
                    amount={amount}
                    paymentStatus={paymentStatus}
                    onPaymentStatusChange={setPaymentStatus}
                    status={status}
                    onStatusChange={setStatus}
                    onConfirm={handleCreate}
                    loading={loading}
                />

            </div>
        </PageContainer>
    );
};

export default ManagerBooking;
