import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { showSuccess, showError } from '@/utils/toast';

interface AuthContextType {
  session: Session | null;
  username: string | null;
  userRole: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, isTechnician: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log('AuthContext: AuthProvider component rendering...'); // Novo log
  const [session, setSession] = useState<Session | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    console.log('AuthContext: Fetching user profile for ID:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('AuthContext: Error fetching user profile:', error);
      // Se o perfil não for encontrado, pode ser um novo usuário, então definimos um papel padrão.
      setUserRole(null); // Manter null para indicar que não foi encontrado no DB
      return null;
    }
    console.log('AuthContext: User profile fetched:', data);
    return data;
  };

  useEffect(() => {
    console.log('AuthContext: useEffect running...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('AuthContext: Auth state changed event:', _event, 'Session:', session);
      setSession(session);
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          setUsername(profile.full_name || session.user.email?.split('@')[0] || null);
          setUserRole(profile.role);
        } else {
          // Se o perfil não for encontrado, o usuário pode ser novo ou a criação do perfil falhou.
          // Definir nome de usuário e função padrão com base no e-mail.
          setUsername(session.user.email?.split('@')[0] || null);
          setUserRole('client'); // Função padrão se o perfil não for encontrado
          console.warn('AuthContext: User profile not found, defaulting role to "client".');
        }
      } else {
        setUsername(null);
        setUserRole(null);
      }
      setLoading(false);
      console.log('AuthContext: setLoading(false) after onAuthStateChange');
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('AuthContext: Initial getSession result:', session);
      setSession(session);
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          setUsername(profile.full_name || session.user.email?.split('@')[0] || null);
          setUserRole(profile.role);
        } else {
          setUsername(session.user.email?.split('@')[0] || null);
          setUserRole('client'); // Função padrão se o perfil não for encontrado
          console.warn('AuthContext: User profile not found during initial getSession, defaulting role to "client".');
        }
      } else {
        setUsername(null);
        setUserRole(null);
      }
      setLoading(false);
      console.log('AuthContext: setLoading(false) after getSession');
    }).catch(error => {
      console.error('AuthContext: Error fetching initial session:', error);
      setLoading(false);
      console.log('AuthContext: setLoading(false) after getSession error');
    });

    return () => {
      console.log('AuthContext: Unsubscribing from auth state changes.');
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    console.log('AuthContext: Attempting login for:', email);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
    showSuccess('Login realizado com sucesso!');
    console.log('AuthContext: Login successful.');
  };

  const signup = async (fullName: string, email: string, password: string, isTechnician: boolean) => {
    setLoading(true);
    console.log('AuthContext: Attempting signup for:', email, 'Role:', isTechnician ? 'technician' : 'client');
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
      console.error('AuthContext: Signup error:', error);
      throw error;
    }
    if (data.user) {
      showSuccess('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.');
      console.log('AuthContext: Signup successful, user:', data.user);
    }
  };

  const logout = async () => {
    setLoading(true);
    console.log('AuthContext: Attempting logout.');
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) {
      showError('Erro ao fazer logout.');
      console.error('AuthContext: Logout error:', error);
      throw error;
    }
    showSuccess('Logout realizado com sucesso!');
    setSession(null);
    setUsername(null);
    setUserRole(null);
    console.log('AuthContext: Logout successful.');
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