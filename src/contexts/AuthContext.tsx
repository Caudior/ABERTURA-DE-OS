"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: string | null;
  username: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, role: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUserProfile: (user: User) => Promise<void>;
  fetchUserRole: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Inicia como true para carregar a sessão inicial

  const fetchUserProfile = async (currentUser: User) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', currentUser.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      setUsername(null);
    } else if (data) {
      setUsername(data.name);
    }
  };

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
      setUserRole(null);
    } else if (data) {
      setUserRole(data.role);
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
        if (session) {
          await fetchUserProfile(session.user);
          await fetchUserRole(session.user.id);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false); // Garante que o loading seja false após a verificação inicial
      }
    };
    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        // Este listener deve apenas reagir às mudanças de estado de autenticação,
        // não gerenciar o indicador de carregamento global.
        setSession(currentSession);
        setUser(currentSession?.user || null);
        if (currentSession) {
          await fetchUserProfile(currentSession.user);
          await fetchUserRole(currentSession.user.id);
        } else {
          // Limpar estados específicos do usuário ao fazer logout
          setUsername(null);
          setUserRole(null);
        }
      }
    );

    return () => {
      authListener.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true); // Inicia o carregamento
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        showError(error.message);
        return false;
      }
      showSuccess("Login realizado com sucesso!");
      return true;
    } catch (error: any) {
      showError(error.message);
      return false;
    } finally {
      setLoading(false); // Finaliza o carregamento
    }
  };

  const signup = async (email: string, password: string, role: string, name: string) => {
    setLoading(true); // Inicia o carregamento
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        showError(error.message);
        return false;
      }
      if (data.user) {
        await supabase.from('profiles').insert({ id: data.user.id, email, role, name });
        showSuccess("Cadastro realizado com sucesso! Verifique seu e-mail para confirmar.");
        return true;
      }
      return false;
    } catch (error: any) {
      showError(error.message);
      return false;
    } finally {
      setLoading(false); // Finaliza o carregamento
    }
  };

  const logout = async () => {
    setLoading(true); // Inicia o carregamento para a operação de logout
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        showError(error.message);
      } else {
        showSuccess("Você foi desconectado com sucesso!");
        // O listener onAuthStateChange irá atualizar session/user para null.
        // O setLoading(false) no finally garante que o indicador seja desativado.
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false); // Garante que o loading seja sempre false após a tentativa de logout
    }
  };

  const value = {
    session,
    user,
    userRole,
    username,
    loading,
    login,
    signup,
    logout,
    fetchUserProfile,
    fetchUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};