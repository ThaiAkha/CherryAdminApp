import { useState, useEffect } from 'react';
import { authService, UserProfile } from '../services/auth.service';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) {
                fetchProfile();
            } else {
                setLoading(false);
            }
        });

        // 2. Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                fetchProfile();
            } else {
                setUserProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async () => {
        try {
            const profile = await authService.getCurrentUserProfile();
            setUserProfile(profile);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            setLoading(true);
            const data = await authService.signIn(email, password);
            return data;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, fullName: string) => {
        try {
            setLoading(true);
            const data = await authService.signUp(email, password, fullName);
            return data;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signUpAgency = async (
        email: string,
        password: string,
        companyName: string,
        taxId: string,
        phone: string
    ) => {
        try {
            setLoading(true);
            const data = await authService.signUpAgency(email, password, companyName, taxId, phone);
            return data;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            setLoading(true);
            await authService.signOut();
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (email: string) => {
        try {
            setLoading(true);
            await authService.resetPassword(email);
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!userProfile?.id) return;
        try {
            setLoading(true);
            await authService.updateProfile(userProfile.id, updates);
            await fetchProfile(); // Refresh profile after update
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        session,
        user: userProfile,
        loading,
        error,
        signIn,
        signUp,
        signUpAgency,
        signOut,
        resetPassword,
        updateProfile,
        isAuthenticated: !!session,
    };
};
