import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  session: string | null;
  loading: boolean;
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for an existing session (e.g., from localStorage)
    const storedSession = localStorage.getItem('userSession');
    if (storedSession) {
      setSession(storedSession);
    }
    setLoading(false);
  }, []);

  const login = async (username: string) => {
    setLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const newSession = `user-${username}-${Date.now()}`;
        localStorage.setItem('userSession', newSession);
        setSession(newSession);
        setLoading(false);
        resolve();
      }, 500); // Simulate API call
    });
  };

  const logout = async () => {
    setLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('userSession');
        setSession(null);
        setLoading(false);
        resolve();
      }, 300); // Simulate API call
    });
  };

  return (
    <AuthContext.Provider value={{ session, loading, login, logout }}>
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