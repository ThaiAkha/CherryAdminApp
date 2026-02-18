import { Rocket } from 'lucide-react';
import SectionHeader from '../../ui/SectionHeader';
import { cn } from '../../../lib/utils';
import Button from '../../../components/ui/button/Button';
import { PaymentStatus } from '../../../hooks/useAdminBooking';

interface BookingInspectorProps {
    pax: number;
    amount: number;
    paymentStatus: PaymentStatus;
    onPaymentStatusChange: (s: PaymentStatus) => void;
    status: 'confirmed' | 'pending';
    onStatusChange: (s: 'confirmed' | 'pending') => void;
    onConfirm: () => void;
    loading: boolean;
}

const BookingInspector: React.FC<BookingInspectorProps> = ({
    pax,
    amount,
    paymentStatus,
    onPaymentStatusChange,
    status,
    onStatusChange,
    onConfirm,
    loading
}) => {
    return (
        <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl sticky top-6">
                <SectionHeader title="Booking Summary" variant="inspector" className="mb-4 border-b border-gray-100 pb-2" />

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-500">Guests</span>
                        <span className="text-xl font-black text-gray-900 dark:text-white">{pax}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-500">Price / Head</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">1,200 THB</span>
                    </div>
                    <div className="pt-4 border-t border-dashed border-gray-200">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-black text-gray-900 dark:text-white">TOTAL</span>
                            <div className="text-right">
                                <span className="block text-2xl font-black text-brand-600">{amount.toLocaleString()}</span>
                                <span className="text-[10px] text-gray-400 font-bold">THB</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Toggle */}
                <div className="mt-6 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg grid grid-cols-2 gap-1">
                    <button onClick={() => onPaymentStatusChange('unpaid')} className={cn("py-2 text-[10px] font-black uppercase rounded-md transition-all", paymentStatus === 'unpaid' ? "bg-white shadow text-red-500" : "text-gray-400 hover:text-gray-600")}>Unpaid</button>
                    <button onClick={() => onPaymentStatusChange('paid')} className={cn("py-2 text-[10px] font-black uppercase rounded-md transition-all", paymentStatus === 'paid' ? "bg-white shadow text-green-600" : "text-gray-400 hover:text-gray-600")}>Paid</button>
                </div>

                {/* Status Toggle */}
                <div className="mt-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg grid grid-cols-2 gap-1">
                    <button onClick={() => onStatusChange('pending')} className={cn("py-2 text-[10px] font-black uppercase rounded-md transition-all", status === 'pending' ? "bg-white shadow text-orange-500" : "text-gray-400 hover:text-gray-600")}>Pending</button>
                    <button onClick={() => onStatusChange('confirmed')} className={cn("py-2 text-[10px] font-black uppercase rounded-md transition-all", status === 'confirmed' ? "bg-white shadow text-brand-600" : "text-gray-400 hover:text-gray-600")}>Confirmed</button>
                </div>

                <Button
                    variant="primary"
                    className="w-full mt-6 py-4 text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-500/20"
                    onClick={onConfirm}
                    isLoading={loading}
                    startIcon={<Rocket className="w-4 h-4" />}
                >
                    Confirm Booking
                </Button>
            </div>
        </div>
    );
};

export default BookingInspector;
