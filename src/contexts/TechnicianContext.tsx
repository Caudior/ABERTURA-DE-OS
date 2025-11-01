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
  addTechnician: (name: string, email: string) => void;
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
      setTechnicians(data.map(tech => ({
        id: tech.id,
        name: tech.full_name || 'Nome Desconhecido',
        email: tech.email || 'Email Desconhecido',
      })));
    }
    setLoadingTechnicians(false);
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const addTechnician = async (name: string, email: string) => {
    // No Supabase, o técnico é adicionado via signup.
    // Esta função é mais para garantir que o contexto local seja atualizado
    // ou para adicionar técnicos que já existem no Supabase mas não no estado local.
    if (technicians.some(tech => tech.email.toLowerCase() === email.toLowerCase())) {
      showError(`O e-mail "${email}" já está em uso por um técnico.`);
      return;
    }
    // Se o técnico já foi criado via signup, ele será buscado no fetchTechnicians.
    // Para fins de demonstração, se for chamado diretamente, podemos adicionar ao estado local.
    // Em um cenário real, a adição de um técnico seria feita através do signup ou de uma interface de administração.
    const newId = `tech-${Date.now()}`; // Gerar um ID temporário para o contexto local
    const newTechnician: Technician = { id: newId, name, email };
    setTechnicians((prevTechs) => [...prevTechs, newTechnician]);
    showSuccess(`Técnico "${name}" cadastrado com sucesso!`);
    // Após adicionar, re-fetch para garantir consistência com o Supabase se houver um delay no trigger
    fetchTechnicians(); 
  };

  return (
    <TechnicianContext.Provider value={{ technicians, addTechnician, loadingTechnicians }}>
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