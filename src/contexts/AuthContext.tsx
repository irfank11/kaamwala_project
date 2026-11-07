import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, Role } from '@/lib/types';

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  role: Exclude<Role, 'admin'>;
}

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (input: SignUpInput) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login')) return 'Email or password is incorrect.';
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return 'An account with this email already exists. Try logging in instead.';
  }
  if (lower.includes('password')) return 'Password must be at least 6 characters.';
  if (lower.includes('fetch') || lower.includes('network')) return 'Network problem. Check your connection and try again.';
  return 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, full_name, phone, city, avatar_url, created_at')
      .eq('id', userId)
      .maybeSingle();
    setProfile(error ? null : data);
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadProfile(data.session?.user.id);
      if (active) setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      (async () => {
        await loadProfile(nextSession?.user.id);
      })();
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return friendlyAuthError(error.message);
      await loadProfile(data.user.id);
      return null;
    },
    [loadProfile],
  );

  const signUp = useCallback(
    async ({ email, password, fullName, role }: SignUpInput) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role } },
      });
      if (error) return friendlyAuthError(error.message);
      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) return friendlyAuthError(signInError.message);
      }
      if (data.user) await loadProfile(data.user.id);
      return null;
    },
    [loadProfile],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile(session?.user.id);
  }, [loadProfile, session]);

  const value = useMemo<AuthContextValue>(
    () => ({ session, profile, loading, signIn, signUp, signOut, refreshProfile }),
    [session, profile, loading, signIn, signUp, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
