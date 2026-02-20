import React from 'react';
import Badge from '../../ui/badge/Badge';
import Button from '../../ui/button/Button';
import Input from '../../form/input/InputField';
import TextArea from '../../form/input/TextArea';
import { MapPin, Phone, Save, Search, X } from 'lucide-react';
import { LogisticsItem, DriverProfile } from '../../../hooks/useManagerLogistic';

interface LogisticInspectorProps {
    selectedBooking: LogisticsItem | null;
    drivers: DriverProfile[];
    isSaving: boolean;
    onAssign: (bookingId: string, driverId: string | null) => void;
    onUpdateLocal: (id: string, updates: Partial<LogisticsItem>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}

const LogisticInspector: React.FC<LogisticInspectorProps> = ({
    selectedBooking,
    drivers,
    isSaving,
    onAssign,
    onUpdateLocal,
    onSubmit,
    onClose,
}) => {
    if (!selectedBooking) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                <Search className="w-12 h-12 mb-4 opacity-50" />
                <h5 className="uppercase font-bold text-sm text-gray-900 dark:text-white">Select a Passenger</h5>
                <p className="text-xs mt-2 text-gray-500">Click any card to inspect and manage details.</p>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 space-y-4 bg-gray-50/30 dark:bg-gray-800/20">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <Badge variant="light" color="primary">{selectedBooking.pax} PAX</Badge>
                        <h3 className="text-xl font-black uppercase tracking-tight leading-none text-gray-900 dark:text-white mt-2">
                            {selectedBooking.guest_name}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {/* Driver Assignment */}
                <div className="space-y-3">
                    <h6 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Route Assignment</h6>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Driver</label>
                        <div className="relative">
                            <select
                                value={selectedBooking.pickup_driver_uid || ''}
                                onChange={(e) => onAssign(selectedBooking.id, e.target.value || null)}
                                className="w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:bg-gray-900"
                            >
                                <option value="">-- UNASSIGNED --</option>
                                {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100 dark:border-gray-800" />

                {/* Pickup Details */}
                <div className="space-y-4">
                    <h6 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pickup Details</h6>

                    <Input
                        label="Hotel / Meeting Point"
                        type="text"
                        placeholder="Enter hotel name"
                        value={selectedBooking.hotel_name}
                        onChange={e => onUpdateLocal(selectedBooking.id, { hotel_name: e.target.value })}
                        leftIcon={<MapPin className="w-5 h-5" />}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Time"
                            type="time"
                            value={selectedBooking.pickup_time}
                            onChange={e => onUpdateLocal(selectedBooking.id, { pickup_time: e.target.value })}
                        />
                        <Input
                            label="Phone"
                            type="tel"
                            placeholder="+66..."
                            value={selectedBooking.phone_number || ''}
                            onChange={e => onUpdateLocal(selectedBooking.id, { phone_number: e.target.value })}
                            leftIcon={<Phone className="w-5 h-5" />}
                        />
                    </div>
                </div>

                <hr className="border-gray-100 dark:border-gray-800" />

                {/* Notes */}
                <div className="space-y-4">
                    <h6 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Notes</h6>
                    <TextArea
                        placeholder="Customer requests..."
                        rows={2}
                        value={selectedBooking.customer_note || ''}
                        onChange={val => onUpdateLocal(selectedBooking.id, { customer_note: val })}
                        hint="Visible to driver"
                    />
                    <TextArea
                        placeholder="Internal/Agency notes..."
                        rows={2}
                        value={selectedBooking.agency_note || ''}
                        onChange={val => onUpdateLocal(selectedBooking.id, { agency_note: val })}
                        hint="Internal only"
                    />
                </div>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
                <Button
                    type="submit"
                    variant="primary"
                    className="w-full justify-center shadow-lg"
                    startIcon={<Save className="w-4 h-4" />}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Update Booking'}
                </Button>
            </div>
        </form>
    );
};

export default LogisticInspector;
