import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  session: string | null;
  username: string | null; // Adicionado para armazenar o nome de usuário
  loading: boolean;
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null); // Estado para o nome de usuário
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedSession = localStorage.getItem('userSession');
    if (storedSession) {
      setSession(storedSession);
      // Extrair o username da sessão simulada
      const parts = storedSession.split('-');
      if (parts.length > 1) {
        setUsername(parts[1]);
      }
    }
    setLoading(false);
  }, []);

  const login = async (inputUsername: string) => {
    setLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const newSession = `user-${inputUsername}-${Date.now()}`;
        localStorage.setItem('userSession', newSession);
        setSession(newSession);
        setUsername(inputUsername); // Definir o nome de usuário ao logar
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
        setUsername(null); // Limpar o nome de usuário ao deslogar
        setLoading(false);
        resolve();
      }, 300); // Simulate API call
    });
  };

  return (
    <AuthContext.Provider value={{ session, username, loading, login, logout }}>
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