"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(true);

  const fetchTechnicians = async () => {
    setLoadingTechnicians(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'technician');

    if (error) {
      console.error('Error fetching technicians:', error);
      showError('Erro ao carregar técnicos.');
    } else {
      console.log('Fetched raw technicians data from Supabase:', data); // Log para depuração dos dados brutos
      const mappedTechnicians = data.map(tech => ({
        id: tech.id,
        name: tech.full_name || 'Nome Desconhecido',
        email: tech.email || 'Email Desconhecido',
      }));
      setTechnicians(mappedTechnicians);
      console.log('Mapped technicians in state:', mappedTechnicians); // Log para depuração dos técnicos mapeados
    }
    setLoadingTechnicians(false);
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

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