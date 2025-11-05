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
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (currentUser: User) => {
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
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user || null);
        if (initialSession) {
          await fetchUserProfile(initialSession.user);
          await fetchUserRole(initialSession.user.id);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };
    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        if (currentSession) {
          await fetchUserProfile(currentSession.user);
          await fetchUserRole(currentSession.user.id);
        } else {
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
    setLoading(true);
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
      setLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, password: string, isTechnician: boolean) => {
    setLoading(true);
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
        return true;
      }
      return false;
    } catch (error: any) {
      showError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        showError(error.message);
      } else {
        showSuccess("Você foi desconectado com sucesso!");
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
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