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
  signup: (fullName: string, email: string, password: string, isTechnician: boolean) => Promise<boolean>;
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
  const [loading, setLoading] = useState(true); // Inicia como true para indicar que a autenticação está sendo verificada

  console.log('AuthContext: AuthProvider rendering. Current loading:', loading, 'Session user ID:', session?.user?.id);

  const fetchUserProfile = async (currentUser: User) => {
    console.log('AuthContext: fetchUserProfile for user ID:', currentUser.id);
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', currentUser.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      setUsername(null);
    } else if (data) {
      setUsername(data.full_name);
      console.log('AuthContext: User profile fetched, username:', data.full_name);
    }
  };

  const fetchUserRole = async (userId: string) => {
    console.log('AuthContext: fetchUserRole for userId:', userId);
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
      console.log('AuthContext: User role fetched, role:', data.role);
    }
  };

  useEffect(() => {
    console.log('AuthContext: useEffect for initial session and listener setup. Setting loading to true.');
    setLoading(true); // Inicia o estado de carregamento

    const { data } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        console.log('AuthContext: onAuthStateChange triggered, event:', _event, 'session user ID:', currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user || null);
        try {
          if (currentSession) {
            await fetchUserProfile(currentSession.user);
            await fetchUserRole(currentSession.user.id);
          } else {
            setUsername(null);
            setUserRole(null);
          }
        } catch (error) {
          console.error("AuthContext: Error during profile/role fetch in onAuthStateChange:", error);
          // Opcionalmente, você pode querer mostrar um erro na UI aqui
          setUsername(null);
          setUserRole(null);
        } finally {
          setLoading(false); // Define loading como false após processar qualquer mudança de estado de autenticação
          console.log('AuthContext: onAuthStateChange finished processing. Setting loading to false.');
        }
      }
    );

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    console.log('AuthContext: login started, loading set to true.');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        showError(error.message);
        return false;
      }
      showSuccess("Login realizado com sucesso!");
      console.log('AuthContext: Login successful for user ID:', data.user?.id);
      return true;
    } catch (error: any) {
      showError(error.message);
      return false;
    } finally {
      setLoading(false);
      console.log('AuthContext: login finished, loading set to false.');
    }
  };

  const signup = async (fullName: string, email: string, password: string, isTechnician: boolean) => {
    setLoading(true);
    console.log('AuthContext: signup started, loading set to true.');
    try {
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
      if (error) {
        showError(error.message);
        return false;
      }
      if (data.user) {
        showSuccess("Cadastro realizado com sucesso! Verifique seu e-mail para confirmar.");
        console.log('AuthContext: Signup successful for user ID:', data.user?.id);
        return true;
      }
      return false;
    } catch (error: any) {
      showError(error.message);
      return false;
    } finally {
      setLoading(false);
      console.log('AuthContext: signup finished, loading set to false.');
    }
  };

  const logout = async () => {
    setLoading(true);
    console.log('AuthContext: logout started, loading set to true.');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        showError(error.message);
      } else {
        showSuccess("Você foi desconectado com sucesso!");
        console.log('AuthContext: Logout successful.');
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
      console.log('AuthContext: logout finished, loading set to false.');
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

  console.log('AuthContext: Provider value being passed. Loading:', loading, 'Session user ID:', session?.user?.id);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};