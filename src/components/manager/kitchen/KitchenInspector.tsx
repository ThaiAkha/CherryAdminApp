import React from 'react';
import Badge from '../../ui/badge/Badge';
import Button from '../../ui/button/Button';
import InputField from '../../form/input/InputField';
import TextArea from '../../form/input/TextArea';
import { User, Calendar, Users, Phone, MapPin, FileText, Save, X, Edit, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface KitchenInspectorProps {
    selectedBooking: any | null;
    isEditing: boolean;
    editData: any;
    isSaving: boolean;
    onEditStart: () => void;
    onEditCancel: () => void;
    onEditChange: (data: any) => void;
    onSave: () => void;
    onClose: () => void;
}

const KitchenInspector: React.FC<KitchenInspectorProps> = ({
    selectedBooking,
    isEditing,
    editData,
    isSaving,
    onEditStart,
    onEditCancel,
    onEditChange,
    onSave,
    onClose,
}) => {
    if (!selectedBooking) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="size-16 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center mb-4 text-gray-300 shadow-sm border border-gray-100 dark:border-gray-700">
                    <User className="w-8 h-8" />
                </div>
                <h5 className="text-gray-500 font-bold uppercase tracking-widest text-xs">No Selection</h5>
                <p className="text-gray-400 text-xs mt-2 max-w-[200px]">Select a booking from the list to view and manage details.</p>
            </div>
        );
    }

    const b = selectedBooking;
    const profile = b.profiles || {};

    return (
        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500 overflow-hidden">
            {/* Panel Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 shrink-0">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="size-14 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 text-xl font-black shadow-inner">
                            {profile.full_name?.charAt(0) || 'G'}
                        </div>
                        <div>
                            <h4 className="text-xl font-black uppercase text-gray-900 dark:text-white italic leading-none">{profile.full_name || 'Guest'}</h4>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Order #{b.internal_id ? b.internal_id.slice(0, 8).toUpperCase() : 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {!isEditing && (
                            <Button variant="outline" size="sm" onClick={onEditStart} startIcon={<Edit className="w-4 h-4" />}>
                                Edit
                            </Button>
                        )}
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                {isEditing ? (
                    <div className="space-y-6">
                        <InputField label="Full Name" value={editData.full_name} onChange={e => onEditChange({ ...editData, full_name: e.target.value })} />

                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Participants" type="number" value={editData.pax_count} onChange={e => onEditChange({ ...editData, pax_count: e.target.value })} />
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                                <select
                                    value={editData.status}
                                    onChange={e => onEditChange({ ...editData, status: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl h-11 px-4 text-sm font-bold uppercase"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Dietary Details</label>
                            <select
                                value={editData.dietary_profile}
                                onChange={e => onEditChange({ ...editData, dietary_profile: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl h-11 px-4 text-sm outline-none focus:border-brand-500 transition-colors"
                            >
                                <option value="diet_regular">Regular</option>
                                <option value="diet_vegetarian">Vegetarian</option>
                                <option value="diet_vegan">Vegan</option>
                                <option value="diet_pescatarian">Pescatarian</option>
                                <option value="diet_gluten_free">Gluten Free</option>
                            </select>
                            <InputField placeholder="Allergies (comma separated)" value={editData.allergies} onChange={e => onEditChange({ ...editData, allergies: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Hotel" value={editData.hotel_name || ''} onChange={e => onEditChange({ ...editData, hotel_name: e.target.value })} />
                            <InputField label="Phone" value={editData.phone_number || ''} onChange={e => onEditChange({ ...editData, phone_number: e.target.value })} />
                        </div>

                        <TextArea
                            label="Customer Note"
                            value={editData.customer_note || ''}
                            onChange={(val) => onEditChange({ ...editData, customer_note: val })}
                            rows={3}
                        />
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Dietary Status</p>
                                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                    {(profile.dietary_profile || 'Normal').replace('diet_', '').toUpperCase()}
                                    {profile.allergies?.length > 0 && <span className="text-red-500 ml-2">[{Array.isArray(profile.allergies) ? profile.allergies.join(', ') : profile.allergies}]</span>}
                                </p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Menu selections</p>
                                <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tighter truncate">
                                    {b.menu_selections ? (
                                        `${b.menu_selections.curry?.name || 'N/A'} • ${b.menu_selections.soup?.name || 'N/A'} • ${b.menu_selections.stirfry?.name || 'N/A'}`
                                    ) : 'NO MENU SET'}
                                </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] block mb-1">Participants</span>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-brand-600" />
                                    <span className="text-xl font-black text-gray-900 dark:text-white">{b.pax_count} Pax</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] block mb-1">Pickup Time</span>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-brand-600" />
                                    <span className="text-xl font-black text-gray-900 dark:text-white">{b.pickup_time || '09:15'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4 items-start">
                                <div className="size-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-700 shrink-0"><MapPin className="w-5 h-5" /></div>
                                <div>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Location</span>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{b.hotel_name || 'To be selected'}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="size-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-700 shrink-0"><Phone className="w-5 h-5" /></div>
                                <div>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Contact</span>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{b.phone_number || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="size-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-700 shrink-0"><FileText className="w-5 h-5" /></div>
                                <div className="flex-1">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Guest Notes</span>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800 italic">
                                        {b.customer_note || 'No special requirements noted.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 shrink-0">
                {isEditing ? (
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="w-full rounded-2xl" onClick={onEditCancel} startIcon={<X className="w-4 h-4" />} disabled={isSaving}>Cancel</Button>
                        <Button className="w-full rounded-2xl shadow-brand-glow" onClick={onSave} startIcon={<Save className="w-4 h-4" />} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                ) : (
                    <div className="flex justify-between items-center text-gray-400">
                        <div className="flex items-center gap-2">
                            <div className={cn("size-2 rounded-full", b.status === 'confirmed' ? "bg-green-500" : "bg-amber-500")} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{b.status}</span>
                            {b.agency_note && <Badge variant="light" color="primary" size="sm">Agency</Badge>}
                        </div>
                        <button className="text-[10px] font-black uppercase hover:text-red-500 transition-colors flex items-center gap-1">
                            <Trash2 className="w-3 h-3" /> Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KitchenInspector;
