import React, { createContext, useContext, useState, ReactNode } from 'react';
import { showSuccess, showError } from '@/utils/toast';

export interface Technician {
  id: string;
  name: string;
  email: string; // Adicionado campo de e-mail
}

interface TechnicianContextType {
  technicians: Technician[];
  addTechnician: (name: string, email: string) => void; // Atualizado para aceitar e-mail
}

const TechnicianContext = createContext<TechnicianContextType | undefined>(undefined);

const initialTechnicians: Technician[] = [
  { id: 'tech1', name: 'Técnico A', email: 'tecnicoa@example.com' },
  { id: 'tech2', name: 'Técnico B', email: 'tecnicob@example.com' },
  { id: 'tech3', name: 'Técnico C', email: 'tecnicoc@example.com' },
];

export const TechnicianProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [technicians, setTechnicians] = useState<Technician[]>(initialTechnicians);

  const addTechnician = (name: string, email: string) => { // Atualizado para aceitar e-mail
    if (technicians.some(tech => tech.name.toLowerCase() === name.toLowerCase())) {
      showError(`O técnico "${name}" já existe.`);
      return;
    }
    if (technicians.some(tech => tech.email.toLowerCase() === email.toLowerCase())) {
      showError(`O e-mail "${email}" já está em uso.`);
      return;
    }
    const newId = `tech${technicians.length + 1}`;
    const newTechnician: Technician = { id: newId, name, email }; // Incluir e-mail
    setTechnicians((prevTechs) => [...prevTechs, newTechnician]);
    showSuccess(`Técnico "${name}" cadastrado com sucesso!`);
  };

  return (
    <TechnicianContext.Provider value={{ technicians, addTechnician }}>
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