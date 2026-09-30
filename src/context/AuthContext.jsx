import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseClient, getConfig } from '../supabaseClient';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  isDemo: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  enterDemoMode: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // 1. Check if user previously logged in via local/demo session
    const savedUser = localStorage.getItem('smart_automation_current_user');
    const savedDemo = localStorage.getItem('smart_automation_is_demo');

    if (savedDemo === 'true') {
      setUser({
        id: 'demo-user-id',
        email: 'alex.developer@smartautomation.io',
        user_metadata: { full_name: 'Alex Developer', role: 'Principal Architect' },
      });
      setIsDemo(true);
      setLoading(false);
      return;
    }

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem('smart_automation_current_user');
      }
    }

    // 2. Check Supabase Auth session if configured
    const client = getSupabaseClient();
    if (!client) {
      setLoading(false);
      return;
    }

    client.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        if (session.access_token) {
          localStorage.setItem('supabase_auth_token', session.access_token);
        }
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        if (session.access_token) {
          localStorage.setItem('supabase_auth_token', session.access_token);
        }
      } else if (!localStorage.getItem('smart_automation_current_user') && !localStorage.getItem('smart_automation_is_demo')) {
        setUser(null);
        localStorage.removeItem('supabase_auth_token');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const client = getSupabaseClient();
    
    if (!client) {
      throw new Error(
        'Supabase Anon Key is missing! To sign in to your Supabase project, please paste your anon key in .env or configure it below.'
      );
    }

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message?.toLowerCase().includes('email not confirmed')) {
        throw new Error(
          'Email not confirmed in Supabase! Either verify your email via the confirmation link, or disable "Confirm email" in Supabase Dashboard -> Authentication -> Providers -> Email.'
        );
      }
      throw error;
    }

    if (data?.user) {
      setUser(data.user);
      setSession(data.session);
      setIsDemo(false);
      localStorage.removeItem('smart_automation_is_demo');
      localStorage.setItem('smart_automation_current_user', JSON.stringify(data.user));
      if (data.session?.access_token) {
        localStorage.setItem('supabase_auth_token', data.session.access_token);
      }
      return data;
    }
  };

  const signUp = async (email, password, fullName) => {
    const client = getSupabaseClient();

    if (!client) {
      throw new Error(
        'Supabase Anon Key is missing! To create accounts in your Supabase dashboard (auth.users), add your anon key to .env (line 5) or paste it in the configuration box below.'
      );
    }

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) throw error;

    // Check if Supabase created user
    if (data.user) {
      // Also try to insert into profiles table if available
      try {
        await client.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName || data.user.email.split('@')[0],
        });
      } catch {
        // Table trigger in supabase-schema.sql handles this if migration was run
      }

      setUser(data.user);
      setSession(data.session);
      localStorage.setItem('smart_automation_current_user', JSON.stringify(data.user));
      if (data.session?.access_token) {
        localStorage.setItem('supabase_auth_token', data.session.access_token);
      }

      return {
        ...data,
        isEmailConfirmationRequired: !data.session && !!data.user,
      };
    }

    return data;
  };

  const signOut = async () => {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    localStorage.removeItem('supabase_auth_token');
    localStorage.removeItem('smart_automation_is_demo');
    localStorage.removeItem('smart_automation_current_user');
    setUser(null);
    setSession(null);
    setIsDemo(false);
  };

  const enterDemoMode = () => {
    const demoUser = {
      id: 'demo-user-id',
      email: 'alex.developer@smartautomation.io',
      user_metadata: { full_name: 'Alex Developer', role: 'Principal Architect' },
    };
    localStorage.setItem('smart_automation_is_demo', 'true');
    localStorage.setItem('smart_automation_current_user', JSON.stringify(demoUser));
    localStorage.setItem('supabase_auth_token', 'demo-token');
    setUser(demoUser);
    setIsDemo(true);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isDemo, signIn, signUp, signOut, enterDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
