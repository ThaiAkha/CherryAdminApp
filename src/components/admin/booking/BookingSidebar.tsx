import React from 'react';
import DateSessionPaxPicker from '../../booking/DateSessionPaxPicker';
import SessionBookingCard from '../calendar/SessionBookingCard';

interface BookingSidebarProps {
    date: string;
    onDateChange: (d: string) => void;
    session: 'morning_class' | 'evening_class';
    onSessionChange: (s: 'morning_class' | 'evening_class') => void;
    pax: number;
    onPaxChange: (p: number) => void;
    maxPax: number;
    currentSessionData: any;
}

const BookingSidebar: React.FC<BookingSidebarProps> = ({
    date,
    onDateChange,
    session,
    onSessionChange,
    pax,
    onPaxChange,
    maxPax,
    currentSessionData
}) => {
    return (
        <div className="lg:col-span-3 space-y-4">
            <DateSessionPaxPicker
                date={date}
                onDateChange={onDateChange}
                session={session}
                onSessionChange={onSessionChange}
                pax={pax}
                onPaxChange={onPaxChange}
                maxPax={maxPax}
            />

            <SessionBookingCard
                title={session === 'morning_class' ? 'Morning Class' : 'Evening Class'}
                status={currentSessionData.status as any}
                seats={currentSessionData.total - currentSessionData.booked}
                capacity={currentSessionData.total}
                bookings={currentSessionData.bookings}
                className="bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700"
            />
        </div>
    );
};

export default BookingSidebar;
