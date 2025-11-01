import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { showSuccess, showError } from '@/utils/toast';

interface AuthContextType {
  session: Session | null;
  username: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, isTechnician: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.user_metadata?.full_name) {
        setUsername(session.user.user_metadata.full_name);
      } else if (session?.user?.email) {
        setUsername(session.user.email.split('@')[0]); // Fallback para email
      } else {
        setUsername(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.user_metadata?.full_name) {
        setUsername(session.user.user_metadata.full_name);
      } else if (session?.user?.email) {
        setUsername(session.user.email.split('@')[0]);
      } else {
        setUsername(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      throw error;
    }
    showSuccess('Login realizado com sucesso!');
  };

  const signup = async (fullName: string, email: string, password: string, isTechnician: boolean) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: isTechnician ? 'technician' : 'client', // Adicionar role ao metadata
        },
      },
    });
    setLoading(false);
    if (error) {
      throw error;
    }
    if (data.user) {
      showSuccess('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.');
    }
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) {
      showError('Erro ao fazer logout.');
      throw error;
    }
    showSuccess('Logout realizado com sucesso!');
    setSession(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ session, username, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};