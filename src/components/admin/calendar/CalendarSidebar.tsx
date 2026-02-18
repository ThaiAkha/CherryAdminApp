import { Calendar } from 'lucide-react';
import SectionHeader from '../../ui/SectionHeader';
import MiniCalendar from '../../../components/common/MiniCalendar';
import SessionBookingCard from '../../../components/admin/calendar/SessionBookingCard';
import { DayData, BookingMember } from '../../../hooks/useAdminCalendar';

interface CalendarSidebarProps {
    selectedDate: string | null;
    onDateChange: (d: Date) => void;
    availability: Record<string, DayData>;
    dayBookings: Record<string, BookingMember[]>;
    isBulkMode: boolean;
    selectedDates: Set<string>;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
    selectedDate,
    onDateChange,
    availability,
    dayBookings,
    isBulkMode,
    selectedDates
}) => {
    return (
        <div className="lg:col-span-2 h-full overflow-hidden flex flex-col gap-6">
            <div className="shrink-0">
                <SectionHeader title="Select Date:" variant="sidebar" />
                <MiniCalendar
                    value={selectedDate ? new Date(selectedDate) : new Date()}
                    onChange={onDateChange}
                    className="w-full shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                />
            </div>
            <div className="flex-1 overflow-hidden min-h-0 flex flex-col gap-4">
                <div className="px-1 py-1">
                    <SectionHeader
                        title={!isBulkMode ? (selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', weekday: 'long' }).replace(/,/g, '') : 'Select a date') : `${selectedDates.size} date selezionate`}
                        className="text-black dark:text-white"
                        variant="sidebar"
                    />
                </div>
                {!isBulkMode ? (
                    <div className="space-y-4 flex-1 flex flex-col overflow-hidden pb-4">
                        <SessionBookingCard
                            title="Morning Session"
                            status={selectedDate ? availability[selectedDate!]?.morning_class.status : 'OPEN'}
                            seats={selectedDate ? availability[selectedDate!]?.morning_class.seats : 12}
                            capacity={selectedDate ? (availability[selectedDate!]?.morning_class.capacity ?? 12) : 12}
                            bookings={dayBookings.morning_class}
                        />
                        <SessionBookingCard
                            title="Evening Session"
                            status={selectedDate ? availability[selectedDate!]?.evening_class.status : 'OPEN'}
                            seats={selectedDate ? availability[selectedDate!]?.evening_class.seats : 12}
                            capacity={selectedDate ? (availability[selectedDate!]?.evening_class.capacity ?? 12) : 12}
                            bookings={dayBookings.evening_class}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-brand-50/20 dark:bg-brand-500/5 rounded-2xl border border-dashed border-brand-200 dark:border-brand-900/30">
                        <Calendar className="w-10 h-10 text-brand-300 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">Modalità Bulk Edit</p>
                        <p className="text-[9px] text-gray-500 mt-2 italic">I giorni con prenotazioni sono bloccati per sicurezza.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarSidebar;
