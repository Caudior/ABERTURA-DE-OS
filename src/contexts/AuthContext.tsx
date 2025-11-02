import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { showSuccess, showError } from '@/utils/toast';

interface AuthContextType {
  session: Session | null;
  username: string | null;
  userRole: string | null; // Adicionado userRole
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, isTechnician: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // Estado para a função do usuário
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      setUserRole(null);
      return null;
    }
    return data;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          setUsername(profile.full_name || session.user.email?.split('@')[0] || null);
          setUserRole(profile.role);
        } else {
          setUsername(session.user.email?.split('@')[0] || null);
          setUserRole(null);
        }
      } else {
        setUsername(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          setUsername(profile.full_name || session.user.email?.split('@')[0] || null);
          setUserRole(profile.role);
        } else {
          setUsername(session.user.email?.split('@')[0] || null);
          setUserRole(null);
        }
      } else {
        setUsername(null);
        setUserRole(null);
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
          role: isTechnician ? 'technician' : 'client',
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
    setUserRole(null); // Limpar a função ao fazer logout
  };

  return (
    <AuthContext.Provider value={{ session, username, userRole, loading, login, signup, logout }}>
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