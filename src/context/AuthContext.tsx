import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, signOutUser } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  guestAccessGranted: boolean;
  continueAsGuest: () => void;
  authError: string | null;
  authModalOpen: boolean;
  authModalTab: 'signin' | 'signup';
  openAuthModal: (tab?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  // A stored data mode does not count as choosing guest access on a new visit.
  const [guestAccessGranted, setGuestAccessGranted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;
    let receivedAuthEvent = false;
    const applySession = (nextSession: Session | null) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      receivedAuthEvent = true;
      applySession(nextSession);
      if (nextSession || event === 'SIGNED_OUT') {
        setGuestAccessGranted(false);
        setAuthModalOpen(false);
        setAuthModalTab('signin');
        setAuthError(null);
      }
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (mounted && !receivedAuthEvent) applySession(error ? null : data.session);
    }).catch(() => {
      if (mounted && !receivedAuthEvent) applySession(null);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = (tab: 'signin' | 'signup' = 'signin') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const continueAsGuest = () => {
    setGuestAccessGranted(true);
    setAuthModalOpen(false);
    setAuthError(null);
  };

  const signOut = async () => {
    setAuthError(null);
    try {
      const result = await signOutUser();
      if (result?.error) throw result.error;
      setGuestAccessGranted(false);
      setAuthModalOpen(false);
      setAuthModalTab('signin');
      setUser(null);
      setSession(null);
    } catch {
      setAuthError('Could not sign out. Check your connection and try signing out again.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        guestAccessGranted,
        continueAsGuest,
        authError,
        authModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

