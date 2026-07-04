'use client';

import { createContext, useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { User, Session, Profile, AuthContextType } from '@/types/auth.types';
import { createClient } from '@/lib/supabase/client';
import {
  APPLE_BUNDLE_ID,
  APPLE_NATIVE_REDIRECT,
  generateAppleNonce,
  isAppleSignInCancelled,
} from '@/lib/appleAuth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** iOS TestFlight uses com.deencompanion.app; Android Play uses com.deencompanion.lite */
function getNativeOAuthRedirect(): string {
  if (Capacitor.getPlatform() === 'android') {
    return 'com.deencompanion.lite://login-callback';
  }
  return 'com.deencompanion.app://login-callback';
}

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

        // PKCE flow (Supabase v2 default): code is in the query string
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get('code');

        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          return;
        }

        // Implicit flow fallback: tokens in the URL fragment
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
        redirectTo: getNativeOAuthRedirect(),
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

  const signInWithApple = async () => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      return { error: new Error('Apple Sign-In is only available on iOS') };
    }

    try {
      const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');
      const { rawNonce, hashedNonce } = await generateAppleNonce();

      const result = await SignInWithApple.authorize({
        clientId: APPLE_BUNDLE_ID,
        redirectURI: APPLE_NATIVE_REDIRECT,
        scopes: 'email name',
        nonce: hashedNonce,
      });

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: result.response.identityToken,
        nonce: rawNonce,
      });

      if (error) {
        return { error };
      }

      if (result.response.givenName && data.user) {
        const fullName = `${result.response.givenName} ${result.response.familyName ?? ''}`.trim();
        await supabase.auth.updateUser({
          data: {
            full_name: fullName,
            given_name: result.response.givenName,
            family_name: result.response.familyName ?? undefined,
          },
        });
        await supabase
          .from('profiles')
          .update({ display_name: fullName })
          .eq('id', data.user.id);
      }

      return { error: null };
    } catch (err) {
      if (isAppleSignInCancelled(err)) {
        return { error: null };
      }
      return { error: err instanceof Error ? err : new Error('Apple sign-in failed') };
    }
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
    signInWithApple,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

