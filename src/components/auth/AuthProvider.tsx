'use client';

import { createContext, useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { User, Session, Profile, AuthContextType } from '@/types/auth.types';
import { createClient } from '@/lib/supabase/client';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const NATIVE_REDIRECT = 'com.deencompanion.app://login-callback';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        user_id: user?.id
      });
      return;
    }

    setProfile(data);
  }, [user, supabase]);

  // Handle deep link OAuth callback on native platforms
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      const { App } = await import('@capacitor/app');

      const handle = await App.addListener('appUrlOpen', async ({ url }: { url: string }) => {
        if (!url.includes('login-callback')) return;

        // Close the in-app browser
        try {
          const { Browser } = await import('@capacitor/browser');
          await Browser.close();
        } catch { /* browser may already be closed */ }

        // Extract tokens from the URL fragment (#access_token=...&refresh_token=...)
        const hashParams = new URLSearchParams(url.split('#')[1] ?? '');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        }
      });

      cleanup = () => handle.remove();
    })();

    return () => { cleanup?.(); };
  }, [supabase.auth]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Fetch profile when user changes
  useEffect(() => {
    if (user) {
      void refreshProfile();
    } else {
      setProfile(null);
    }
  }, [user, refreshProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signInWithOAuth = async (provider: 'google') => {
    if (Capacitor.isNativePlatform()) {
      return signInWithOAuthNative(provider);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    return { error };
  };

  const signInWithOAuthNative = async (provider: 'google') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: NATIVE_REDIRECT,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) return { error };

    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: data.url, presentationStyle: 'popover' });
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed to open browser') };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

