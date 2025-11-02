"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext'; // Importar useAuth

export interface Technician {
  id: string;
  name: string;
  email: string;
}

interface TechnicianContextType {
  technicians: Technician[];
  loadingTechnicians: boolean;
}

const TechnicianContext = createContext<TechnicianContextType | undefined>(undefined);

export const TechnicianProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session, loading: authLoading } = useAuth(); // Obter sessão e authLoading do AuthContext
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(true);

  const fetchTechnicians = async () => {
    if (!session) {
      setTechnicians([]);
      setLoadingTechnicians(false);
      return;
    }

    setLoadingTechnicians(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'technician');

    if (error) {
      console.error('Error fetching technicians:', error);
      showError('Erro ao carregar técnicos.');
      setTechnicians([]); // Limpar técnicos em caso de erro
    } else {
      console.log('Fetched raw technicians data from Supabase:', data);
      const mappedTechnicians = data.map(tech => ({
        id: tech.id,
        name: tech.full_name || 'Nome Desconhecido',
        email: tech.email || 'Email Desconhecido',
      }));
      setTechnicians(mappedTechnicians);
      console.log('Mapped technicians in state:', mappedTechnicians);
    }
    setLoadingTechnicians(false);
  };

  useEffect(() => {
    if (!authLoading) { // Só tenta buscar se a autenticação não estiver mais carregando
      if (session) {
        fetchTechnicians();
      } else {
        setTechnicians([]); // Limpar técnicos se não houver sessão
        setLoadingTechnicians(false);
      }
    }
  }, [session, authLoading]); // Depende da sessão e do estado de carregamento da autenticação

  return (
    <TechnicianContext.Provider value={{ technicians, loadingTechnicians }}>
      {children}
    </TechnicianContext.Provider>
  );
};

export const useTechnicians = () => {
  const context = useContext(TechnicianContext);
  if (context === undefined) {
    throw new Error('useTechnicians must be used within a TechnicianProvider');
  }
  return context;
};