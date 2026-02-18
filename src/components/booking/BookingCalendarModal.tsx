import React from 'react';
import { Modal } from '../ui/modal';
import { BookingCalendarView } from './BookingCalendarView';

interface BookingCalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentDate: Date;
    onSelectDate: (date: Date) => void;
    allowSelectionOnFullDays?: boolean;
}

const BookingCalendarModal: React.FC<BookingCalendarModalProps> = ({
    isOpen,
    onClose,
    currentDate,
    onSelectDate,
    allowSelectionOnFullDays = false
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-5xl w-full h-[80vh] flex flex-col overflow-hidden bg-white dark:bg-gray-950 rounded-[32px] p-0 border-none shadow-2xl"
        >
            <div className="relative flex-1 flex flex-col">

                <BookingCalendarView
                    currentDate={currentDate}
                    onSelectDate={onSelectDate}
                    onClose={onClose}
                    allowSelectionOnFullDays={allowSelectionOnFullDays}
                />
            </div>
        </Modal>
    );
};

export default BookingCalendarModal;
