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
        maxPax,
        pricePerHead,
        loading,
        newUser, setNewUser,
        selectedUser, setSelectedUser,
        searchTerm, setSearchTerm,
        searchResults,
        hotelSearchQuery, setHotelSearchQuery,
        hotelSearchResults,
        handleHotelSelect,
        pickupZone,
        hasLuggage, setHasLuggage,
        notes, setNotes,
        amount,
        paymentStatus, setPaymentStatus,
        handleCreate,
        currentSessionData,
        authUser
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
                    maxPax={maxPax}
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
                    hotelSearchQuery={hotelSearchQuery}
                    onHotelSearchQueryChange={setHotelSearchQuery}
                    hotelSearchResults={hotelSearchResults}
                    onHotelSelect={handleHotelSelect}
                    pickupZone={pickupZone}
                    notes={notes}
                    onNotesChange={setNotes}
                    hasLuggage={hasLuggage}
                    onHasLuggageChange={setHasLuggage}
                    authUser={authUser}
                />

                {/* --- RIGHT COLUMN: SUMMARY (3/12) --- */}
                <BookingInspector
                    pax={pax}
                    amount={amount}
                    pricePerHead={pricePerHead}
                    paymentStatus={paymentStatus}
                    onPaymentStatusChange={setPaymentStatus}
                    onConfirm={handleCreate}
                    loading={loading}
                />

            </div>
        </PageContainer>
    );
};

export default ManagerBooking;
