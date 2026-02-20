import React from 'react';
import { User, Mail, MapPin, Search, Briefcase, ShieldCheck, Lock, CheckCircle2, Globe, Users } from 'lucide-react';
import { cn } from '../../../lib/utils';
import InputField from '../../../components/form/input/InputField';
import Button from '../../../components/ui/button/Button';
import TextArea from '../../../components/form/input/TextArea';
import SelectField from '../../../components/form/input/SelectField';
import PhoneCountryInput from '../../common/PhoneCountryInput';
import { UserMode, NewUser } from '../../../hooks/useAdminBooking';
import ZoneInfoCard from '../ZoneInfoCard';

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
    hotelSearchQuery: string;
    onHotelSearchQueryChange: (q: string) => void;
    hotelSearchResults: any[];
    onHotelSelect: (h: any) => void;
    pickupZone: any | null;
    notes: string;
    onNotesChange: (n: string) => void;
    hasLuggage: boolean;
    onHasLuggageChange: (l: boolean) => void;
    authUser?: any;
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
    hotelSearchQuery,
    onHotelSearchQueryChange,
    hotelSearchResults,
    onHotelSelect,
    pickupZone,
    notes,
    onNotesChange,
    hasLuggage,
    onHasLuggageChange,
    authUser
}) => {
    return (
        <div className="lg:col-span-6 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative min-h-[400px]">

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
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-6">
                                    <InputField
                                        label="Full Name"
                                        placeholder="e.g. John Doe"
                                        value={newUser.fullName}
                                        onChange={e => onNewUserChange({ ...newUser, fullName: e.target.value })}
                                        leftIcon={<User className="w-4 h-4" />}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <InputField
                                        label="Age"
                                        type="number"
                                        placeholder="Age"
                                        value={newUser.age}
                                        onChange={e => onNewUserChange({ ...newUser, age: e.target.value ? Number(e.target.value) : '' })}
                                        leftIcon={<Users className="w-4 h-4" />}
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-black uppercase text-gray-500 tracking-wider px-1">Gender</label>
                                    <SelectField
                                        value={newUser.gender || ''}
                                        onChange={e => onNewUserChange({ ...newUser, gender: e.target.value as any })}
                                        className="h-[46px]"
                                    >
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </SelectField>
                                </div>
                                <div className="col-span-2">
                                    <InputField
                                        label="Nationality"
                                        placeholder="e.g. IT"
                                        value={newUser.nationality}
                                        onChange={e => onNewUserChange({ ...newUser, nationality: e.target.value })}
                                        leftIcon={<Globe className="w-4 h-4" />}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    label="Email (for sign-in)"
                                    placeholder="john@doe.com"
                                    value={newUser.email}
                                    onChange={e => onNewUserChange({ ...newUser, email: e.target.value })}
                                    leftIcon={<Mail className="w-4 h-4" />}
                                />
                                <InputField
                                    label="Password"
                                    type="password"
                                    placeholder="Min. 8 chars"
                                    value={newUser.password}
                                    onChange={e => onNewUserChange({ ...newUser, password: e.target.value })}
                                    leftIcon={<Lock className="w-4 h-4" />}
                                />
                            </div>

                            <div className="space-y-2 max-w-sm">
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <PhoneCountryInput
                                            label="Phone & WhatsApp"
                                            value={newUser.phone}
                                            onChange={val => onNewUserChange({ ...newUser, phone: val })}
                                            onCountryChange={c => {
                                                if (c.code && !newUser.nationality) {
                                                    onNewUserChange({ ...newUser, nationality: c.code });
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col justify-end pb-0.5">
                                        <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 p-1 rounded-xl border border-gray-100 dark:border-gray-800 shadow-inner shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => onNewUserChange({ ...newUser, isWhatsapp: false })}
                                                className={cn(
                                                    "px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all",
                                                    !newUser.isWhatsapp ? "bg-brand-500 text-white shadow-md" : "text-gray-400 hover:text-gray-600"
                                                )}
                                            >
                                                No WA
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onNewUserChange({ ...newUser, isWhatsapp: true })}
                                                className={cn(
                                                    "px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all",
                                                    newUser.isWhatsapp ? "bg-brand-500 text-white shadow-md" : "text-gray-400 hover:text-gray-600"
                                                )}
                                            >
                                                OK
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODE: EXISTING & AGENCY (now unified search pattern) */}
                    {(userMode === 'existing' || userMode === 'agency') && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                            <InputField
                                label={userMode === 'existing' ? "Search Guest" : "Search Partner / Agency"}
                                placeholder={userMode === 'existing' ? "Type name..." : "Search agency name..."}
                                value={searchTerm}
                                onChange={e => onSearchTermChange(e.target.value)}
                                leftIcon={<Search className="w-4 h-4" />}
                            />
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
                                    <div className={cn(
                                        "size-10 rounded-full flex items-center justify-center font-black text-lg",
                                        userMode === 'existing' ? "bg-green-100 text-green-600" : "bg-purple-100 text-purple-600"
                                    )}>
                                        {selectedUser.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className={cn(
                                            "font-black",
                                            userMode === 'existing' ? "text-green-800 dark:text-green-300" : "text-purple-800 dark:text-purple-300"
                                        )}>{selectedUser.full_name}</p>
                                        <p className={cn(
                                            "text-xs",
                                            userMode === 'existing' ? "text-green-600 dark:text-green-400" : "text-purple-600 dark:text-purple-400"
                                        )}>{selectedUser.email}</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="ml-auto text-red-500 border-red-200 hover:bg-red-50" onClick={() => onSelectedUserChange(null)}>Remove</Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* MODE: AGENCY / INTERNAL ... (omitted for brevity, keep as is or slightly polish) */}
                    {userMode === 'internal' && (
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800/30 flex items-center gap-4 animate-in fade-in">
                            <div className="size-12 rounded-2xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-orange-800 dark:text-orange-300 italic uppercase">Internal Booking</h4>
                                <p className="text-xs text-orange-600 dark:text-orange-400 font-bold">
                                    {authUser ? `Authed as: ${authUser.full_name}` : "Booking will be logged as Staff/Internal"}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* LOGISTICS & NOTES (Refactored) */}
                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 space-y-4">
                        <h5 className="font-black text-sm uppercase text-gray-400 tracking-widest mb-4">Logistics & Notes</h5>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <InputField
                                    label="Hotel / Pickup Point"
                                    placeholder="Search hotel (min. 2 chars)..."
                                    value={hotelSearchQuery}
                                    onChange={e => onHotelSearchQueryChange(e.target.value)}
                                    leftIcon={<MapPin className="w-4 h-4" />}
                                    autoComplete="off"
                                />
                                {hotelSearchResults.length > 0 && (
                                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
                                        {hotelSearchResults.map(h => (
                                            <button
                                                key={h.id}
                                                type="button"
                                                onClick={() => onHotelSelect(h)}
                                                className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0 flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                        <MapPin className="w-4 h-4 text-gray-400 group-hover:text-brand-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{h.name}</p>
                                                        <p className="text-[10px] text-gray-500">{h.pickup_zones?.name || 'No Zone'}</p>
                                                    </div>
                                                </div>
                                                <CheckCircle2 className="w-4 h-4 text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-gray-500 tracking-wider px-1">Luggage</label>
                                <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 p-1 rounded-xl border border-gray-100 dark:border-gray-800 shadow-inner h-[46px]">
                                    <button
                                        type="button"
                                        onClick={() => onHasLuggageChange(false)}
                                        className={cn(
                                            "flex-1 h-full text-[10px] font-black uppercase rounded-lg transition-all",
                                            !hasLuggage ? "bg-brand-500 text-white shadow-md" : "text-gray-400 hover:text-gray-600"
                                        )}
                                    >
                                        No Luggage
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onHasLuggageChange(true)}
                                        className={cn(
                                            "flex-1 h-full text-[10px] font-black uppercase rounded-lg transition-all",
                                            hasLuggage ? "bg-brand-500 text-white shadow-md" : "text-gray-400 hover:text-gray-600"
                                        )}
                                    >
                                        Has Luggage
                                    </button>
                                </div>
                            </div>
                        </div>

                        {pickupZone && (
                            <div className="animate-in slide-in-from-top-2 fade-in">
                                <ZoneInfoCard zone={pickupZone} />
                            </div>
                        )}

                        <TextArea
                            label="Extra Notes"
                            placeholder="Any special requests or additional information..."
                            value={notes}
                            onChange={onNotesChange}
                        />

                    </div>
                </div>

            </div>
        </div>
    );
};

export default BookingContent;
