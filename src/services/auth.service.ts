import { supabase } from '../lib/supabase';

const PROFILE_CACHE_KEY = 'akha_user_profile_cache_v1';

/**
 * 👤 USER PROFILE INTERFACE
 * Include sia i dati del Turista (Guest) che quelli dell'Agenzia (B2B).
 */
export interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    role: 'admin' | 'manager' | 'agency' | 'kitchen' | 'logistics' | 'driver';

    // Dati Turista / Preferenze
    dietary_profile: string;
    allergies: string[];
    preferred_spiciness_id?: number;
    avatar_url?: string; // Per le Agenzie, questo funge da Logo Aziendale

    // 👇 DATI SPECIFICI AGENZIA (B2B)
    agency_company_name?: string;
    agency_commission_rate?: number;
    agency_tax_id?: string;
    agency_phone?: string;
    agency_commission_config?: {
        mode: 'flat' | 'tiered';
        tiers?: { min_pax: number; rate: number }[];
    };

    // 👇 INDIRIZZO & LOGISTICA AGENZIA
    agency_address?: string;
    agency_city?: string;
    agency_province?: string;
    agency_country?: string;
    agency_postal_code?: string;
}

export const authService = {

    /**
     * 📝 SIGN UP (STANDARD)
     * Registrazione standard — assegna ruolo 'agency' di default.
     * Altri ruoli (admin, manager, driver, kitchen, logistics) vengono assegnati manualmente da admin.
     */
    async signUp(email: string, password: string, fullName: string) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName }
            }
        });

        if (authError) throw authError;

        if (authData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    email: email,
                    full_name: fullName,
                    role: 'agency',
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (profileError) console.warn("Profile upsert warning:", profileError.message);
        }

        return authData;
    },

    /**
     * 🏢 SIGN UP AGENCY (PARTNER B2B)
     * Registrazione specifica per Partner: forza il ruolo 'agency' e salva i dati fiscali.
     */
    async signUpAgency(
        email: string,
        password: string,
        companyName: string,
        taxId: string,
        phone: string
    ) {
        // 1. Crea Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: companyName } // Usa il nome azienda come nome utente
            }
        });

        if (authError) throw authError;

        // 2. Scrivi Profilo Agenzia Esteso
        if (authData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    email: email,
                    full_name: companyName,     // Nome visualizzato
                    role: 'agency',             // 👈 FORZA IL RUOLO B2B

                    // Dati Specifici Agenzia
                    agency_company_name: companyName,
                    agency_tax_id: taxId,
                    agency_phone: phone,
                    agency_commission_rate: 20, // Default 20%
                    agency_commission_config: {
                        mode: 'tiered',
                        tiers: [
                            { min_pax: 1, rate: 20 },
                            { min_pax: 10, rate: 25 }
                        ]
                    },

                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (profileError) console.warn("Agency profile warning:", profileError.message);
        }

        return authData;
    },

    /** 🔑 LOGIN (Comune per tutti) */
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    },

    /** 🔄 RESET PASSWORD (Recovery Flow) */
    async resetPassword(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/auth/reset', // URL di ritorno
        });
        if (error) throw error;
    },

    /** 🚪 LOGOUT */
    async signOut() {
        await supabase.auth.signOut();
        localStorage.clear();
    },

    /** 
     * 👤 GET CURRENT SESSION PROFILE 
     * Scarica tutti i dati, inclusi quelli fiscali/agenzia se presenti.
     */
    async getCurrentUserProfile(): Promise<UserProfile | null> {
        try {
            // 🚀 STALE-WHILE-REVALIDATE: Try cache first
            const cached = localStorage.getItem(PROFILE_CACHE_KEY);
            let cachedProfile: UserProfile | null = null;
            if (cached) {
                try {
                    cachedProfile = JSON.parse(cached);
                    console.log("[AuthService] Returning cached profile:", cachedProfile?.full_name);
                } catch (e) {
                    localStorage.removeItem(PROFILE_CACHE_KEY);
                }
            }

            console.log("[AuthService] getCurrentUserProfile: Calling getUser()...");


            // Race between getUser and timeout
            const { data: { user } } = await Promise.race([
                supabase.auth.getUser(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("getUser timed out")), 10000)
                )
            ]) as any;

            console.log("[AuthService] getCurrentUserProfile: getUser result:", user?.id);

            if (!user) {
                console.log("[AuthService] getCurrentUserProfile: No user found. Clearing cache.");
                localStorage.removeItem(PROFILE_CACHE_KEY);
                return null;
            }

            // Background fetch to update cache
            const fetchAndUpdate = async () => {
                try {
                    console.log("[AuthService] Background fetching fresh profile...");
                    const { data, error } = await supabase
                        .from('profiles')
                        .select(`
                            id, full_name, email, role, avatar_url,
                            dietary_profile, allergies, preferred_spiciness_id,
                            agency_company_name, agency_commission_rate,
                            agency_tax_id, agency_phone,
                            agency_address, agency_city, agency_province, agency_country, agency_postal_code
                        `)
                        .eq('id', user.id)
                        .maybeSingle();

                    if (!error && data) {
                        const freshProfile: UserProfile = {
                            id: data.id,
                            full_name: data.full_name,
                            email: data.email,
                            role: (data.role as any) || 'agency',
                            avatar_url: data.avatar_url,
                            dietary_profile: data.dietary_profile || 'diet_regular',
                            allergies: data.allergies || [],
                            preferred_spiciness_id: data.preferred_spiciness_id || 2,
                            agency_company_name: data.agency_company_name,
                            agency_commission_rate: data.agency_commission_rate,
                            agency_tax_id: data.agency_tax_id,
                            agency_phone: data.agency_phone,
                            agency_address: data.agency_address,
                            agency_city: data.agency_city,
                            agency_province: data.agency_province,
                            agency_country: data.agency_country,
                            agency_postal_code: data.agency_postal_code
                        };
                        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(freshProfile));
                        console.log("[AuthService] Cache updated in background.");
                        return freshProfile;
                    }
                } catch (e) {
                    console.error("[AuthService] Background fetch error:", e);
                }
                return null;
            };

            if (cachedProfile && cachedProfile.id === user.id) {
                fetchAndUpdate(); // Trigger update in background
                return cachedProfile;
            }

            const freshData = await fetchAndUpdate();
            return freshData;

        } catch (err) {
            console.error("Auth profile fetch error (CAT):", err);
            return null;
        }
    },

    /**
     * 💾 UPDATE PROFILE
     * Aggiornamento generico dei dati profilo (Avatar, Nome, ecc.)
     * Necessario per UserSettings e Agency Dashboard.
     */
    async updateProfile(userId: string, updates: Partial<UserProfile>) {
        const { error } = await supabase
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) throw error;
    },

    /** 🔒 CHANGE PASSWORD */
    async changePassword(password: string) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
    },

    /** 🖼️ UPLOAD AVATAR */
    async uploadAvatar(userId: string, file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        await this.updateProfile(userId, { avatar_url: publicUrl });
        return publicUrl;
    }
};
