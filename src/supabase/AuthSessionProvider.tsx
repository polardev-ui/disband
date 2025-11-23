import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  onboardingComplete: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);

      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('id', session.user.id)
          .maybeSingle();
        setOnboardingComplete(Boolean(data?.onboarding_complete));
      }
    };

    getInitialSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const checkProfile = async () => {
      if (!session) {
        setOnboardingComplete(false);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('id', session.user.id)
        .maybeSingle();
      setOnboardingComplete(Boolean(data?.onboarding_complete));
    };
    checkProfile();
  }, [session]);

  return (
    <AuthContext.Provider value={{ session, loading, onboardingComplete }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthSession = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthSession must be used within AuthSessionProvider');
  return ctx;
};
