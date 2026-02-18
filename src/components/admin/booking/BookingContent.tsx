import React from 'react';
import { User, Mail, Phone, MapPin, Clock, Search, Briefcase, ShieldCheck } from 'lucide-react';
import { cn } from '../../../lib/utils';
import InputField from '../../../components/form/input/InputField';
import Button from '../../../components/ui/button/Button';
import TextArea from '../../../components/form/input/TextArea';
import { UserMode, NewUser } from '../../../hooks/useAdminBooking';

interface BookingContentProps {
    userMode: UserMode;
    onUserModeChange: (m: UserMode) => void;
    newUser: NewUser;
    onNewUserChange: (u: NewUser) => void;
    searchTerm: string;
    onSearchTermChange: (s: string) => void;
    searchResults: any[];
    selectedUser: any | null;
    onSelectedUserChange: (u: any) => void;
    hotel: string;
    onHotelChange: (h: string) => void;
    pickupTime: string;
    onPickupTimeChange: (t: string) => void;
    notes: string;
    onNotesChange: (n: string) => void;
}

const BookingContent: React.FC<BookingContentProps> = ({
    userMode,
    onUserModeChange,
    newUser,
    onNewUserChange,
    searchTerm,
    onSearchTermChange,
    searchResults,
    selectedUser,
    onSelectedUserChange,
    hotel,
    onHotelChange,
    pickupTime,
    onPickupTimeChange,
    notes,
    onNotesChange
}) => {
    return (
        <div className="lg:col-span-6 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative min-h-[400px] overflow-hidden">

                {/* HEADER WITH TABS */}
                <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex overflow-x-auto no-scrollbar">
                        {[
                            { id: 'new', label: 'New Guest', icon: User },
                            { id: 'existing', label: 'Existing User', icon: Search },
                            { id: 'agency', label: 'Agency', icon: Briefcase },
                            { id: 'internal', label: 'Internal / Staff', icon: ShieldCheck },
                        ].map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => onUserModeChange(mode.id as UserMode)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 px-4 py-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap",
                                    userMode === mode.id
                                        ? "border-brand-500 text-brand-600 bg-white dark:bg-gray-800"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                                )}
                            >
                                <mode.icon className="w-4 h-4" />
                                {mode.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {/* Dynamic Title based on Mode */}
                    <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                            {userMode === 'new' && <><User className="w-5 h-5 text-brand-500" /> New Guest Registration</>}
                            {userMode === 'existing' && <><Search className="w-5 h-5 text-brand-500" /> Find Existing Guest</>}
                            {userMode === 'agency' && <><Briefcase className="w-5 h-5 text-brand-500" /> Agency Booking</>}
                            {userMode === 'internal' && <><ShieldCheck className="w-5 h-5 text-brand-500" /> Internal / Staff Booking</>}
                        </h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">
                            {userMode === 'new' && 'Create a new user profile and booking.'}
                            {userMode === 'existing' && 'Search database for returning guests.'}
                            {userMode === 'agency' && 'Book on behalf of a partner/agency.'}
                            {userMode === 'internal' && 'Staff booking or walk-in (no user required).'}
                        </p>
                    </div>

                    {/* MODE: NEW */}
                    {userMode === 'new' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                            <InputField label="Full Name" placeholder="e.g. John Doe" value={newUser.fullName} onChange={e => onNewUserChange({ ...newUser, fullName: e.target.value })} leftIcon={<User className="w-4 h-4" />} />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Email (Optional)" placeholder="john@example.com" value={newUser.email} onChange={e => onNewUserChange({ ...newUser, email: e.target.value })} leftIcon={<Mail className="w-4 h-4" />} />
                                <InputField label="Phone (Optional)" placeholder="+66..." value={newUser.phone} onChange={e => onNewUserChange({ ...newUser, phone: e.target.value })} leftIcon={<Phone className="w-4 h-4" />} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase">Dietary Requirements</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['diet_regular', 'diet_vegetarian', 'diet_vegan', 'diet_gluten_free'].map(opt => (
                                        <button key={opt} onClick={() => onNewUserChange({ ...newUser, diet: opt })} className={cn("px-3 py-2 rounded-lg border text-xs font-bold transition-all text-left", newUser.diet === opt ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 hover:bg-gray-50")}>
                                            {opt.replace('diet_', '').toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODE: EXISTING */}
                    {userMode === 'existing' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                            <InputField label="Search Guest" placeholder="Type name..." value={searchTerm} onChange={e => onSearchTermChange(e.target.value)} leftIcon={<Search className="w-4 h-4" />} />
                            {searchTerm.length > 2 && (
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 border border-gray-200 dark:border-gray-700 max-h-[200px] overflow-y-auto">
                                    {searchResults.map(u => (
                                        <div key={u.id} onClick={() => { onSelectedUserChange(u); onSearchTermChange(''); }} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-md cursor-pointer border-b border-gray-100 last:border-0 flex justify-between items-center group">
                                            <div>
                                                <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{u.full_name}</p>
                                                <p className="text-xs text-gray-500">{u.email}</p>
                                            </div>
                                            <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">Select</Button>
                                        </div>
                                    ))}
                                    {searchResults.length === 0 && <p className="text-xs text-center text-gray-400 p-2">No users found.</p>}
                                </div>
                            )}
                            {selectedUser && (
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-xl flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-black text-lg">{selectedUser.full_name.charAt(0)}</div>
                                    <div>
                                        <p className="font-black text-green-800 dark:text-green-300">{selectedUser.full_name}</p>
                                        <p className="text-xs text-green-600 dark:text-green-400">{selectedUser.email}</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="ml-auto text-red-500 border-red-200 hover:bg-red-50" onClick={() => onSelectedUserChange(null)}>Remove</Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* MODE: AGENCY */}
                    {userMode === 'agency' && (
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800/30 text-center animate-in fade-in">
                            <Briefcase className="w-8 h-8 mx-auto text-purple-400 mb-2" />
                            <h4 className="font-black text-purple-800 dark:text-purple-300">Agency Booking</h4>
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Payment will be marked as 'Agency Invoice'. User selection is optional.</p>
                        </div>
                    )}

                    {/* MODE: INTERNAL */}
                    {userMode === 'internal' && (
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800/30 text-center animate-in fade-in">
                            <ShieldCheck className="w-8 h-8 mx-auto text-orange-400 mb-2" />
                            <h4 className="font-black text-orange-800 dark:text-orange-300">Internal Booking</h4>
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">This booking will not be linked to a user profile. Useful for staff placeholders or walk-ins.</p>
                        </div>
                    )}

                    {/* LOGISTICS & NOTES (Common) */}
                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 space-y-4">
                        <h5 className="font-black text-sm uppercase text-gray-400 tracking-widest mb-4">Logistics & Notes</h5>
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Hotel / Pickup Point" placeholder="Detailed location..." value={hotel} onChange={e => onHotelChange(e.target.value)} leftIcon={<MapPin className="w-4 h-4" />} />
                            <InputField label="Pickup Time" placeholder="e.g. 08:30" value={pickupTime} onChange={e => onPickupTimeChange(e.target.value)} leftIcon={<Clock className="w-4 h-4" />} />
                        </div>
                        <TextArea label="Special Notes" placeholder="Allergies, special requests, etc." value={notes} onChange={onNotesChange} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BookingContent;
