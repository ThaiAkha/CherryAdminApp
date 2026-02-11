import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, UserProfile } from '../services/auth.service';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: UserProfile | null;
    session: Session | null;
    loading: boolean;
    signIn: typeof authService.signIn;
    signOut: typeof authService.signOut;
    updateProfile: typeof authService.updateProfile;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // Function to refresh user profile data
    const refreshProfile = async () => {
        try {
            const profile = await authService.getCurrentUserProfile();
            setUser(profile);
        } catch (error) {
            console.error("Error refreshing profile:", error);
            setUser(null);
        }
    };

    useEffect(() => {
        // Initial fetch
        const initAuth = async () => {
            console.log("[Auth] initAuth: Starting...");
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                console.log("[Auth] initAuth: Session fetched", session?.user?.email);
                setSession(session);
                if (session) {
                    console.log("[Auth] initAuth: Refreshing profile...");
                    await refreshProfile();
                    console.log("[Auth] initAuth: Profile refreshed.");
                }
            } catch (error) {
                console.error("[Auth] initAuth: Error:", error);
            } finally {
                console.log("[Auth] initAuth: Finally block reached. Setting loading=false");
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("[Auth] onAuthStateChange:", event);
            setSession(session);
            if (session) {
                await refreshProfile();
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const updateProfile = async (userId: string, updates: Partial<UserProfile>) => {
        await authService.updateProfile(userId, updates);
        await refreshProfile();
    };

    const value = {
        user,
        session,
        loading,
        signIn: authService.signIn,
        signOut: authService.signOut,
        updateProfile,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <div className="p-10 text-center">Loading Auth...</div> : children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
