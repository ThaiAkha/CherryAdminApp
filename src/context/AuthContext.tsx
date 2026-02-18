import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, UserProfile } from '../services/auth.service';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import AkhaPixelPattern from '../components/ui/AkhaPixelPattern';

interface AuthContextType {
    user: UserProfile | null;
    session: Session | null;
    loading: boolean;
    signIn: typeof authService.signIn;
    signOut: typeof authService.signOut;
    updateProfile: typeof authService.updateProfile;
    changePassword: typeof authService.changePassword;
    uploadAvatar: typeof authService.uploadAvatar;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(() => {
        const cached = localStorage.getItem('akha_user_profile_cache_v1');
        return cached ? JSON.parse(cached) : null;
    });
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
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);

                if (session) {
                    const cached = localStorage.getItem('akha_user_profile_cache_v1');
                    const cachedUser = cached ? JSON.parse(cached) : null;

                    if (cachedUser && cachedUser.id === session.user.id) {
                        setUser(cachedUser);
                        setLoading(false);
                        // Background refresh — non blocca l'UI
                        refreshProfile();
                        return;
                    }

                    // No cache match — fetch obbligatorio
                    await refreshProfile();
                } else {
                    setUser(null);
                    localStorage.removeItem('akha_user_profile_cache_v1');
                }
            } catch (error) {
                console.error("[Auth] initAuth error:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("[Auth] onAuthStateChange:", event);
            if (session) {
                setLoading(true); // Prevent race condition between SignIn and ProtectedRoute
                setSession(session);
                await refreshProfile();
            } else {
                setSession(null);
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

    const signIn = async (email: string, password: string) => {
        const response = await authService.signIn(email, password);
        if (response?.session) {
            await refreshProfile();
        }
        return response;
    };

    const value = {
        user,
        session,
        loading,
        signIn,
        signOut: authService.signOut,
        updateProfile,
        changePassword: authService.changePassword,
        uploadAvatar: authService.uploadAvatar,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
                    <AkhaPixelPattern variant="logo" size={10} speed={30} />
                </div>
            ) : children}
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
