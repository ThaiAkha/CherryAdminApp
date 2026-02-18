import { Lock, Edit2, Minus, Plus } from 'lucide-react';
import SectionHeader from '../../ui/SectionHeader';
import { cn } from '../../../lib/utils';
import Button from '../../../components/ui/button/Button';
import Badge from '../../../components/ui/badge/Badge';
import { DayData, EditSessionState, BulkSessionType } from '../../../hooks/useAdminCalendar';

interface CalendarInspectorProps {
    isBulkMode: boolean;
    selectedDate: string | null;
    selectedDates: Set<string>;
    availability: Record<string, DayData>;
    isEditing: boolean;
    setIsEditing: (v: boolean) => void;
    bulkSessionType: BulkSessionType;
    editState: Record<string, EditSessionState>;
    updateEditState: (sid: string, field: keyof EditSessionState, value: any) => void;
    onSave: () => void;
    onCancel: () => void;
}

const CalendarInspector: React.FC<CalendarInspectorProps> = ({
    isBulkMode,
    selectedDate,
    selectedDates,
    availability,
    isEditing,
    setIsEditing,
    bulkSessionType,
    editState,
    updateEditState,
    onSave,
    onCancel
}) => {
    const noData = isBulkMode ? (selectedDates.size === 0) : (!selectedDate || !availability[selectedDate!]);

    if (noData) {
        return (
            <div className="hidden lg:flex lg:col-span-3 flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
                <Lock className="w-10 h-10 mb-6 opacity-30" />
                <p className="text-[10px] font-black uppercase tracking-widest max-w-[160px]">{isBulkMode ? 'Seleziona giorni per Bulk Edit' : 'Seleziona una data per iniziare'}</p>
            </div>
        );
    }

    const dayData = !isBulkMode ? availability[selectedDate!] : null;

    return (
        <div className="hidden lg:flex lg:col-span-3 flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm h-full">
            <div className="flex flex-col h-full overflow-hidden p-6 gap-6">
                <div className="shrink-0">
                    <SectionHeader title="Inspector" variant="inspector" />
                    <h3 className="text-xl font-black text-gray-900 leading-tight">
                        {isBulkMode ? `${selectedDates.size} Giorni` : new Date(selectedDate!).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </h3>
                    <p className="text-[10px] text-brand-600 mt-1 uppercase font-black tracking-widest">
                        {isBulkMode ? `Bulk Update: ${bulkSessionType === 'all' ? 'All Day' : (bulkSessionType === 'morning_class' ? 'Morning Only' : 'Evening Only')}` : (isEditing ? 'Editing Day' : 'Quick Preview')}
                    </p>
                </div>
                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1">
                    {!isEditing && !isBulkMode ? (
                        <div className="flex-1 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
                            {['morning_class', 'evening_class'].map(s => {
                                const sess = dayData![s as 'morning_class' | 'evening_class'];
                                return (
                                    <div key={s} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("size-2 rounded-full", sess.status === 'CLOSED' ? "bg-red-500" : "bg-green-500")} />
                                                <span className="font-black text-[10px] uppercase tracking-widest">{s === 'morning_class' ? 'Morning' : 'Evening'}</span>
                                            </div>
                                            <Badge color={sess.status === 'CLOSED' ? 'error' : 'success'} className="font-black text-[8px] uppercase">{sess.status}</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-white border border-gray-100 rounded-xl">
                                                <p className="text-[8px] font-black uppercase text-gray-400 mb-1">Booked</p>
                                                <span className="text-xl font-black">{sess.capacity - sess.seats}</span>
                                            </div>
                                            <div className="p-3 bg-white border border-gray-100 rounded-xl">
                                                <p className="text-[8px] font-black uppercase text-gray-400 mb-1">Available</p>
                                                <span className="text-xl font-black text-brand-600">{sess.seats}</span>
                                            </div>
                                        </div>
                                        {sess.status === 'CLOSED' && <div className="mt-3 p-3 bg-red-50/50 rounded-xl text-[10px] font-bold text-red-600 border border-red-100">{sess.reason || 'Sessione Chiusa'}</div>}
                                    </div>
                                );
                            })}
                            <div className="pt-2">
                                <Button
                                    variant="primary"
                                    className="w-full py-4 text-[10px] font-black tracking-widest uppercase shadow-lg shadow-brand-500/20"
                                    onClick={() => setIsEditing(true)}
                                    startIcon={<Edit2 className="w-4 h-4" />}
                                >
                                    EDIT AVAILABILITY
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-left-4 pb-10">
                            {(() => {
                                const sessions = isBulkMode ? (bulkSessionType === 'all' ? ['all'] : [bulkSessionType]) : ['morning_class', 'evening_class'];
                                return sessions.map(s => {
                                    const key = (s === 'all' && isBulkMode) ? 'morning_class' : s as string;
                                    const sess = editState[key];
                                    return (
                                        <div key={s} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/30">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="font-black text-[10px] uppercase tracking-widest flex items-center gap-2">{s === 'all' ? 'All Classes' : (s === 'morning_class' ? 'Morning' : 'Evening')} Session</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[8px] font-black uppercase text-gray-400">Force Close</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={sess.isClosed}
                                                        onChange={(e) => {
                                                            updateEditState(key, 'isClosed', e.target.checked);
                                                            if (s === 'all') updateEditState('evening_class', 'isClosed', e.target.checked);
                                                        }}
                                                        className="size-4 rounded text-brand-600"
                                                    />
                                                </div>
                                            </div>
                                            {sess.isClosed ? (
                                                <div className="animate-in fade-in slide-in-from-top-2">
                                                    <SectionHeader title="Motivazione Chiusura" variant="inspector" className="ml-1" />
                                                    <input
                                                        type="text"
                                                        value={sess.reason}
                                                        onChange={(e) => {
                                                            updateEditState(key, 'reason', e.target.value);
                                                            if (s === 'all') updateEditState('evening_class', 'reason', e.target.value);
                                                        }}
                                                        className="w-full rounded-xl border-gray-100 p-3 text-xs font-bold"
                                                        placeholder="Esempio: Evento Privato"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="animate-in fade-in slide-in-from-top-2">
                                                    <SectionHeader title={isBulkMode ? "Aggiungi/Elimina spot" : "Available Seats"} variant="inspector" className="ml-1" />
                                                    <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-1.5 shadow-sm">
                                                        <button
                                                            onClick={() => {
                                                                const v = sess.seats - 1;
                                                                updateEditState(key, 'seats', v);
                                                                if (s === 'all') updateEditState('evening_class', 'seats', v);
                                                            }}
                                                            className="size-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100 font-black"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="text-lg font-black">{isBulkMode && sess.seats > 0 ? `+${sess.seats}` : sess.seats}</span>
                                                        <button
                                                            onClick={() => {
                                                                const v = sess.seats + 1;
                                                                updateEditState(key, 'seats', v);
                                                                if (s === 'all') updateEditState('evening_class', 'seats', v);
                                                            }}
                                                            className="size-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100 font-black"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <p className="mt-2 text-[8px] font-bold text-gray-400 uppercase tracking-widest text-center">
                                                        {isBulkMode ? "La modifica sommerà/sottrarrà spot alla capacità attuale" : `Total Capacity: ${sess.seats + sess.occupied}`}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()}
                            <div className="space-y-3 pt-4 sticky bottom-0 bg-white z-30 border-t border-gray-100">
                                <Button
                                    variant="primary"
                                    className="w-full py-4 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/20"
                                    onClick={onSave}
                                    disabled={isBulkMode && selectedDates.size === 0}
                                >
                                    {isBulkMode ? `SALVA ${selectedDates.size} GIORNI` : "SAVE CHANGES"}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-gray-500"
                                    onClick={onCancel}
                                >
                                    CANCEL
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalendarInspector;
