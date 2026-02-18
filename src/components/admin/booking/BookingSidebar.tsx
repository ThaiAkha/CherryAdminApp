import { Minus, Plus } from 'lucide-react';
import SectionHeader from '../../ui/SectionHeader';
import Button from '../../../components/ui/button/Button';
import AdminClassPicker from '../../../components/common/AdminClassPicker';
import SessionBookingCard from '../../../components/admin/calendar/SessionBookingCard';

interface BookingSidebarProps {
    date: string;
    onDateChange: (d: string) => void;
    session: 'morning_class' | 'evening_class';
    onSessionChange: (s: 'morning_class' | 'evening_class') => void;
    pax: number;
    onPaxChange: (p: number) => void;
    currentSessionData: any;
}

const BookingSidebar: React.FC<BookingSidebarProps> = ({
    date,
    onDateChange,
    session,
    onSessionChange,
    pax,
    onPaxChange,
    currentSessionData
}) => {
    return (
        <div className="lg:col-span-3 space-y-6">
            {/* 1. Date Picker */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <SectionHeader title="Date & Session" variant="sidebar" className="ml-0" />
                <AdminClassPicker
                    date={date}
                    onDateChange={onDateChange}
                    session={session}
                    onSessionChange={onSessionChange}
                />
                {/* Pax Input - Immediately below session */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <SectionHeader title="Pax Count" variant="sidebar" className="ml-0" />
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="size-10 p-0"
                            onClick={() => onPaxChange(Math.max(1, pax - 1))}
                        >
                            <Minus className="w-4 h-4" />
                        </Button>
                        <div className="flex-1 text-center font-black text-2xl h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                            {pax}
                        </div>
                        <Button
                            variant="outline"
                            className="size-10 p-0"
                            onClick={() => onPaxChange(pax + 1)}
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* 2. Availability Card (Reused) */}
            <div className="space-y-2">
                <SectionHeader title="Selected Session Status" variant="sidebar" />
                <SessionBookingCard
                    title={session === 'morning_class' ? 'Morning Class' : 'Evening Class'}
                    status={currentSessionData.status as any}
                    seats={currentSessionData.total - currentSessionData.booked}
                    capacity={currentSessionData.total}
                    bookings={currentSessionData.bookings}
                    className="bg-white dark:bg-gray-800 shadow-sm border-gray-200"
                />
            </div>
        </div>
    );
};

export default BookingSidebar;
